import Foundation

/// Optional bonus: talk to Ollama on this Mac only. Never any other host.
enum LocalOllama {
    static let loopbackHost = "127.0.0.1"
    static let port = 11434
    static let tagsURL = URL(string: "http://127.0.0.1:11434/api/tags")!
    static let chatURL = URL(string: "http://127.0.0.1:11434/api/chat")!

    struct Discovery {
        var available: Bool
        var models: [String]
        var label: String
    }

    struct APIError: LocalizedError {
        let message: String
        var errorDescription: String? { message }
    }

    static func probe(timeout: TimeInterval = 1.5) async -> Discovery {
        do {
            let ids = try await listModels(timeout: timeout)
            if ids.isEmpty {
                return Discovery(available: true, models: [], label: "Ollama on localhost (no models pulled)")
            }
            return Discovery(available: true, models: ids, label: "Ollama localhost · \(ids[0])")
        } catch {
            return Discovery(available: false, models: [], label: "ForgeBot local engine")
        }
    }

    static func listModels(timeout: TimeInterval) async throws -> [String] {
        var request = URLRequest(url: tagsURL)
        request.httpMethod = "GET"
        request.timeoutInterval = timeout
        let (data, response) = try await URLSession.shared.data(for: request)
        let status = (response as? HTTPURLResponse)?.statusCode ?? 0
        guard (200..<300).contains(status) else {
            throw APIError(message: "Ollama tags HTTP \(status)")
        }
        let parsed = try JSONDecoder().decode(TagsResponse.self, from: data)
        return (parsed.models ?? []).map(\.name).filter { !$0.isEmpty }
    }

    static func complete(model: String, userText: String, timeout: TimeInterval = 90) async throws -> String {
        guard chatURL.host == loopbackHost, chatURL.port == port else {
            throw APIError(message: "Ollama is allowed on 127.0.0.1:\(port) only.")
        }
        var request = URLRequest(url: chatURL)
        request.httpMethod = "POST"
        request.timeoutInterval = timeout
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let payload: [String: Any] = [
            "model": model,
            "stream": false,
            "messages": [
                [
                    "role": "system",
                    "content": """
                    You are ForgeBot, an original local assistant inside the LocalForge macOS app. \
                    You are not Grok, not an xAI product, and not Cursor. Stay on the user's question \
                    and any file or selection they attached. If you lack context, say so.
                    """
                ],
                ["role": "user", "content": userText]
            ]
        ]
        request.httpBody = try JSONSerialization.data(withJSONObject: payload)
        let (data, response) = try await URLSession.shared.data(for: request)
        let status = (response as? HTTPURLResponse)?.statusCode ?? 0
        if let parsed = try? JSONDecoder().decode(ChatResponse.self, from: data),
           let text = parsed.message?.content?.trimmingCharacters(in: .whitespacesAndNewlines),
           !text.isEmpty {
            return text
        }
        if let raw = String(data: data, encoding: .utf8), !raw.isEmpty {
            throw APIError(message: "Ollama HTTP \(status): \(raw.prefix(240))")
        }
        throw APIError(message: "Ollama HTTP \(status) with empty body.")
    }

    private struct TagsResponse: Decodable {
        struct Item: Decodable { let name: String }
        let models: [Item]?
    }

    private struct ChatResponse: Decodable {
        struct Message: Decodable { let content: String? }
        let message: Message?
    }
}
