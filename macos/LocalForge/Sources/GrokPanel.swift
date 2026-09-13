import SwiftUI

struct GrokPanel: View {
    @EnvironmentObject private var workspace: WorkspaceModel
    @EnvironmentObject private var grok: GrokSession

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            header
            Rectangle().fill(ForgeTheme.rule).frame(height: 1)
            contextToggles
            Rectangle().fill(ForgeTheme.rule).frame(height: 1)
            transcript
            Rectangle().fill(ForgeTheme.rule).frame(height: 1)
            composer
        }
        .background(ForgeTheme.sidebar)
    }

    private var header: some View {
        HStack(spacing: 8) {
            Image(systemName: "sparkles")
                .foregroundStyle(ForgeTheme.copper)
            VStack(alignment: .leading, spacing: 1) {
                Text("Grok assist")
                    .font(.callout.weight(.semibold))
                    .foregroundStyle(ForgeTheme.ink)
                Text("xAI · \(grok.model)")
                    .font(.caption2)
                    .foregroundStyle(ForgeTheme.muted)
            }
            Spacer()
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

    private var contextToggles: some View {
        VStack(alignment: .leading, spacing: 6) {
            Toggle("Attach current file", isOn: $grok.includeFile)
            Toggle("Attach selection", isOn: $grok.includeSelection)
            Text(contextHint)
                .font(.caption2)
                .foregroundStyle(ForgeTheme.muted)
        }
        .toggleStyle(.checkbox)
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .onChange(of: grok.includeFile) { _, _ in grok.persistPreferences() }
        .onChange(of: grok.includeSelection) { _, _ in grok.persistPreferences() }
    }

    private var contextHint: String {
        var bits: [String] = []
        if grok.includeFile, let name = workspace.currentFile?.lastPathComponent {
            bits.append(name)
        } else if grok.includeFile {
            bits.append("no file open")
        }
        if grok.includeSelection {
            let n = workspace.selectedText.count
            bits.append(n == 0 ? "no selection" : "\(n) selected chars")
        }
        return bits.isEmpty ? "Question only — no file context." : bits.joined(separator: " · ")
    }

    private var transcript: some View {
        Group {
            if grok.messages.isEmpty && grok.lastError == nil {
                EmptyStateView(
                    symbol: "bubble.left.and.bubble.right",
                    title: "Ask Grok",
                    message: "Uses the official xAI API. Optionally attach the open file or the editor selection."
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

struct GrokSettingsSheet: View {
    @EnvironmentObject private var grok: GrokSession
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("xAI Grok")
                .font(.title2.weight(.semibold))
                .foregroundStyle(ForgeTheme.ink)
            Text("LocalForge talks only to https://api.x.ai/v1/chat/completions with your own key. Get one at https://console.x.ai — never commit it.")
                .font(.callout)
                .foregroundStyle(ForgeTheme.muted)
                .fixedSize(horizontal: false, vertical: true)

            Text("Current source: \(grok.keyStatus)")
                .font(.caption)
                .foregroundStyle(ForgeTheme.moss)

            SecureField("XAI_API_KEY", text: $grok.keyField)
                .textFieldStyle(.roundedBorder)

            HStack {
                Button("Save to Keychain") {
                    do {
                        try grok.saveAPIKeyFromField()
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

            TextField("Model id", text: $grok.model)
                .textFieldStyle(.roundedBorder)
                .onChange(of: grok.model) { _, _ in grok.persistPreferences() }

            Text("Default model is grok-4.6 (xAI Chat Completions docs). Alternatives such as grok-3 or grok-2 may work depending on your account.")
                .font(.caption)
                .foregroundStyle(ForgeTheme.muted)
                .fixedSize(horizontal: false, vertical: true)

            Text("Also accepted: environment XAI_API_KEY, ~/Library/Application Support/LocalForge/.env, or ~/.localforge.env (XAI_API_KEY=…).")
                .font(.caption2)
                .foregroundStyle(ForgeTheme.muted)
                .fixedSize(horizontal: false, vertical: true)

            HStack {
                Spacer()
                Button("Done") {
                    grok.persistPreferences()
                    grok.refreshKeyStatus()
                    dismiss()
                }
                .keyboardShortcut(.defaultAction)
            }
        }
        .padding(20)
        .frame(width: 460)
        .onAppear { grok.refreshKeyStatus() }
    }
}
