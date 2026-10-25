import Foundation

/// Same origin rules as the Android shell and `src/lib/server-url.ts`.
enum LiveTrackServerUrl {
    static let defaultsKey = "livetrack.server_url"

    static func normalize(_ raw: String?) -> String? {
        guard let trimmed = raw?.trimmingCharacters(in: .whitespacesAndNewlines), !trimmed.isEmpty else {
            return nil
        }
        guard let components = URLComponents(string: trimmed) else {
            return nil
        }
        guard let scheme = components.scheme?.lowercased(), scheme == "https" || scheme == "http" else {
            return nil
        }
        guard let host = components.host, !host.isEmpty else {
            return nil
        }
        if components.user != nil || components.password != nil || components.query != nil || components.fragment != nil {
            return nil
        }
        if !components.path.isEmpty && components.path != "/" {
            return nil
        }
        var origin = "\(scheme)://\(host)"
        if let port = components.port {
            origin += ":\(port)"
        }
        return origin
    }

    static func overrideUrl() -> String? {
        normalize(UserDefaults.standard.string(forKey: defaultsKey))
    }

    static func bakedUrl() -> String? {
        guard let file = Bundle.main.url(forResource: "livetrack_server_url", withExtension: "txt"),
              let text = try? String(contentsOf: file, encoding: .utf8) else {
            return nil
        }
        return normalize(text)
    }

    static func resolve() -> String? {
        overrideUrl() ?? bakedUrl()
    }

    static func source() -> String {
        if overrideUrl() != nil { return "user" }
        if bakedUrl() != nil { return "build" }
        return "none"
    }
}
