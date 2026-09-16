import Foundation
import SwiftUI

@MainActor
final class ForgeBotSession: ObservableObject {
    @Published var messages: [ChatMessage] = []
    @Published var draft: String = ""
    @Published var isSending = false
    @Published var lastError: String?
    @Published var showPanel: Bool
    @Published var includeFile: Bool
    @Published var includeSelection: Bool
    @Published var preferOllama: Bool
    @Published var ollamaModel: String = ""
    @Published var ollamaModels: [String] = []
    @Published var ollamaReady = false
    @Published var engineLabel: String = "ForgeBot local engine"
    @Published var showAbout = false
    @Published var composerFocusToken: Int = 0

    private let defaults = UserDefaults.standard
    private let panelKey = "localforge.bot.showPanel"
    private let fileKey = "localforge.bot.includeFile"
    private let selectionKey = "localforge.bot.includeSelection"
    private let ollamaKey = "localforge.bot.preferOllama"

    init() {
        showPanel = UserDefaults.standard.object(forKey: "localforge.bot.showPanel") as? Bool ?? true
        includeFile = UserDefaults.standard.object(forKey: "localforge.bot.includeFile") as? Bool ?? true
        includeSelection = UserDefaults.standard.object(forKey: "localforge.bot.includeSelection") as? Bool ?? true
        preferOllama = UserDefaults.standard.object(forKey: "localforge.bot.preferOllama") as? Bool ?? true
    }

    func bootstrapFirstLaunch() {
        showPanel = true
        persistPreferences()
        requestComposerFocus()
        Task { await refreshOllama() }
    }

    func persistPreferences() {
        defaults.set(showPanel, forKey: panelKey)
        defaults.set(includeFile, forKey: fileKey)
        defaults.set(includeSelection, forKey: selectionKey)
        defaults.set(preferOllama, forKey: ollamaKey)
    }

    func requestComposerFocus() {
        composerFocusToken += 1
        NotificationCenter.default.post(name: .localForgeFocusBotComposer, object: nil)
    }

    func clearChat() {
        messages = []
        lastError = nil
    }

    func refreshOllama() async {
        let discovery = await LocalOllama.probe()
        ollamaReady = discovery.available && !discovery.models.isEmpty
        ollamaModels = discovery.models
        if ollamaReady {
            if ollamaModel.isEmpty || !discovery.models.contains(ollamaModel) {
                ollamaModel = discovery.models[0]
            }
            engineLabel = preferOllama
                ? "Ollama localhost · \(ollamaModel)"
                : "ForgeBot local engine"
        } else {
            engineLabel = "ForgeBot local engine"
        }
    }

    func send(filePath: String?, fileText: String?, selection: String?) {
        let text = draft.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty else { return }
        guard !isSending else { return }

        var userContent = text
        if includeFile, let filePath, let fileText, !fileText.isEmpty {
            userContent += "\n\n---\nCurrent file (\(filePath)):\n```\n\(LocalReplyEngine.clipped(fileText))\n```"
        }
        if includeSelection {
            let selected = (selection ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
            if !selected.isEmpty {
                userContent += "\n\n---\nEditor selection:\n```\n\(LocalReplyEngine.clipped(selected))\n```"
            }
        }

        messages.append(ChatMessage(role: "user", content: userContent))
        draft = ""
        isSending = true
        lastError = nil
        persistPreferences()

        let context = LocalReplyEngine.Context(
            filePath: includeFile ? filePath : nil,
            fileText: includeFile ? fileText : nil,
            selection: includeSelection ? selection : nil,
            engineLabel: engineLabel
        )
        let useOllama = preferOllama && ollamaReady && !ollamaModel.isEmpty
        let modelName = ollamaModel

        Task {
            let reply: String
            if useOllama {
                do {
                    reply = try await LocalOllama.complete(model: modelName, userText: userContent)
                    engineLabel = "Ollama localhost · \(modelName)"
                } catch {
                    lastError = "Ollama unreachable — using ForgeBot local engine."
                    reply = LocalReplyEngine.reply(to: text, context: context)
                    engineLabel = "ForgeBot local engine"
                }
            } else {
                reply = LocalReplyEngine.reply(to: text, context: context)
                engineLabel = "ForgeBot local engine"
            }
            messages.append(ChatMessage(role: "assistant", content: reply))
            isSending = false
            requestComposerFocus()
        }
    }
}
