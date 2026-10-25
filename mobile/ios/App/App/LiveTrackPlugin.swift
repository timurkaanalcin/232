import Capacitor
import CoreLocation
import UIKit

/// Location starts only after the user taps Start sharing.
/// While that session is on, updates continue in the background and when the
/// screen is locked. The blue status-bar indicator stays visible
/// (`showsBackgroundLocationIndicator`). When-in-use authorization is enough
/// for that. Always authorization is not requested: it would let iOS relaunch
/// the app after the user force-quits it, and sharing must not start by itself.
@objc(LiveTrackPlugin)
public class LiveTrackPlugin: CAPPlugin, CAPBridgedPlugin, CLLocationManagerDelegate {
    public let identifier = "LiveTrackPlugin"
    public let jsName = "LiveTrack"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getCurrentPosition", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "start", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stop", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "isActive", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "backgroundAccess", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "requestBackgroundAccess", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getServerUrl", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setServerUrl", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "clearServerUrl", returnType: CAPPluginReturnPromise),
    ]

    private let sharingDistanceFilter: CLLocationDistance = 15
    private let heartbeatInterval: TimeInterval = 45
    private let manager = CLLocationManager()
    private let uploader = LiveTrackUploader()
    private let sessionIdPattern = try! NSRegularExpression(
        pattern: "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
    )
    private var pendingCall: CAPPluginCall?
    private var pendingAction: String?
    private var oneShotCall: CAPPluginCall?
    private var sharing = false
    private var waitingForFix = false
    private var fixSettled = false
    private var timeoutWork: DispatchWorkItem?
    private var heartbeat: Timer?
    private var shareSessionId: String?
    private var shareOrigin: String?
    private var latestLocation: CLLocation?
    private var lastUploadedLocation: CLLocation?
    private var lastNativeUploadAt = Date.distantPast

    override public func load() {
        manager.delegate = self
        manager.desiredAccuracy = kCLLocationAccuracyNearestTenMeters
        manager.distanceFilter = sharingDistanceFilter
        manager.activityType = .otherNavigation
        manager.pausesLocationUpdatesAutomatically = true
        manager.allowsBackgroundLocationUpdates = false
        manager.showsBackgroundLocationIndicator = false
        uploader.cookieHeader = { [weak self] origin, done in
            guard let plugin = self else {
                done(nil)
                return
            }
            plugin.cookieHeader(origin, completion: done)
        }
        uploader.onAuthFailure = { [weak self] in
            self?.stopSharing(reason: "session_ended", notify: true, endServerSession: false)
        }
    }

    @objc func getCurrentPosition(_ call: CAPPluginCall) {
        ensurePermission(call, action: "fix")
    }

    @objc func start(_ call: CAPPluginCall) {
        guard let sessionId = call.getString("sessionId"), isSessionId(sessionId) else {
            call.reject("A valid sharing session is required before location collection starts.")
            return
        }
        guard LiveTrackServerUrl.normalize(call.getString("origin")) != nil else {
            call.reject("The LiveTrack server address is invalid.")
            return
        }
        ensurePermission(call, action: "start")
    }

    @objc func stop(_ call: CAPPluginCall) {
        stopSharing(reason: "user", notify: true, endServerSession: true)
        call.resolve()
    }

    @objc func isActive(_ call: CAPPluginCall) {
        call.resolve(["active": sharing])
    }

    /// iOS keeps background updates with when-in-use permission and the blue indicator.
    /// This does not show a permission prompt.
    @objc func backgroundAccess(_ call: CAPPluginCall) {
        call.resolve(["status": "not_required"])
    }

    @objc func requestBackgroundAccess(_ call: CAPPluginCall) {
        call.resolve(["granted": true])
    }

    @objc func getServerUrl(_ call: CAPPluginCall) {
        call.resolve([
            "url": LiveTrackServerUrl.resolve() ?? "",
            "source": LiveTrackServerUrl.source(),
        ])
    }

    @objc func setServerUrl(_ call: CAPPluginCall) {
        guard let url = LiveTrackServerUrl.normalize(call.getString("url")) else {
            call.reject("Enter an http or https URL with a host and no path.")
            return
        }
        stopSharing(reason: "user", notify: false, endServerSession: true)
        UserDefaults.standard.set(url, forKey: LiveTrackServerUrl.defaultsKey)
        call.resolve()
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.15) { [weak self] in
            self?.reloadShell()
        }
    }

    @objc func clearServerUrl(_ call: CAPPluginCall) {
        stopSharing(reason: "user", notify: false, endServerSession: true)
        UserDefaults.standard.removeObject(forKey: LiveTrackServerUrl.defaultsKey)
        call.resolve()
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.15) { [weak self] in
            self?.reloadShell()
        }
    }

    public func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        let status = manager.authorizationStatus
        if sharing && status != .authorizedWhenInUse && status != .authorizedAlways && status != .notDetermined {
            stopSharing(reason: "permission_denied", notify: true, endServerSession: true)
        }
        guard let call = pendingCall, let action = pendingAction else {
            return
        }
        if status == .notDetermined {
            return
        }
        pendingCall = nil
        pendingAction = nil
        if status == .authorizedWhenInUse || status == .authorizedAlways {
            DispatchQueue.main.async {
                self.dispatch(action, call: call)
            }
        } else {
            call.reject(
                "Location permission was denied. LiveTrack only asks after you choose to share. You can allow it in Settings."
            )
        }
    }

    public func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let location = locations.last, location.horizontalAccuracy >= 0 else {
            return
        }
        latestLocation = location
        if waitingForFix, let call = oneShotCall {
            settleFix(call, location: location, error: nil)
        }
        guard sharing else { return }
        notifyListeners("location", data: payload(location), retainUntilConsumed: true)
        if UIApplication.shared.applicationState != .active {
            uploadIfDue(location, force: false)
        }
    }

    public func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        if let code = (error as? CLError)?.code, code == .denied {
            if waitingForFix, let call = oneShotCall {
                settleFix(call, location: nil, error: "Location permission was denied. LiveTrack only asks after you choose to share. You can allow it in Settings.")
            }
            stopSharing(reason: "permission_denied", notify: true, endServerSession: true)
            return
        }
        if waitingForFix, let call = oneShotCall {
            settleFix(call, location: nil, error: "Location could not be read. Turn on Location Services and try again.")
        }
    }

    private func ensurePermission(_ call: CAPPluginCall, action: String) {
        switch manager.authorizationStatus {
        case .authorizedWhenInUse, .authorizedAlways:
            dispatch(action, call: call)
        case .notDetermined:
            pendingCall = call
            pendingAction = action
            manager.requestWhenInUseAuthorization()
        default:
            call.reject(
                "Location permission was denied. LiveTrack only asks after you choose to share. You can allow it in Settings."
            )
        }
    }

    private func dispatch(_ action: String, call: CAPPluginCall) {
        if action == "start" {
            guard CLLocationManager.locationServicesEnabled() else {
                call.reject("Location services are turned off. Enable them in Settings and try again.")
                return
            }
            guard let sessionId = call.getString("sessionId"),
                  let origin = LiveTrackServerUrl.normalize(call.getString("origin"))
            else {
                call.reject("A valid sharing session is required before location collection starts.")
                return
            }
            shareSessionId = sessionId
            shareOrigin = origin
            sharing = true
            uploader.arm(origin: origin, sessionId: sessionId)
            beginBackgroundUpdates()
            call.resolve()
            return
        }
        beginOneShot(call)
    }

    private func beginBackgroundUpdates() {
        manager.desiredAccuracy = kCLLocationAccuracyNearestTenMeters
        manager.distanceFilter = sharingDistanceFilter
        manager.activityType = .otherNavigation
        manager.pausesLocationUpdatesAutomatically = false
        manager.showsBackgroundLocationIndicator = true
        manager.allowsBackgroundLocationUpdates = true
        manager.startUpdatingLocation()
        startHeartbeat()
    }

    private func beginOneShot(_ call: CAPPluginCall) {
        guard CLLocationManager.locationServicesEnabled() else {
            call.reject("Location services are turned off. Enable them in Settings and try again.")
            return
        }
        fixSettled = false
        waitingForFix = true
        oneShotCall = call
        timeoutWork?.cancel()
        let work = DispatchWorkItem { [weak self] in
            guard let self, self.waitingForFix, let pending = self.oneShotCall else { return }
            self.settleFix(
                pending,
                location: nil,
                error: "Location request timed out. Try again with Location Services on."
            )
        }
        timeoutWork = work
        DispatchQueue.main.asyncAfter(deadline: .now() + 30, execute: work)
        manager.distanceFilter = kCLDistanceFilterNone
        manager.desiredAccuracy = kCLLocationAccuracyNearestTenMeters
        if !sharing {
            manager.allowsBackgroundLocationUpdates = false
            manager.showsBackgroundLocationIndicator = false
        }
        manager.startUpdatingLocation()
    }

    private func settleFix(_ call: CAPPluginCall, location: CLLocation?, error: String?) {
        if fixSettled {
            return
        }
        fixSettled = true
        waitingForFix = false
        oneShotCall = nil
        timeoutWork?.cancel()
        if sharing {
            manager.distanceFilter = sharingDistanceFilter
        } else {
            manager.stopUpdatingLocation()
        }
        if let location {
            call.resolve(payload(location))
        } else {
            call.reject(error ?? "Location could not be read.")
        }
    }

    private func startHeartbeat() {
        heartbeat?.invalidate()
        let timer = Timer(timeInterval: 15, repeats: true) { [weak self] _ in
            self?.pumpBackground()
        }
        RunLoop.main.add(timer, forMode: .common)
        heartbeat = timer
        NotificationCenter.default.removeObserver(self, name: UIApplication.didEnterBackgroundNotification, object: nil)
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(appBackgrounded),
            name: UIApplication.didEnterBackgroundNotification,
            object: nil
        )
    }

    @objc private func appBackgrounded() {
        guard sharing, let location = latestLocation else { return }
        uploadIfDue(location, force: true)
    }

    private func pumpBackground() {
        guard sharing, UIApplication.shared.applicationState != .active else { return }
        if let location = latestLocation, Date().timeIntervalSince(lastNativeUploadAt) >= heartbeatInterval {
            uploadIfDue(location, force: true)
            return
        }
        let stale = latestLocation.map { Date().timeIntervalSince($0.timestamp) >= 40 } ?? true
        if stale {
            manager.requestLocation()
        }
    }

    private func uploadIfDue(_ location: CLLocation, force: Bool) {
        guard let origin = shareOrigin, let sessionId = shareSessionId else { return }
        let elapsed = Date().timeIntervalSince(lastNativeUploadAt)
        let moved = lastUploadedLocation.map { location.distance(from: $0) >= sharingDistanceFilter } ?? true
        guard force || elapsed >= heartbeatInterval || (moved && elapsed >= 15) else { return }
        lastNativeUploadAt = Date()
        lastUploadedLocation = location
        uploader.update(origin: origin, sessionId: sessionId, fix: fix(from: location))
    }

    private func stopSharing(reason: String, notify: Bool, endServerSession: Bool) {
        let wasSharing = sharing
        sharing = false
        waitingForFix = false
        timeoutWork?.cancel()
        heartbeat?.invalidate()
        heartbeat = nil
        NotificationCenter.default.removeObserver(self, name: UIApplication.didEnterBackgroundNotification, object: nil)
        manager.stopUpdatingLocation()
        manager.allowsBackgroundLocationUpdates = false
        manager.showsBackgroundLocationIndicator = false
        manager.pausesLocationUpdatesAutomatically = true
        shareSessionId = nil
        shareOrigin = nil
        uploader.stop(endServerSession: endServerSession && wasSharing)
        if notify && wasSharing {
            notifyListeners("stopped", data: ["reason": reason])
        }
    }

    private func fix(from location: CLLocation) -> LiveTrackFix {
        var fix = LiveTrackFix(
            lat: location.coordinate.latitude,
            lng: location.coordinate.longitude,
            acc: min(max(location.horizontalAccuracy, 0), 100_000),
            alt: nil,
            spd: nil,
            hdg: nil,
            ts: Int(location.timestamp.timeIntervalSince1970 * 1000)
        )
        if fix.ts <= 0 {
            fix.ts = Int(Date().timeIntervalSince1970 * 1000)
        }
        if location.verticalAccuracy >= 0 {
            fix.alt = location.altitude
        }
        if location.speed >= 0 && location.speed <= 600 {
            fix.spd = location.speed
        }
        if location.course >= 0 && location.course <= 360 {
            fix.hdg = location.course
        }
        return fix
    }

    private func payload(_ location: CLLocation) -> [String: Any] {
        let fix = fix(from: location)
        var data: [String: Any] = [
            "lat": fix.lat,
            "lng": fix.lng,
            "acc": fix.acc,
            "ts": fix.ts,
        ]
        if let alt = fix.alt { data["alt"] = alt }
        if let spd = fix.spd { data["spd"] = spd }
        if let hdg = fix.hdg { data["hdg"] = hdg }
        return data
    }

    private func cookieHeader(_ origin: String, completion: @escaping (String?) -> Void) {
        DispatchQueue.main.async { [weak self] in
            guard let host = URL(string: origin)?.host,
                  let store = self?.bridge?.webView?.configuration.websiteDataStore.httpCookieStore
            else {
                completion(nil)
                return
            }
            store.getAllCookies { cookies in
                let header = cookies.compactMap { cookie -> String? in
                    let domain = cookie.domain.hasPrefix(".") ? String(cookie.domain.dropFirst()) : cookie.domain
                    let matches = host == domain || host.hasSuffix("." + domain)
                    guard matches else { return nil }
                    return "\(cookie.name)=\(cookie.value)"
                }.joined(separator: "; ")
                completion(header.isEmpty ? nil : header)
            }
        }
    }

    private func isSessionId(_ value: String) -> Bool {
        let range = NSRange(value.startIndex..., in: value)
        return sessionIdPattern.firstMatch(in: value, options: [], range: range) != nil
    }

    private func reloadShell() {
        guard let window = bridge?.viewController?.view.window else {
            return
        }
        let storyboard = UIStoryboard(name: "Main", bundle: nil)
        window.rootViewController = storyboard.instantiateInitialViewController()
        window.makeKeyAndVisible()
    }
}
