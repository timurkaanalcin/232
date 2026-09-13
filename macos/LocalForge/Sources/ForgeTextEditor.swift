import AppKit
import SwiftUI

/// Monospaced NSTextView so the Grok panel can read the current selection.
struct ForgeTextEditor: NSViewRepresentable {
    @Binding var text: String
    @Binding var selectedText: String
    var onEdit: (String) -> Void

    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }

    func makeNSView(context: Context) -> NSScrollView {
        let scroll = NSScrollView()
        scroll.hasVerticalScroller = true
        scroll.hasHorizontalScroller = false
        scroll.autohidesScrollers = true
        scroll.borderType = .noBorder
        scroll.drawsBackground = false

        let textView = NSTextView()
        textView.delegate = context.coordinator
        textView.isRichText = false
        textView.importsGraphics = false
        textView.allowsUndo = true
        textView.isAutomaticQuoteSubstitutionEnabled = false
        textView.isAutomaticDashSubstitutionEnabled = false
        textView.isAutomaticTextReplacementEnabled = false
        textView.font = NSFont.monospacedSystemFont(ofSize: 13, weight: .regular)
        textView.textColor = NSColor(ForgeTheme.ink)
        textView.insertionPointColor = NSColor(ForgeTheme.copper)
        textView.backgroundColor = NSColor(ForgeTheme.canvas)
        textView.drawsBackground = true
        textView.isVerticallyResizable = true
        textView.isHorizontallyResizable = false
        textView.autoresizingMask = [.width]
        textView.textContainerInset = NSSize(width: 8, height: 8)
        textView.minSize = NSSize(width: 0, height: 0)
        textView.maxSize = NSSize(width: CGFloat.greatestFiniteMagnitude, height: CGFloat.greatestFiniteMagnitude)
        if let container = textView.textContainer {
            container.containerSize = NSSize(width: scroll.contentSize.width, height: CGFloat.greatestFiniteMagnitude)
            container.widthTracksTextView = true
        }
        textView.string = text
        scroll.documentView = textView
        context.coordinator.textView = textView
        return scroll
    }

    func updateNSView(_ nsView: NSScrollView, context: Context) {
        guard let textView = nsView.documentView as? NSTextView else { return }
        context.coordinator.parent = self
        if textView.string != text {
            let ranges = textView.selectedRanges
            textView.string = text
            textView.selectedRanges = ranges
        }
        textView.textColor = NSColor(ForgeTheme.ink)
        textView.backgroundColor = NSColor(ForgeTheme.canvas)
    }

    final class Coordinator: NSObject, NSTextViewDelegate {
        var parent: ForgeTextEditor
        weak var textView: NSTextView?

        init(_ parent: ForgeTextEditor) {
            self.parent = parent
        }

        func textDidChange(_ notification: Notification) {
            guard let textView = notification.object as? NSTextView else { return }
            parent.onEdit(textView.string)
            publishSelection(from: textView)
        }

        func textViewDidChangeSelection(_ notification: Notification) {
            guard let textView = notification.object as? NSTextView else { return }
            publishSelection(from: textView)
        }

        private func publishSelection(from textView: NSTextView) {
            let range = textView.selectedRange()
            if range.length > 0 {
                let ns = textView.string as NSString
                if NSMaxRange(range) <= ns.length {
                    parent.selectedText = ns.substring(with: range)
                    return
                }
            }
            parent.selectedText = ""
        }
    }
}
