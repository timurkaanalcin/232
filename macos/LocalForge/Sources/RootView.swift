import SwiftUI

struct RootView: View {
    @EnvironmentObject private var workspace: WorkspaceModel

    var body: some View {
        VStack(spacing: 0) {
            toolbar
            Divider()
            HSplitView {
                FileTreeView()
                    .frame(minWidth: 220, idealWidth: 260, maxWidth: 360)
                VSplitView {
                    EditorPane()
                    RunnerPane()
                        .frame(minHeight: 140, idealHeight: 180)
                }
            }
            Divider()
            statusBar
        }
        .background(Palette.canvas)
    }

    private var toolbar: some View {
        HStack(spacing: 12) {
            HStack(spacing: 8) {
                Image(systemName: "hammer.fill")
                    .foregroundStyle(Palette.ink)
                Text("LocalForge")
                    .font(.headline)
            }
            Spacer()
            Button("Open Folder") {
                workspace.pickFolder()
            }
            .keyboardShortcut("o", modifiers: [.command])
            Button("Save") {
                workspace.saveCurrentFile()
            }
            .keyboardShortcut("s", modifiers: [.command])
            .disabled(workspace.currentFile == nil || !workspace.isDirty)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
        .background(Palette.bar)
    }

    private var statusBar: some View {
        HStack {
            Text(workspace.status)
                .lineLimit(1)
            Spacer()
            if workspace.isDirty {
                Text("Unsaved")
                    .foregroundStyle(Palette.accent)
            }
        }
        .font(.caption)
        .foregroundStyle(Palette.muted)
        .padding(.horizontal, 16)
        .padding(.vertical, 8)
        .background(Palette.bar)
    }
}

struct FileTreeView: View {
    @EnvironmentObject private var workspace: WorkspaceModel

    var body: some View {
        List(workspace.tree, children: \.children, selection: fileSelection) { node in
            Label(node.name, systemImage: node.isDirectory ? "folder" : "doc.text")
                .tag(node.id)
        }
        .listStyle(.sidebar)
        .background(Palette.sidebar)
    }

    private var fileSelection: Binding<URL?> {
        Binding(
            get: { workspace.currentFile },
            set: { url in
                guard let url else { return }
                var isDir: ObjCBool = false
                if FileManager.default.fileExists(atPath: url.path, isDirectory: &isDir), !isDir.boolValue {
                    workspace.openFile(url)
                }
            }
        )
    }
}

struct EditorPane: View {
    @EnvironmentObject private var workspace: WorkspaceModel

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            Text(workspace.currentFile?.lastPathComponent ?? "No file selected")
                .font(.caption.weight(.semibold))
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Palette.bar)
            TextEditor(text: Binding(
                get: { workspace.editorText },
                set: { workspace.updateText($0) }
            ))
            .font(.system(.body, design: .monospaced))
            .padding(4)
            .disabled(workspace.currentFile == nil)
            .scrollContentBackground(.hidden)
            .background(Palette.canvas)
        }
    }
}

struct RunnerPane: View {
    @EnvironmentObject private var workspace: WorkspaceModel

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text("Run in project folder")
                    .font(.caption.weight(.semibold))
                Spacer()
                Button(workspace.isRunning ? "Running…" : "Run") {
                    workspace.runCommand()
                }
                .disabled(workspace.rootURL == nil || workspace.isRunning)
            }
            TextField("Command", text: $workspace.command)
                .textFieldStyle(.roundedBorder)
                .font(.system(.body, design: .monospaced))
            ScrollView {
                Text(workspace.commandOutput.isEmpty ? "Output appears here." : workspace.commandOutput)
                    .font(.system(.caption, design: .monospaced))
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .textSelection(.enabled)
            }
        }
        .padding(12)
        .background(Palette.sidebar)
    }
}

enum Palette {
    static let canvas = Color(red: 0.98, green: 0.97, blue: 0.94)
    static let sidebar = Color(red: 0.93, green: 0.91, blue: 0.86)
    static let bar = Color(red: 0.90, green: 0.88, blue: 0.82)
    static let ink = Color(red: 0.18, green: 0.16, blue: 0.12)
    static let muted = Color(red: 0.42, green: 0.38, blue: 0.32)
    static let accent = Color(red: 0.55, green: 0.28, blue: 0.12)
}
