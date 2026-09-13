import Foundation

/// Official xAI Chat Completions API only. No Cursor gateway or agent protocol.
enum GrokClient {
    static let defaultEndpoint = URL(string: "https://api.x.ai/v1/chat/completions")!
    /// Documented on xAI Chat Completions (https://docs.x.ai) as of 2026-09.
    static let defaultModel = "grok-4.6"
    static let maxContextChars = 80_000

    struct ChatMessage: Identifiable, Equatable {
        let id: UUID
        var role: String
        var content: String

        init(id: UUID = UUID(), role: String, content: String) {
            self.id = id
            self.role = role
            self.content = content
        }
    }

    struct APIError: LocalizedError {
        let message: String
        var errorDescription: String? { message }
    }

    static func complete(
        apiKey: String,
        model: String,
        messages: [ChatMessage],
        timeout: TimeInterval = 180
    ) async throws -> String {
        var request = URLRequest(url: defaultEndpoint)
        request.httpMethod = "POST"
        request.timeoutInterval = timeout
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")

        let payload: [String: Any] = [
            "model": model,
            "stream": false,
            "messages": messages.map { ["role": $0.role, "content": $0.content] }
        ]
        request.httpBody = try JSONSerialization.data(withJSONObject: payload)

        let (data, response) = try await URLSession.shared.data(for: request)
        let http = response as? HTTPURLResponse
        let status = http?.statusCode ?? 0

        if let parsed = try? JSONDecoder().decode(CompletionResponse.self, from: data) {
            if let text = parsed.choices?.first?.message?.content, !text.isEmpty {
                return text
            }
            if let err = parsed.error?.message, !err.isEmpty {
                throw APIError(message: err)
            }
        }

        if let raw = String(data: data, encoding: .utf8), !raw.isEmpty {
            if (200..<300).contains(status) {
                throw APIError(message: "Empty Grok reply (HTTP \(status)).")
            }
            throw APIError(message: "xAI HTTP \(status): \(raw.prefix(400))")
        }
        throw APIError(message: "xAI HTTP \(status) with empty body.")
    }

    static func clipped(_ text: String) -> String {
        if text.count <= maxContextChars { return text }
        let idx = text.index(text.startIndex, offsetBy: maxContextChars)
        return String(text[..<idx]) + "\n\n[truncated to \(maxContextChars) characters]"
    }

    private struct CompletionResponse: Decodable {
        struct Choice: Decodable {
            struct Message: Decodable { let content: String? }
            let message: Message?
        }
        struct ErrorBody: Decodable { let message: String? }
        let choices: [Choice]?
        let error: ErrorBody?
    }
}
