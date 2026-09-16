import SwiftUI
import AppKit

@main
struct LocalForgeApp: App {
    @StateObject private var workspace = WorkspaceModel()
    @StateObject private var bot = ForgeBotSession()
    @NSApplicationDelegateAdaptor(ForgeAppDelegate.self) private var appDelegate

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(workspace)
                .environmentObject(bot)
                .frame(minWidth: 960, minHeight: 620)
                .onAppear {
                    appDelegate.workspace = workspace
                    NSApp.setActivationPolicy(.regular)
                    NSApp.activate(ignoringOtherApps: true)
                }
        }
        .windowStyle(.titleBar)
        .windowToolbarStyle(.unified)
        .commands {
            CommandGroup(replacing: .newItem) {
                Button("Open Folder…") {
                    workspace.pickFolder()
                }
                .keyboardShortcut("o", modifiers: [.command])
                Button("New File…") {
                    workspace.createFile()
                }
                .keyboardShortcut("n", modifiers: [.command])
                Button("Save") {
                    workspace.saveCurrentFile()
                }
                .keyboardShortcut("s", modifiers: [.command])
                .disabled(workspace.currentFile == nil)
                Button("Close File") {
                    workspace.closeFile()
                }
                .disabled(workspace.currentFile == nil)
            }
            CommandMenu("Workspace") {
                Button("Filter Files") {
                    NotificationCenter.default.post(name: .localForgeFocusFilter, object: nil)
                }
                .keyboardShortcut("f", modifiers: [.command])
                Button("Refresh File Tree") {
                    workspace.refreshTree()
                }
                .keyboardShortcut("r", modifiers: [.command, .shift])
                .disabled(workspace.rootURL == nil)
                Button("Reveal in Finder") {
                    workspace.revealCurrentFile()
                }
                .keyboardShortcut("r", modifiers: [.command, .option])
                .disabled(workspace.rootURL == nil)
                Button(workspace.showRunner ? "Hide Command Console" : "Show Command Console") {
                    workspace.showRunner.toggle()
                }
                .keyboardShortcut("j", modifiers: [.command])
                Button(bot.showPanel ? "Hide ForgeBot" : "Show ForgeBot") {
                    bot.showPanel.toggle()
                    bot.persistPreferences()
                }
                .keyboardShortcut("l", modifiers: [.command])
                Divider()
                Button("Run Command") {
                    workspace.runCommand()
                }
                .keyboardShortcut("r", modifiers: [.command])
                .disabled(workspace.rootURL == nil || workspace.isRunning)
                Button("Stop Command") {
                    workspace.stopCommand()
                }
                .keyboardShortcut(".", modifiers: [.command])
                .disabled(!workspace.isRunning)
            }
            CommandMenu("ForgeBot") {
                Button("About ForgeBot…") {
                    bot.showAbout = true
                }
                .keyboardShortcut(",", modifiers: [.command, .option])
                Button("Clear Conversation") {
                    bot.clearChat()
                }
                Divider()
                Toggle("Attach Current File Automatically", isOn: $bot.includeFile)
                Toggle("Attach Selection Automatically", isOn: $bot.includeSelection)
                Toggle("Prefer Local Ollama When Running", isOn: $bot.preferOllama)
            }
        }
    }
}

final class ForgeAppDelegate: NSObject, NSApplicationDelegate {
    weak var workspace: WorkspaceModel?

    func applicationShouldTerminate(_ sender: NSApplication) -> NSApplication.TerminateReply {
        if workspace?.confirmAppTermination() == false {
            return .terminateCancel
        }
        return .terminateNow
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
        true
    }
}
