import AppKit
import Combine
import Foundation

extension Notification.Name {
    static let localForgeFocusFilter = Notification.Name("com.timurkaanalcin.localforge.focusFilter")
}

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
    @Published var lastError: String?
    @Published var command: String = "ls -la"
    @Published var commandOutput: String = ""
    @Published var isRunning = false
    @Published var lastExitCode: Int32?
    @Published var fileFilter: String = ""
    @Published var showRunner: Bool = true
    @Published var lineCount: Int = 0
    @Published var characterCount: Int = 0
    @Published var selectedText: String = ""

    private let fm = FileManager.default
    private var lastSavedText: String = ""
    private var runningProcess: Process?
    private let maxOpenBytes: Int = 5_000_000

    var rootName: String {
        rootURL?.lastPathComponent ?? "No folder"
    }

    var displayedTree: [FileNode] {
        let query = fileFilter.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !query.isEmpty else { return tree }
        return tree.compactMap { filterNode($0, query: query) }
    }

    var encodingLabel: String {
        currentFile == nil ? "—" : "UTF-8"
    }

    func pickFolder() {
        guard confirmLeaveEditor() else { return }
        let panel = NSOpenPanel()
        panel.canChooseFiles = false
        panel.canChooseDirectories = true
        panel.allowsMultipleSelection = false
        panel.canCreateDirectories = true
        panel.prompt = "Open"
        panel.message = "Choose a project folder for LocalForge."
        guard panel.runModal() == .OK, let url = panel.url else { return }
        openFolder(url)
    }

    func openFolder(_ url: URL) {
        rootURL = url
        resetEditor()
        commandOutput = ""
        lastExitCode = nil
        lastError = nil
        fileFilter = ""
        refreshTree(announce: false)
        status = "Folder: \(url.path)"
    }

    func refreshTree(announce: Bool = true) {
        guard let rootURL else {
            tree = []
            return
        }
        tree = [buildNode(rootURL)].compactMap { $0 }
        if announce {
            status = "Refreshed \(rootName)"
        }
    }

    func openFile(_ url: URL) {
        var isDir: ObjCBool = false
        if fm.fileExists(atPath: url.path, isDirectory: &isDir), isDir.boolValue {
            return
        }
        if url == currentFile { return }
        guard confirmLeaveEditor() else { return }
        loadFile(url)
    }

    func closeFile() {
        guard confirmLeaveEditor() else { return }
        resetEditor()
        status = rootURL.map { "Folder: \($0.path)" } ?? "Open a folder to begin."
    }

    func saveCurrentFile() {
        guard let currentFile else {
            lastError = "Nothing to save."
            status = lastError ?? ""
            return
        }
        do {
            try editorText.write(to: currentFile, atomically: true, encoding: .utf8)
            lastSavedText = editorText
            isDirty = false
            lastError = nil
            recount()
            status = "Saved \(currentFile.lastPathComponent)"
        } catch {
            lastError = "Save failed: \(error.localizedDescription)"
            status = lastError ?? ""
            presentError(lastError!)
        }
    }

    func updateText(_ value: String) {
        editorText = value
        isDirty = value != lastSavedText
        recount()
    }

    func createFile() {
        guard let rootURL else {
            status = "Open a folder first."
            return
        }
        guard confirmLeaveEditor() else { return }
        let panel = NSSavePanel()
        panel.directoryURL = rootURL
        panel.canCreateDirectories = true
        panel.title = "New text file"
        panel.nameFieldStringValue = "untitled.txt"
        panel.prompt = "Create"
        guard panel.runModal() == .OK, let url = panel.url else { return }
        do {
            if !fm.fileExists(atPath: url.path) {
                try "".write(to: url, atomically: true, encoding: .utf8)
            }
            refreshTree()
            loadFile(url)
        } catch {
            lastError = "Could not create file: \(error.localizedDescription)"
            status = lastError ?? ""
            presentError(lastError!)
        }
    }

    func revealCurrentFile() {
        let target = currentFile ?? rootURL
        guard let target else { return }
        NSWorkspace.shared.activateFileViewerSelecting([target])
    }

    func runCommand() {
        guard let rootURL else {
            status = "Open a folder first."
            return
        }
        let trimmed = command.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else {
            status = "Enter a command to run."
            return
        }

        stopCommand()
        isRunning = true
        commandOutput = ""
        lastExitCode = nil
        lastError = nil
        status = "Running in \(rootName)…"
        showRunner = true

        let process = Process()
        process.currentDirectoryURL = rootURL
        process.executableURL = URL(fileURLWithPath: "/bin/zsh")
        process.arguments = ["-lc", trimmed]
        let pipe = Pipe()
        process.standardOutput = pipe
        process.standardError = pipe
        runningProcess = process

        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            do {
                try process.run()
                process.waitUntilExit()
                let data = pipe.fileHandleForReading.readDataToEndOfFile()
                let text = String(data: data, encoding: .utf8) ?? "<output was not valid UTF-8>\n"
                DispatchQueue.main.async {
                    guard let self else { return }
                    self.commandOutput = text
                    self.lastExitCode = process.terminationStatus
                    self.isRunning = false
                    self.runningProcess = nil
                    if process.terminationStatus == 0 {
                        self.status = "Command finished (exit 0)."
                    } else if process.terminationStatus == 15 {
                        self.status = "Command stopped."
                    } else {
                        self.status = "Command exited \(process.terminationStatus)."
                    }
                }
            } catch {
                DispatchQueue.main.async {
                    guard let self else { return }
                    self.commandOutput = error.localizedDescription
                    self.isRunning = false
                    self.runningProcess = nil
                    self.lastError = "Command failed: \(error.localizedDescription)"
                    self.status = self.lastError ?? "Command failed."
                }
            }
        }
    }

    func stopCommand() {
        guard let runningProcess else { return }
        runningProcess.terminate()
    }

    func confirmAppTermination() -> Bool {
        confirmLeaveEditor()
    }

    private func loadFile(_ url: URL) {
        do {
            let values = try url.resourceValues(forKeys: [.fileSizeKey])
            if let size = values.fileSize, size > maxOpenBytes {
                lastError = "File is larger than 5 MB. Open a smaller text file."
                status = lastError ?? ""
                presentError(lastError!)
                return
            }
            let data = try Data(contentsOf: url)
            if data.contains(0) {
                lastError = "Not a UTF-8 text file (binary data detected)."
                status = lastError ?? ""
                resetEditor()
                presentError(lastError!)
                return
            }
            guard let text = String(data: data, encoding: .utf8) else {
                lastError = "Could not open file as UTF-8 text."
                status = lastError ?? ""
                resetEditor()
                presentError(lastError!)
                return
            }
            editorText = text
            lastSavedText = text
            currentFile = url
            isDirty = false
            lastError = nil
            recount()
            status = url.path
        } catch {
            lastError = "Could not open: \(error.localizedDescription)"
            status = lastError ?? ""
            presentError(lastError!)
        }
    }

    private func resetEditor() {
        currentFile = nil
        editorText = ""
        lastSavedText = ""
        isDirty = false
        lineCount = 0
        characterCount = 0
        selectedText = ""
    }

    private func recount() {
        characterCount = editorText.count
        if editorText.isEmpty {
            lineCount = 0
        } else {
            lineCount = editorText.reduce(1) { $1 == "\n" ? $0 + 1 : $0 }
        }
    }

    /// TextEdit-style Save / Don't Save / Cancel.
    private func confirmLeaveEditor() -> Bool {
        guard isDirty else { return true }
        let name = currentFile?.lastPathComponent ?? "Untitled"
        let alert = NSAlert()
        alert.messageText = "Save changes to “\(name)”?"
        alert.informativeText = "Unsaved edits will be lost if you don’t save."
        alert.alertStyle = .warning
        alert.addButton(withTitle: "Save")
        alert.addButton(withTitle: "Don’t Save")
        alert.addButton(withTitle: "Cancel")
        switch alert.runModal() {
        case .alertFirstButtonReturn:
            saveCurrentFile()
            return !isDirty
        case .alertSecondButtonReturn:
            isDirty = false
            return true
        default:
            return false
        }
    }

    private func presentError(_ message: String) {
        let alert = NSAlert()
        alert.messageText = "LocalForge"
        alert.informativeText = message
        alert.alertStyle = .warning
        alert.addButton(withTitle: "OK")
        alert.runModal()
    }

    private func filterNode(_ node: FileNode, query: String) -> FileNode? {
        if node.isDirectory {
            let nameHit = node.name.localizedCaseInsensitiveContains(query)
            let kids = (node.children ?? []).compactMap { filterNode($0, query: query) }
            if nameHit {
                return node
            }
            guard !kids.isEmpty else { return nil }
            return FileNode(id: node.id, name: node.name, isDirectory: true, children: kids)
        }
        return node.name.localizedCaseInsensitiveContains(query) ? node : nil
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
