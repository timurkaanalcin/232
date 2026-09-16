import Foundation

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
