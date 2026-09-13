import AppKit
import Foundation
import SwiftUI

@MainActor
final class GrokSession: ObservableObject {
    static let consoleURL = URL(string: "https://console.x.ai")!

    @Published var messages: [GrokClient.ChatMessage] = []
    @Published var draft: String = ""
    @Published var isSending = false
    @Published var lastError: String?
    @Published var showPanel: Bool
    /// Always attach the open file when one exists — no extra toggle required to chat.
    @Published var includeFile: Bool
    /// Always attach a non-empty editor selection — no extra toggle required to chat.
    @Published var includeSelection: Bool
    @Published var model: String
    @Published var availableModels: [String]
    @Published var keyField: String = ""
    @Published var showSettings = false
    @Published var showOnboarding = false
    @Published var keyStatus: String
    @Published var hasKey: Bool
    @Published var composerFocusToken: Int = 0

    private let defaults = UserDefaults.standard
    private let modelKey = "localforge.grok.model"
    private let panelKey = "localforge.grok.showPanel"
    private let fileKey = "localforge.grok.includeFile"
    private let selectionKey = "localforge.grok.includeSelection"

    init() {
        let storedModel = UserDefaults.standard.string(forKey: "localforge.grok.model")?.trimmingCharacters(in: .whitespacesAndNewlines)
        model = (storedModel?.isEmpty == false) ? storedModel! : GrokClient.defaultModel
        availableModels = [GrokClient.defaultModel]
        showPanel = UserDefaults.standard.object(forKey: "localforge.grok.showPanel") as? Bool ?? true
        includeFile = UserDefaults.standard.object(forKey: "localforge.grok.includeFile") as? Bool ?? true
        includeSelection = UserDefaults.standard.object(forKey: "localforge.grok.includeSelection") as? Bool ?? true
        hasKey = GrokSecrets.hasStoredKey()
        keyStatus = GrokSecrets.keySourceDescription()
    }

    func bootstrapFirstLaunch() {
        refreshKeyStatus()
        showPanel = true
        persistPreferences()
        if hasKey {
            showOnboarding = false
            requestComposerFocus()
            Task { await refreshModels() }
        } else {
            showOnboarding = true
            showSettings = false
        }
    }

    func refreshKeyStatus() {
        hasKey = GrokSecrets.hasStoredKey()
        keyStatus = GrokSecrets.keySourceDescription()
    }

    func persistPreferences() {
        defaults.set(model, forKey: modelKey)
        defaults.set(showPanel, forKey: panelKey)
        defaults.set(includeFile, forKey: fileKey)
        defaults.set(includeSelection, forKey: selectionKey)
    }

    func requestComposerFocus() {
        composerFocusToken += 1
        NotificationCenter.default.post(name: .localForgeFocusGrokComposer, object: nil)
    }

    func openXAIConsole() {
        NSWorkspace.shared.open(Self.consoleURL)
    }

    func saveAPIKeyFromField() throws {
        let trimmed = keyField.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else {
            lastError = "Paste your xAI API key first."
            return
        }
        try GrokSecrets.saveToKeychain(trimmed)
        keyField = ""
        lastError = nil
        refreshKeyStatus()
    }

    func finishOnboarding() throws {
        try saveAPIKeyFromField()
        guard hasKey else { return }
        showOnboarding = false
        showPanel = true
        persistPreferences()
        requestComposerFocus()
        Task { await refreshModels() }
    }

    func clearAPIKey() {
        GrokSecrets.deleteFromKeychain()
        keyField = ""
        refreshKeyStatus()
        if !hasKey {
            showOnboarding = true
        }
    }

    func clearChat() {
        messages = []
        lastError = nil
    }

    func refreshModels() async {
        guard let apiKey = GrokSecrets.resolvedAPIKey(), !apiKey.isEmpty else { return }
        do {
            let ids = try await GrokClient.listModels(apiKey: apiKey)
            let grokIds = ids
                .filter { $0.localizedCaseInsensitiveContains("grok") }
                .sorted()
            guard !grokIds.isEmpty else { return }
            availableModels = grokIds
            if !grokIds.contains(model) {
                model = grokIds.contains(GrokClient.defaultModel)
                    ? GrokClient.defaultModel
                    : grokIds[0]
                persistPreferences()
            }
        } catch {
            // Chat still works with the default / last-used model id.
        }
    }

    func send(filePath: String?, fileText: String?, selection: String?) {
        let text = draft.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty else { return }
        guard !isSending else { return }
        guard let apiKey = GrokSecrets.resolvedAPIKey(), !apiKey.isEmpty else {
            lastError = "xAI anahtarı yok. Üye olun, yapıştırın, sohbete başlayın."
            showOnboarding = true
            return
        }

        var userContent = text
        if includeFile, let filePath, let fileText, !fileText.isEmpty {
            userContent += "\n\n---\nCurrent file (\(filePath)):\n```\n\(GrokClient.clipped(fileText))\n```"
        }
        if includeSelection {
            let selected = (selection ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
            if !selected.isEmpty {
                userContent += "\n\n---\nEditor selection:\n```\n\(GrokClient.clipped(selected))\n```"
            }
        }

        let userMessage = GrokClient.ChatMessage(role: "user", content: userContent)
        messages.append(userMessage)
        draft = ""
        isSending = true
        lastError = nil
        persistPreferences()

        let history = makeAPIMessages()
        let modelName = model.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
            ? GrokClient.defaultModel
            : model.trimmingCharacters(in: .whitespacesAndNewlines)

        Task {
            do {
                let reply = try await GrokClient.complete(apiKey: apiKey, model: modelName, messages: history)
                messages.append(GrokClient.ChatMessage(role: "assistant", content: reply))
            } catch {
                lastError = error.localizedDescription
                messages.append(GrokClient.ChatMessage(
                    role: "assistant",
                    content: "Request failed: \(error.localizedDescription)"
                ))
            }
            isSending = false
            requestComposerFocus()
        }
    }

    private func makeAPIMessages() -> [GrokClient.ChatMessage] {
        var list: [GrokClient.ChatMessage] = [
            GrokClient.ChatMessage(
                role: "system",
                content: """
                You are Grok, built by xAI. You are helping inside LocalForge, an independent macOS folder workspace \
                (file tree, UTF-8 editor, local shell). You are not Cursor and you do not use Cursor tools or protocols. \
                Answer using the user's question and any file/selection context they attached.
                """
            )
        ]
        list.append(contentsOf: messages.filter { $0.role == "user" || $0.role == "assistant" })
        return list
    }
}
