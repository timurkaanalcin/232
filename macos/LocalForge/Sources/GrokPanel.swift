import SwiftUI
import AppKit

struct GrokPanel: View {
    @EnvironmentObject private var workspace: WorkspaceModel
    @EnvironmentObject private var grok: GrokSession
    @FocusState private var composerFocused: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            header
            Rectangle().fill(ForgeTheme.rule).frame(height: 1)
            autoContextHint
            Rectangle().fill(ForgeTheme.rule).frame(height: 1)
            transcript
            Rectangle().fill(ForgeTheme.rule).frame(height: 1)
            composer
        }
        .background(ForgeTheme.sidebar)
        .onAppear {
            if grok.hasKey {
                composerFocused = true
            }
        }
        .onChange(of: grok.composerFocusToken) { _, _ in
            composerFocused = true
        }
        .onReceive(NotificationCenter.default.publisher(for: .localForgeFocusGrokComposer)) { _ in
            composerFocused = true
        }
    }

    private var header: some View {
        HStack(spacing: 8) {
            Image(systemName: "sparkles")
                .foregroundStyle(ForgeTheme.copper)
            VStack(alignment: .leading, spacing: 1) {
                Text("Grok")
                    .font(.callout.weight(.semibold))
                    .foregroundStyle(ForgeTheme.ink)
                Text("xAI · \(grok.model)")
                    .font(.caption2)
                    .foregroundStyle(ForgeTheme.muted)
            }
            Spacer()
            if grok.availableModels.count > 1 {
                Picker("Model", selection: $grok.model) {
                    ForEach(grok.availableModels, id: \.self) { id in
                        Text(id).tag(id)
                    }
                }
                .labelsHidden()
                .frame(maxWidth: 140)
                .onChange(of: grok.model) { _, _ in grok.persistPreferences() }
            }
            Button {
                grok.clearChat()
            } label: {
                Image(systemName: "trash")
            }
            .buttonStyle(.plain)
            .help("Clear conversation")
            Button {
                grok.refreshKeyStatus()
                grok.showSettings = true
            } label: {
                Image(systemName: "key")
            }
            .buttonStyle(.plain)
            .help("xAI API key")
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(ForgeTheme.bar)
    }

    private var autoContextHint: some View {
        Text(contextHint)
            .font(.caption2)
            .foregroundStyle(ForgeTheme.muted)
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
    }

    private var contextHint: String {
        var bits: [String] = ["Just chat"]
        if let name = workspace.currentFile?.lastPathComponent {
            bits.append(name)
        }
        let n = workspace.selectedText.count
        if n > 0 {
            bits.append("\(n) selected chars")
        }
        return bits.joined(separator: " · ")
    }

    private var transcript: some View {
        Group {
            if grok.messages.isEmpty && grok.lastError == nil {
                EmptyStateView(
                    symbol: "bubble.left.and.bubble.right",
                    title: grok.hasKey ? "Ask Grok" : "Sign in, then chat",
                    message: grok.hasKey
                        ? "Type below. The open file and any selection are attached automatically."
                        : "Use Üye ol / anahtar al, paste the key once, then talk to Grok."
                )
            } else {
                ScrollViewReader { proxy in
                    ScrollView {
                        LazyVStack(alignment: .leading, spacing: 10) {
                            ForEach(grok.messages) { message in
                                messageBubble(message)
                                    .id(message.id)
                            }
                            if grok.isSending {
                                Text("Grok is writing…")
                                    .font(.caption)
                                    .foregroundStyle(ForgeTheme.muted)
                                    .id("pending")
                            }
                        }
                        .padding(12)
                    }
                    .onChange(of: grok.messages.count) { _, _ in
                        proxy.scrollTo(grok.messages.last?.id ?? UUID(), anchor: .bottom)
                    }
                }
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    private func messageBubble(_ message: GrokClient.ChatMessage) -> some View {
        let isUser = message.role == "user"
        return VStack(alignment: .leading, spacing: 4) {
            Text(isUser ? "You" : "Grok")
                .font(.caption2.weight(.semibold))
                .foregroundStyle(isUser ? ForgeTheme.copper : ForgeTheme.moss)
            Text(displayContent(message.content))
                .font(.callout)
                .foregroundStyle(ForgeTheme.ink)
                .textSelection(.enabled)
                .frame(maxWidth: .infinity, alignment: .leading)
        }
        .padding(10)
        .background(isUser ? ForgeTheme.selection : ForgeTheme.canvas)
        .overlay(
            RoundedRectangle(cornerRadius: 8)
                .stroke(ForgeTheme.rule, lineWidth: 1)
        )
        .clipShape(RoundedRectangle(cornerRadius: 8))
    }

    private func displayContent(_ content: String) -> String {
        if let range = content.range(of: "\n\n---\n") {
            return String(content[..<range.lowerBound]) + "\n\n(file/selection attached)"
        }
        return content
    }

    private var composer: some View {
        VStack(alignment: .leading, spacing: 8) {
            if let lastError = grok.lastError {
                Text(lastError)
                    .font(.caption)
                    .foregroundStyle(ForgeTheme.danger)
            }
            HStack(alignment: .bottom, spacing: 8) {
                TextField("Ask Grok…", text: $grok.draft, axis: .vertical)
                    .textFieldStyle(.plain)
                    .lineLimit(1...6)
                    .focused($composerFocused)
                    .onSubmit { send() }
                Button(grok.isSending ? "…" : "Send") { send() }
                    .disabled(grok.isSending || grok.draft.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                    .buttonStyle(.borderedProminent)
                    .tint(ForgeTheme.copper)
                    .keyboardShortcut(.return, modifiers: [.command])
            }
            .padding(8)
            .background(ForgeTheme.canvas)
            .overlay(
                RoundedRectangle(cornerRadius: 6)
                    .stroke(ForgeTheme.rule, lineWidth: 1)
            )
        }
        .padding(12)
    }

    private func send() {
        grok.send(
            filePath: workspace.currentFile?.path,
            fileText: workspace.currentFile == nil ? nil : workspace.editorText,
            selection: workspace.selectedText
        )
    }
}

struct GrokOnboardingSheet: View {
    @EnvironmentObject private var grok: GrokSession
    @FocusState private var keyFocused: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("LocalForge")
                .font(.system(size: 28, weight: .semibold, design: .serif))
                .foregroundStyle(ForgeTheme.ink)
            Text("İki adım: xAI’ye üye olun, anahtarı yapıştırın. Sonra Grok ile sohbet.")
                .font(.title3)
                .foregroundStyle(ForgeTheme.ink)
                .fixedSize(horizontal: false, vertical: true)
            Text("Two steps: create/sign in at xAI, paste the key once. Chat starts immediately. If XAI_API_KEY or ~/.localforge.env already exists, this screen is skipped.")
                .font(.callout)
                .foregroundStyle(ForgeTheme.muted)
                .fixedSize(horizontal: false, vertical: true)

            Button {
                grok.openXAIConsole()
                keyFocused = true
            } label: {
                Label("Üye ol / anahtar al", systemImage: "safari")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.borderedProminent)
            .tint(ForgeTheme.copper)
            .controlSize(.large)
            .help("Opens https://console.x.ai")

            SecureField("xAI API key", text: $grok.keyField)
                .textFieldStyle(.roundedBorder)
                .focused($keyFocused)
                .onSubmit { saveAndChat() }

            if let lastError = grok.lastError, !grok.hasKey {
                Text(lastError)
                    .font(.caption)
                    .foregroundStyle(ForgeTheme.danger)
            }

            Button("Keychain’e kaydet ve sohbete başla") {
                saveAndChat()
            }
            .buttonStyle(.bordered)
            .disabled(grok.keyField.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
            .keyboardShortcut(.defaultAction)

            Text("Anahtar yalnızca bu Mac’te Keychain’de durur. Repoya yazılmaz. Cursor girişi yoktur.")
                .font(.caption2)
                .foregroundStyle(ForgeTheme.muted)
                .fixedSize(horizontal: false, vertical: true)
        }
        .padding(24)
        .frame(width: 460)
        .onAppear {
            grok.refreshKeyStatus()
            if grok.hasKey {
                grok.showOnboarding = false
                grok.requestComposerFocus()
            } else {
                keyFocused = true
            }
        }
    }

    private func saveAndChat() {
        do {
            try grok.finishOnboarding()
        } catch {
            grok.lastError = error.localizedDescription
        }
    }
}

struct GrokSettingsSheet: View {
    @EnvironmentObject private var grok: GrokSession
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("xAI Grok")
                .font(.title2.weight(.semibold))
                .foregroundStyle(ForgeTheme.ink)
            Text("Sohbet yalnızca https://api.x.ai/v1/chat/completions adresine, sizin anahtarınızla gider.")
                .font(.callout)
                .foregroundStyle(ForgeTheme.muted)
                .fixedSize(horizontal: false, vertical: true)

            Button("Üye ol / anahtar al") {
                grok.openXAIConsole()
            }
            .buttonStyle(.borderedProminent)
            .tint(ForgeTheme.copper)

            Text("Current source: \(grok.keyStatus)")
                .font(.caption)
                .foregroundStyle(ForgeTheme.moss)

            SecureField("XAI_API_KEY", text: $grok.keyField)
                .textFieldStyle(.roundedBorder)

            HStack {
                Button("Save to Keychain") {
                    do {
                        try grok.saveAPIKeyFromField()
                        Task { await grok.refreshModels() }
                    } catch {
                        grok.lastError = error.localizedDescription
                    }
                }
                .disabled(grok.keyField.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                Button("Remove Keychain key") {
                    grok.clearAPIKey()
                }
                Spacer()
            }

            if grok.availableModels.count > 1 {
                Picker("Model", selection: $grok.model) {
                    ForEach(grok.availableModels, id: \.self) { id in
                        Text(id).tag(id)
                    }
                }
                .onChange(of: grok.model) { _, _ in grok.persistPreferences() }
            } else {
                TextField("Model id", text: $grok.model)
                    .textFieldStyle(.roundedBorder)
                    .onChange(of: grok.model) { _, _ in grok.persistPreferences() }
            }

            Text("Default is grok-4.6. Other Grok ids appear if your xAI account is entitled to them.")
                .font(.caption)
                .foregroundStyle(ForgeTheme.muted)
                .fixedSize(horizontal: false, vertical: true)

            Toggle("Attach current file automatically", isOn: $grok.includeFile)
            Toggle("Attach selection automatically", isOn: $grok.includeSelection)

            Text("Also accepted without this sheet: environment XAI_API_KEY or ~/.localforge.env.")
                .font(.caption2)
                .foregroundStyle(ForgeTheme.muted)
                .fixedSize(horizontal: false, vertical: true)

            HStack {
                Spacer()
                Button("Done") {
                    grok.persistPreferences()
                    grok.refreshKeyStatus()
                    dismiss()
                    grok.requestComposerFocus()
                }
                .keyboardShortcut(.defaultAction)
            }
        }
        .padding(20)
        .frame(width: 460)
        .onAppear {
            grok.refreshKeyStatus()
            Task { await grok.refreshModels() }
        }
    }
}
