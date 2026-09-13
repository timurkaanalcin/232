import Foundation
import AppKit
import Combine

struct FileNode: Identifiable, Hashable {
    let id: URL
    let name: String
    let isDirectory: Bool
    var children: [FileNode]?
}

@MainActor
final class WorkspaceModel: ObservableObject {
    @Published var rootURL: URL?
    @Published var tree: [FileNode] = []
    @Published var currentFile: URL?
    @Published var editorText: String = ""
    @Published var isDirty: Bool = false
    @Published var status: String = "Open a folder to begin."
    @Published var command: String = "ls -la"
    @Published var commandOutput: String = ""
    @Published var isRunning = false

    private let fm = FileManager.default

    func pickFolder() {
        let panel = NSOpenPanel()
        panel.canChooseFiles = false
        panel.canChooseDirectories = true
        panel.allowsMultipleSelection = false
        panel.prompt = "Open"
        panel.message = "Choose a project folder for LocalForge."
        guard panel.runModal() == .OK, let url = panel.url else { return }
        openFolder(url)
    }

    func openFolder(_ url: URL) {
        rootURL = url
        currentFile = nil
        editorText = ""
        isDirty = false
        commandOutput = ""
        refreshTree()
        status = url.path
    }

    func refreshTree() {
        guard let rootURL else {
            tree = []
            return
        }
        tree = [buildNode(rootURL)].compactMap { $0 }
    }

    func openFile(_ url: URL) {
        if isDirty {
            saveCurrentFile()
        }
        do {
            editorText = try String(contentsOf: url, encoding: .utf8)
            currentFile = url
            isDirty = false
            status = url.path
        } catch {
            status = "Could not open file as UTF-8 text."
        }
    }

    func saveCurrentFile() {
        guard let currentFile else { return }
        do {
            try editorText.write(to: currentFile, atomically: true, encoding: .utf8)
            isDirty = false
            status = "Saved \(currentFile.lastPathComponent)"
        } catch {
            status = "Save failed: \(error.localizedDescription)"
        }
    }

    func updateText(_ value: String) {
        editorText = value
        isDirty = true
    }

    func runCommand() {
        guard let rootURL else {
            status = "Open a folder first."
            return
        }
        let trimmed = command.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }

        isRunning = true
        commandOutput = ""
        status = "Running…"

        let process = Process()
        process.currentDirectoryURL = rootURL
        process.executableURL = URL(fileURLWithPath: "/bin/zsh")
        process.arguments = ["-lc", trimmed]

        let pipe = Pipe()
        process.standardOutput = pipe
        process.standardError = pipe

        DispatchQueue.global(qos: .userInitiated).async {
            do {
                try process.run()
                process.waitUntilExit()
                let data = pipe.fileHandleForReading.readDataToEndOfFile()
                let text = String(data: data, encoding: .utf8) ?? ""
                DispatchQueue.main.async {
                    self.commandOutput = text
                    self.isRunning = false
                    self.status = process.terminationStatus == 0 ? "Command finished." : "Command exited \(process.terminationStatus)."
                }
            } catch {
                DispatchQueue.main.async {
                    self.commandOutput = error.localizedDescription
                    self.isRunning = false
                    self.status = "Command failed."
                }
            }
        }
    }

    private func buildNode(_ url: URL) -> FileNode? {
        let name = url.lastPathComponent
        if name.hasPrefix(".") { return nil }
        var isDir: ObjCBool = false
        guard fm.fileExists(atPath: url.path, isDirectory: &isDir) else { return nil }
        if isDir.boolValue {
            let children = (try? fm.contentsOfDirectory(
                at: url,
                includingPropertiesForKeys: [.isDirectoryKey],
                options: [.skipsHiddenFiles]
            )) ?? []
            let nodes = children.compactMap(buildNode).sorted {
                ($0.isDirectory ? 0 : 1, $0.name.lowercased()) < ($1.isDirectory ? 0 : 1, $1.name.lowercased())
            }
            return FileNode(id: url, name: name, isDirectory: true, children: nodes)
        }
        return FileNode(id: url, name: name, isDirectory: false, children: nil)
    }
}
