import AppKit
import SwiftUI

struct RootView: View {
    @EnvironmentObject private var workspace: WorkspaceModel
    @FocusState private var filterFocused: Bool

    var body: some View {
        VStack(spacing: 0) {
            toolbar
            Rectangle().fill(ForgeTheme.rule).frame(height: 1)
            if workspace.rootURL == nil {
                WelcomeView()
            } else {
                workspaceSplit
            }
            Rectangle().fill(ForgeTheme.rule).frame(height: 1)
            StatusBarView()
        }
        .background(ForgeTheme.canvas)
        .focusable()
    }

    private var toolbar: some View {
        HStack(spacing: 10) {
            HStack(spacing: 8) {
                Image(systemName: "flame.fill")
                    .foregroundStyle(ForgeTheme.copper)
                    .font(.title3)
                Text("LocalForge")
                    .font(ForgeTheme.brandFont)
                    .foregroundStyle(ForgeTheme.ink)
            }

            if let root = workspace.rootURL {
                Text(root.lastPathComponent)
                    .font(.callout)
                    .foregroundStyle(ForgeTheme.muted)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 4)
                    .background(ForgeTheme.selection)
                    .clipShape(Capsule())
                    .help(root.path)
            }

            Spacer()

            toolbarButton("folder.badge.plus", title: "Open Folder") {
                workspace.pickFolder()
            }
            toolbarButton("doc.badge.plus", title: "New File") {
                workspace.createFile()
            }
            .disabled(workspace.rootURL == nil)
            toolbarButton("square.and.arrow.down", title: "Save") {
                workspace.saveCurrentFile()
            }
            .disabled(workspace.currentFile == nil || !workspace.isDirty)
            toolbarButton("arrow.clockwise", title: "Refresh") {
                workspace.refreshTree()
            }
            .disabled(workspace.rootURL == nil)
            toolbarButton(
                workspace.showRunner ? "terminal.fill" : "terminal",
                title: workspace.showRunner ? "Hide Console" : "Show Console"
            ) {
                workspace.showRunner.toggle()
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
        .background(ForgeTheme.bar)
        .onReceive(NotificationCenter.default.publisher(for: .localForgeFocusFilter)) { _ in
            filterFocused = true
        }
    }

    private var workspaceSplit: some View {
        HSplitView {
            FileBrowserView(filterFocused: $filterFocused)
                .frame(minWidth: 240, idealWidth: 280, maxWidth: 420)
            Group {
                if workspace.showRunner {
                    VSplitView {
                        EditorPane()
                            .frame(minHeight: 220)
                        RunnerPane()
                            .frame(minHeight: 150, idealHeight: 200)
                    }
                } else {
                    EditorPane()
                }
            }
            .frame(minWidth: 480)
        }
    }

    private func toolbarButton(_ systemImage: String, title: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Label(title, systemImage: systemImage)
        }
        .buttonStyle(.bordered)
        .tint(ForgeTheme.ink)
        .help(title)
    }
}

struct WelcomeView: View {
    @EnvironmentObject private var workspace: WorkspaceModel

    var body: some View {
        VStack(spacing: 18) {
            Spacer()
            Image(systemName: "flame.fill")
                .font(.system(size: 48))
                .foregroundStyle(ForgeTheme.copper)
            Text("LocalForge")
                .font(.system(size: 32, weight: .semibold, design: .serif))
                .foregroundStyle(ForgeTheme.ink)
            Text("A local folder workspace for UTF-8 text and shell commands.\nNothing is sent to a network. There is no agent chat or model picker.")
                .multilineTextAlignment(.center)
                .foregroundStyle(ForgeTheme.muted)
                .frame(maxWidth: 460)
            Button("Open Folder…") {
                workspace.pickFolder()
            }
            .buttonStyle(.borderedProminent)
            .tint(ForgeTheme.copper)
            .keyboardShortcut(.defaultAction)
            VStack(alignment: .leading, spacing: 6) {
                shortcutRow("⌘O", "Open folder")
                shortcutRow("⌘S", "Save file")
                shortcutRow("⌘F", "Filter files")
                shortcutRow("⌘R", "Run command")
                shortcutRow("⌘.", "Stop command")
            }
            .padding(.top, 12)
            Spacer()
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(ForgeTheme.canvas)
    }

    private func shortcutRow(_ keys: String, _ label: String) -> some View {
        HStack(spacing: 12) {
            Text(keys)
                .font(ForgeTheme.monoCaption)
                .foregroundStyle(ForgeTheme.ink)
                .frame(width: 56, alignment: .trailing)
            Text(label)
                .foregroundStyle(ForgeTheme.muted)
        }
        .font(.callout)
    }
}

struct FileBrowserView: View {
    @EnvironmentObject private var workspace: WorkspaceModel
    var filterFocused: FocusState<Bool>.Binding

    var body: some View {
        VStack(spacing: 0) {
            HStack(spacing: 8) {
                Image(systemName: "line.3.horizontal.decrease.circle")
                    .foregroundStyle(ForgeTheme.muted)
                TextField("Filter files", text: $workspace.fileFilter)
                    .textFieldStyle(.plain)
                    .focused(filterFocused)
                if !workspace.fileFilter.isEmpty {
                    Button {
                        workspace.fileFilter = ""
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundStyle(ForgeTheme.muted)
                    }
                    .buttonStyle(.plain)
                    .help("Clear filter")
                }
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(ForgeTheme.bar.opacity(0.65))

            Rectangle().fill(ForgeTheme.rule).frame(height: 1)

            if workspace.displayedTree.isEmpty {
                EmptyStateView(
                    symbol: workspace.fileFilter.isEmpty ? "folder" : "magnifyingglass",
                    title: workspace.fileFilter.isEmpty ? "No files" : "No matches",
                    message: workspace.fileFilter.isEmpty
                        ? "This folder is empty, or only hidden files were found."
                        : "Nothing in the tree matches “\(workspace.fileFilter)”."
                )
            } else {
                List(workspace.displayedTree, children: \.children, selection: fileSelection) { node in
                    Label {
                        Text(node.name)
                            .foregroundStyle(ForgeTheme.ink)
                    } icon: {
                        Image(systemName: node.isDirectory ? "folder.fill" : "doc.text")
                            .foregroundStyle(node.isDirectory ? ForgeTheme.moss : ForgeTheme.copper)
                    }
                    .tag(node.id)
                    .contextMenu {
                        Button("Open") { workspace.openFile(node.id) }
                            .disabled(node.isDirectory)
                        Button("Reveal in Finder") {
                            NSWorkspace.shared.activateFileViewerSelecting([node.id])
                        }
                    }
                }
                .listStyle(.sidebar)
                .scrollContentBackground(.hidden)
            }
        }
        .background(ForgeTheme.sidebar)
    }

    private var fileSelection: Binding<URL?> {
        Binding(
            get: { workspace.currentFile },
            set: { url in
                guard let url else { return }
                workspace.openFile(url)
            }
        )
    }
}

struct EditorPane: View {
    @EnvironmentObject private var workspace: WorkspaceModel

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack(spacing: 8) {
                Circle()
                    .fill(workspace.isDirty ? ForgeTheme.copper : ForgeTheme.rule)
                    .frame(width: 8, height: 8)
                Text(workspace.currentFile?.lastPathComponent ?? "No file open")
                    .font(.callout.weight(.semibold))
                    .foregroundStyle(ForgeTheme.ink)
                if workspace.isDirty {
                    Text("Unsaved")
                        .font(.caption2.weight(.semibold))
                        .foregroundStyle(ForgeTheme.copper)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(ForgeTheme.selection)
                        .clipShape(Capsule())
                }
                Spacer()
                if workspace.currentFile != nil {
                    Button("Close") { workspace.closeFile() }
                        .buttonStyle(.plain)
                        .foregroundStyle(ForgeTheme.muted)
                        .help("Close file (⌘W)")
                }
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(ForgeTheme.bar)

            Rectangle().fill(ForgeTheme.rule).frame(height: 1)

            if workspace.currentFile == nil {
                EmptyStateView(
                    symbol: "text.alignleft",
                    title: "Select a file",
                    message: "Choose a text file in the tree, or create a new one with ⌘N."
                )
            } else {
                TextEditor(text: Binding(
                    get: { workspace.editorText },
                    set: { workspace.updateText($0) }
                ))
                .font(ForgeTheme.mono)
                .foregroundStyle(ForgeTheme.ink)
                .scrollContentBackground(.hidden)
                .padding(8)
                .background(ForgeTheme.canvas)
            }
        }
        .background(ForgeTheme.canvas)
    }
}

struct RunnerPane: View {
    @EnvironmentObject private var workspace: WorkspaceModel
    @FocusState private var commandFocused: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Label("Command console", systemImage: "terminal")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(ForgeTheme.ink)
                Text("runs in the open folder")
                    .font(.caption2)
                    .foregroundStyle(ForgeTheme.muted)
                Spacer()
                if workspace.isRunning {
                    Button("Stop") { workspace.stopCommand() }
                }
                Button(workspace.isRunning ? "Running…" : "Run") {
                    workspace.runCommand()
                }
                .disabled(workspace.rootURL == nil || workspace.isRunning)
            }

            HStack(spacing: 8) {
                Text("$")
                    .font(ForgeTheme.mono)
                    .foregroundStyle(ForgeTheme.copper)
                TextField("Command", text: $workspace.command)
                    .textFieldStyle(.plain)
                    .font(ForgeTheme.mono)
                    .focused($commandFocused)
                    .onSubmit { workspace.runCommand() }
            }
            .padding(8)
            .background(ForgeTheme.canvas)
            .overlay(
                RoundedRectangle(cornerRadius: 6)
                    .stroke(ForgeTheme.rule, lineWidth: 1)
            )

            if workspace.commandOutput.isEmpty && !workspace.isRunning {
                EmptyStateView(
                    symbol: "terminal",
                    title: "No output yet",
                    message: "Run a command with ⌘R. Output stays on this Mac."
                )
                .frame(maxHeight: .infinity)
            } else {
                ScrollView {
                    Text(workspace.commandOutput)
                        .font(ForgeTheme.monoCaption)
                        .foregroundStyle(ForgeTheme.ink)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .textSelection(.enabled)
                        .padding(8)
                }
                .background(ForgeTheme.canvas.opacity(0.7))
                .overlay(
                    RoundedRectangle(cornerRadius: 6)
                        .stroke(ForgeTheme.rule, lineWidth: 1)
                )
            }
        }
        .padding(12)
        .background(ForgeTheme.sidebar)
    }
}

struct StatusBarView: View {
    @EnvironmentObject private var workspace: WorkspaceModel

    var body: some View {
        HStack(spacing: 14) {
            statusChip(
                workspace.lastError == nil ? "checkmark.circle" : "exclamationmark.triangle.fill",
                workspace.status,
                tint: workspace.lastError == nil ? ForgeTheme.moss : ForgeTheme.danger
            )
            Spacer()
            if workspace.isDirty {
                Text("Unsaved")
                    .foregroundStyle(ForgeTheme.copper)
                    .fontWeight(.semibold)
            }
            if workspace.currentFile != nil {
                Text("\(workspace.lineCount) lines")
                Text("\(workspace.characterCount) chars")
                Text(workspace.encodingLabel)
            }
            if let code = workspace.lastExitCode {
                Text("exit \(code)")
                    .foregroundStyle(code == 0 ? ForgeTheme.moss : ForgeTheme.danger)
            }
            if workspace.isRunning {
                Text("Running")
                    .foregroundStyle(ForgeTheme.copper)
            }
        }
        .font(.caption)
        .foregroundStyle(ForgeTheme.muted)
        .lineLimit(1)
        .padding(.horizontal, 16)
        .padding(.vertical, 7)
        .background(ForgeTheme.bar)
    }

    private func statusChip(_ symbol: String, _ text: String, tint: Color) -> some View {
        HStack(spacing: 6) {
            Image(systemName: symbol)
                .foregroundStyle(tint)
            Text(text)
                .foregroundStyle(ForgeTheme.ink)
        }
    }
}

struct EmptyStateView: View {
    let symbol: String
    let title: String
    let message: String

    var body: some View {
        VStack(spacing: 8) {
            Spacer()
            Image(systemName: symbol)
                .font(.system(size: 28))
                .foregroundStyle(ForgeTheme.copper.opacity(0.85))
            Text(title)
                .font(.headline)
                .foregroundStyle(ForgeTheme.ink)
            Text(message)
                .font(.callout)
                .foregroundStyle(ForgeTheme.muted)
                .multilineTextAlignment(.center)
                .frame(maxWidth: 320)
            Spacer()
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding()
    }
}
