import Capacitor
import CoreLocation
import UIKit

/// When-in-use location only. The system prompt runs after the user opts in.
/// Background location and Always authorization are intentionally not requested.
@objc(LiveTrackPlugin)
public class LiveTrackPlugin: CAPPlugin, CAPBridgedPlugin, CLLocationManagerDelegate {
    public let identifier = "LiveTrackPlugin"
    public let jsName = "LiveTrack"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getCurrentPosition", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "start", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stop", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "isActive", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getServerUrl", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setServerUrl", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "clearServerUrl", returnType: CAPPluginReturnPromise),
    ]

    private let manager = CLLocationManager()
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

    override public func load() {
        manager.delegate = self
        manager.desiredAccuracy = kCLLocationAccuracyBest
        manager.distanceFilter = kCLDistanceFilterNone
        manager.allowsBackgroundLocationUpdates = false
        manager.pausesLocationUpdatesAutomatically = true
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
        sharing = false
        waitingForFix = false
        timeoutWork?.cancel()
        manager.stopUpdatingLocation()
        notifyListeners("stopped", data: ["reason": "user"])
        call.resolve()
    }

    @objc func isActive(_ call: CAPPluginCall) {
        call.resolve(["active": sharing])
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
        sharing = false
        manager.stopUpdatingLocation()
        UserDefaults.standard.set(url, forKey: LiveTrackServerUrl.defaultsKey)
        call.resolve()
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.15) { [weak self] in
            self?.reloadShell()
        }
    }

    @objc func clearServerUrl(_ call: CAPPluginCall) {
        sharing = false
        manager.stopUpdatingLocation()
        UserDefaults.standard.removeObject(forKey: LiveTrackServerUrl.defaultsKey)
        call.resolve()
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.15) { [weak self] in
            self?.reloadShell()
        }
    }

    public func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        guard let call = pendingCall, let action = pendingAction else {
            return
        }
        let status = manager.authorizationStatus
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
        if waitingForFix, let call = oneShotCall {
            settleFix(call, location: location, error: nil)
        }
        if sharing {
            notifyListeners("location", data: payload(location), retainUntilConsumed: true)
        }
    }

    public func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
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
            sharing = true
            manager.startUpdatingLocation()
            call.resolve()
            return
        }
        beginOneShot(call)
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
        if !sharing {
            manager.stopUpdatingLocation()
        }
        if let location {
            call.resolve(payload(location))
        } else {
            call.reject(error ?? "Location could not be read.")
        }
    }

    private func payload(_ location: CLLocation) -> [String: Any] {
        var data: [String: Any] = [
            "lat": location.coordinate.latitude,
            "lng": location.coordinate.longitude,
            "acc": min(max(location.horizontalAccuracy, 0), 100_000),
            "ts": Int(location.timestamp.timeIntervalSince1970 * 1000),
        ]
        if location.verticalAccuracy >= 0 {
            data["alt"] = location.altitude
        }
        if location.speed >= 0 && location.speed <= 600 {
            data["spd"] = location.speed
        }
        if location.course >= 0 && location.course <= 360 {
            data["hdg"] = location.course
        }
        return data
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
