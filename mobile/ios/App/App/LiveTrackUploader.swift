import Foundation

struct LiveTrackFix {
    var lat: Double
    var lng: Double
    var acc: Double
    var alt: Double?
    var spd: Double?
    var hdg: Double?
    var ts: Int
}

/// Sends consented fixes while the web view is suspended. One outstanding body,
/// retried with backoff while sharing stays on. Coordinates are never logged.
final class LiveTrackUploader {
    private static let retryDelays: [TimeInterval] = [5, 15, 30, 60]
    private static let redirectBlocker = RedirectBlocker()
    private static let session: URLSession = {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 20
        config.timeoutIntervalForResource = 30
        config.waitsForConnectivity = true
        config.requestCachePolicy = .reloadIgnoringLocalCacheData
        return URLSession(configuration: config, delegate: redirectBlocker, delegateQueue: nil)
    }()

    private let queue = DispatchQueue(label: "app.livetrack.mobile.upload")
    private var generation = 0
    private var inFlight = false
    private var retryAttempt = 0
    private var retryWork: DispatchWorkItem?
    private var pendingBody: Data?
    private var pendingId = UUID()
    private var origin: String?
    private var sessionId: String?
    var cookieHeader: ((String, @escaping (String?) -> Void) -> Void)?
    var onAuthFailure: (() -> Void)?

    func arm(origin: String, sessionId: String) {
        queue.async {
            self.origin = origin
            self.sessionId = sessionId
        }
    }

    func update(origin: String, sessionId: String, fix: LiveTrackFix) {
        queue.async {
            guard let body = Self.encode(sessionId: sessionId, fix: fix) else { return }
            self.origin = origin
            self.sessionId = sessionId
            self.pendingBody = body
            self.pendingId = UUID()
            if self.inFlight || self.retryWork != nil {
                return
            }
            self.sendLocked()
        }
    }

    func stop(endServerSession: Bool) {
        queue.async {
            let origin = self.origin
            let sessionId = self.sessionId
            self.generation += 1
            let gen = self.generation
            self.pendingBody = nil
            self.inFlight = false
            self.retryAttempt = 0
            self.retryWork?.cancel()
            self.retryWork = nil
            guard endServerSession, let origin, let sessionId else { return }
            self.sendStop(gen: gen, origin: origin, sessionId: sessionId, attempt: 1)
        }
    }

    private func sendLocked() {
        guard let origin, let body = pendingBody else { return }
        let gen = generation
        let sentId = pendingId
        inFlight = true
        post(url: origin + "/api/location/update", origin: origin, body: body) { [weak self] code in
            self?.queue.async {
                guard let self, gen == self.generation else { return }
                self.inFlight = false
                if (200..<300).contains(code) {
                    self.retryAttempt = 0
                    if self.pendingId == sentId {
                        self.pendingBody = nil
                    }
                    if self.pendingBody != nil {
                        self.sendLocked()
                    }
                    return
                }
                if code == 401 || code == 403 || code == 404 {
                    self.pendingBody = nil
                    DispatchQueue.main.async {
                        self.onAuthFailure?()
                    }
                    return
                }
                if code == 400 {
                    if self.pendingId == sentId {
                        self.pendingBody = nil
                    }
                    self.retryAttempt = 0
                    return
                }
                self.scheduleRetry(gen: gen)
            }
        }
    }

    private func scheduleRetry(gen: Int) {
        guard gen == generation else { return }
        retryAttempt += 1
        let delay = Self.retryDelays[min(retryAttempt - 1, Self.retryDelays.count - 1)]
        let work = DispatchWorkItem { [weak self] in
            guard let self else { return }
            self.retryWork = nil
            guard gen == self.generation, self.pendingBody != nil else { return }
            self.sendLocked()
        }
        retryWork?.cancel()
        retryWork = work
        queue.asyncAfter(deadline: .now() + delay, execute: work)
    }

    private func sendStop(gen: Int, origin: String, sessionId: String, attempt: Int) {
        guard gen == generation else { return }
        let body = Data("{}".utf8)
        post(url: origin + "/api/location/sessions/" + sessionId + "/stop", origin: origin, body: body) { [weak self] code in
            self?.queue.async {
                guard let self, gen == self.generation else { return }
                let ok = (200..<300).contains(code)
                let gone = code == 401 || code == 403 || code == 404
                if ok || gone || attempt >= Self.retryDelays.count {
                    return
                }
                let delay = Self.retryDelays[min(attempt - 1, Self.retryDelays.count - 1)]
                self.queue.asyncAfter(deadline: .now() + delay) {
                    self.sendStop(gen: gen, origin: origin, sessionId: sessionId, attempt: attempt + 1)
                }
            }
        }
    }

    private func post(url: String, origin: String, body: Data, done: @escaping (Int) -> Void) {
        guard let endpoint = URL(string: url) else {
            done(-1)
            return
        }
        let send: (String?) -> Void = { cookie in
            var request = URLRequest(url: endpoint)
            request.httpMethod = "POST"
            request.httpBody = body
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            request.setValue("application/json", forHTTPHeaderField: "Accept")
            request.setValue(origin, forHTTPHeaderField: "Origin")
            request.setValue("LiveTrackiOS/1.0", forHTTPHeaderField: "User-Agent")
            if let cookie, !cookie.isEmpty {
                request.setValue(cookie, forHTTPHeaderField: "Cookie")
            }
            Self.session.dataTask(with: request) { _, response, error in
                if error != nil {
                    done(-1)
                    return
                }
                done((response as? HTTPURLResponse)?.statusCode ?? -1)
            }.resume()
        }
        if let cookieHeader {
            cookieHeader(origin, send)
        } else {
            send(nil)
        }
    }

    private static func encode(sessionId: String, fix: LiveTrackFix) -> Data? {
        var position: [String: Any] = [
            "lat": fix.lat,
            "lng": fix.lng,
            "acc": min(max(fix.acc, 0), 100_000),
            "ts": fix.ts,
        ]
        if let alt = fix.alt { position["alt"] = alt }
        if let spd = fix.spd { position["spd"] = spd }
        if let hdg = fix.hdg { position["hdg"] = hdg }
        let payload: [String: Any] = ["sessionId": sessionId, "position": position]
        return try? JSONSerialization.data(withJSONObject: payload)
    }

    private final class RedirectBlocker: NSObject, URLSessionTaskDelegate {
        func urlSession(
            _ session: URLSession,
            task: URLSessionTask,
            willPerformHTTPRedirection response: HTTPURLResponse,
            newRequest request: URLRequest,
            completionHandler: @escaping (URLRequest?) -> Void
        ) {
            completionHandler(nil)
        }
    }
}
