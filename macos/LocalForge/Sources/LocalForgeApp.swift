import SwiftUI

@main
struct LocalForgeApp: App {
    @StateObject private var workspace = WorkspaceModel()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(workspace)
                .frame(minWidth: 880, minHeight: 560)
        }
        .windowStyle(.titleBar)
        .commands {
            CommandGroup(replacing: .newItem) {
                Button("Open Folder…") {
                    workspace.pickFolder()
                }
                .keyboardShortcut("o", modifiers: [.command])
                Button("Save") {
                    workspace.saveCurrentFile()
                }
                .keyboardShortcut("s", modifiers: [.command])
                .disabled(workspace.currentFile == nil)
            }
        }
    }
}
