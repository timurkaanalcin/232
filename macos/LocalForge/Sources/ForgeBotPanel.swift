import SwiftUI

struct ForgeBotPanel: View {
    @EnvironmentObject private var workspace: WorkspaceModel
    @EnvironmentObject private var bot: ForgeBotSession
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
            composerFocused = true
            Task { await bot.refreshOllama() }
        }
        .onChange(of: bot.composerFocusToken) { _, _ in
            composerFocused = true
        }
        .onReceive(NotificationCenter.default.publisher(for: .localForgeFocusBotComposer)) { _ in
            composerFocused = true
        }
    }

    private var header: some View {
        HStack(spacing: 8) {
            Image(systemName: "leaf")
                .foregroundStyle(ForgeTheme.moss)
            VStack(alignment: .leading, spacing: 1) {
                Text("ForgeBot")
                    .font(.callout.weight(.semibold))
                    .foregroundStyle(ForgeTheme.ink)
                Text(bot.engineLabel)
                    .font(.caption2)
                    .foregroundStyle(ForgeTheme.muted)
                    .lineLimit(1)
            }
            Spacer()
            Button {
                bot.clearChat()
            } label: {
                Image(systemName: "trash")
            }
            .buttonStyle(.plain)
            .help("Clear conversation")
            Button {
                bot.showAbout = true
            } label: {
                Image(systemName: "info.circle")
            }
            .buttonStyle(.plain)
            .help("About ForgeBot")
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
        var bits: [String] = ["Local · no cloud"]
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
            if bot.messages.isEmpty && bot.lastError == nil {
                EmptyStateView(
                    symbol: "bubble.left.and.bubble.right",
                    title: "Ask ForgeBot",
                    message: "Original local assistant. Open the app and type — no account. File and selection attach automatically."
                )
            } else {
                ScrollViewReader { proxy in
                    ScrollView {
                        LazyVStack(alignment: .leading, spacing: 10) {
                            ForEach(bot.messages) { message in
                                messageBubble(message)
                                    .id(message.id)
                            }
                            if bot.isSending {
                                Text("ForgeBot is writing…")
                                    .font(.caption)
                                    .foregroundStyle(ForgeTheme.muted)
                                    .id("pending")
                            }
                        }
                        .padding(12)
                    }
                    .onChange(of: bot.messages.count) { _, _ in
                        proxy.scrollTo(bot.messages.last?.id ?? UUID(), anchor: .bottom)
                    }
                }
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    private func messageBubble(_ message: ChatMessage) -> some View {
        let isUser = message.role == "user"
        return VStack(alignment: .leading, spacing: 4) {
            Text(isUser ? "You" : "ForgeBot")
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
            if let lastError = bot.lastError {
                Text(lastError)
                    .font(.caption)
                    .foregroundStyle(ForgeTheme.danger)
            }
            HStack(alignment: .bottom, spacing: 8) {
                TextField("Ask ForgeBot…", text: $bot.draft, axis: .vertical)
                    .textFieldStyle(.plain)
                    .lineLimit(1...6)
                    .focused($composerFocused)
                    .onSubmit { send() }
                Button(bot.isSending ? "…" : "Send") { send() }
                    .disabled(bot.isSending || bot.draft.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
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
        bot.send(
            filePath: workspace.currentFile?.path,
            fileText: workspace.currentFile == nil ? nil : workspace.editorText,
            selection: workspace.selectedText
        )
    }
}

struct ForgeBotAboutSheet: View {
    @EnvironmentObject private var bot: ForgeBotSession
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("ForgeBot")
                .font(.title2.weight(.semibold))
                .foregroundStyle(ForgeTheme.ink)
            Text("Yerel, özgün bir asistan. Grok değil, xAI değil, Cursor değil. Hesap yok; sohbet bu Mac’te kalır.")
                .font(.callout)
                .foregroundStyle(ForgeTheme.ink)
                .fixedSize(horizontal: false, vertical: true)
            Text("Original local assistant. Not Grok, not xAI, not Cursor. No account. Chat stays on this Mac. Optional Ollama is 127.0.0.1 only.")
                .font(.callout)
                .foregroundStyle(ForgeTheme.muted)
                .fixedSize(horizontal: false, vertical: true)

            Text("Engine: \(bot.engineLabel)")
                .font(.caption)
                .foregroundStyle(ForgeTheme.moss)

            Toggle("Attach current file automatically", isOn: $bot.includeFile)
            Toggle("Attach selection automatically", isOn: $bot.includeSelection)
            Toggle("Prefer Ollama on localhost when it is running", isOn: $bot.preferOllama)

            if bot.ollamaModels.count > 1 {
                Picker("Ollama model", selection: $bot.ollamaModel) {
                    ForEach(bot.ollamaModels, id: \.self) { id in
                        Text(id).tag(id)
                    }
                }
            } else if bot.ollamaReady {
                Text("Ollama model: \(bot.ollamaModel)")
                    .font(.caption)
                    .foregroundStyle(ForgeTheme.muted)
            } else {
                Text("Ollama is optional. If it is not running, ForgeBot’s built-in engine still answers.")
                    .font(.caption)
                    .foregroundStyle(ForgeTheme.muted)
                    .fixedSize(horizontal: false, vertical: true)
            }

            HStack {
                Button("Recheck localhost") {
                    Task { await bot.refreshOllama() }
                }
                Spacer()
                Button("Done") {
                    bot.persistPreferences()
                    dismiss()
                    bot.requestComposerFocus()
                }
                .keyboardShortcut(.defaultAction)
            }
        }
        .padding(20)
        .frame(width: 460)
        .onAppear {
            Task { await bot.refreshOllama() }
        }
        .onChange(of: bot.preferOllama) { _, _ in
            bot.persistPreferences()
            Task { await bot.refreshOllama() }
        }
    }
}
