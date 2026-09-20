import SwiftUI

/// Warm atelier palette — paper, oak, and copper. Intentionally not a zinc/dark agent theme.
enum ForgeTheme {
    static let canvas = Color(red: 0.972, green: 0.953, blue: 0.922)
    static let sidebar = Color(red: 0.902, green: 0.886, blue: 0.847)
    static let bar = Color(red: 0.855, green: 0.831, blue: 0.780)
    static let ink = Color(red: 0.165, green: 0.141, blue: 0.106)
    static let muted = Color(red: 0.412, green: 0.369, blue: 0.310)
    static let copper = Color(red: 0.620, green: 0.325, blue: 0.165)
    static let moss = Color(red: 0.255, green: 0.392, blue: 0.286)
    static let rule = Color(red: 0.765, green: 0.718, blue: 0.635)
    static let danger = Color(red: 0.620, green: 0.180, blue: 0.145)
    static let selection = Color(red: 0.620, green: 0.325, blue: 0.165).opacity(0.16)

    static let brandFont = Font.system(.title3, design: .serif).weight(.semibold)
    static let mono = Font.system(.body, design: .monospaced)
    static let monoCaption = Font.system(.caption, design: .monospaced)
}
