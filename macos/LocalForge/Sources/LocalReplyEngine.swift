import Foundation

/// Original LocalForge reply engine. Not a cloud model, not Grok, not Cursor.
enum LocalReplyEngine {
    static let maxContextChars = 24_000

    struct Context {
        var filePath: String?
        var fileText: String?
        var selection: String?
        var engineLabel: String
    }

    static func clipped(_ text: String) -> String {
        if text.count <= maxContextChars { return text }
        let idx = text.index(text.startIndex, offsetBy: maxContextChars)
        return String(text[..<idx]) + "\n\n[truncated to \(maxContextChars) characters]"
    }

    static func reply(to rawQuestion: String, context: Context) -> String {
        let question = rawQuestion.trimmingCharacters(in: .whitespacesAndNewlines)
        let turkish = looksTurkish(question)
        let lower = question.lowercased()
        let fileName = context.filePath.map { URL(fileURLWithPath: $0).lastPathComponent }
        let fileBody = (context.fileText ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
        let selection = (context.selection ?? "").trimmingCharacters(in: .whitespacesAndNewlines)

        if isIdentity(lower) {
            return identity(turkish: turkish, engine: context.engineLabel)
        }
        if isHelp(lower) {
            return help(turkish: turkish, fileName: fileName)
        }
        if isGreeting(lower) {
            return greeting(turkish: turkish, fileName: fileName, engine: context.engineLabel)
        }

        if !selection.isEmpty && (mentionsSelection(lower) || mentionsFile(lower) || isSummarize(lower)) {
            return selectionNote(turkish: turkish, selection: selection, fileName: fileName)
        }

        if !fileBody.isEmpty {
            if isStats(lower) {
                return stats(turkish: turkish, fileName: fileName ?? "file", body: fileBody, selection: selection)
            }
            if isSummarize(lower) || mentionsFile(lower) {
                return summarize(turkish: turkish, fileName: fileName ?? "file", body: fileBody, selection: selection)
            }
            if let needle = searchNeedle(from: question, lower: lower) {
                return search(turkish: turkish, fileName: fileName ?? "file", body: fileBody, needle: needle)
            }
            return fileGrounded(turkish: turkish, question: question, fileName: fileName ?? "file", body: fileBody, selection: selection)
        }

        if !selection.isEmpty {
            return selectionNote(turkish: turkish, selection: selection, fileName: fileName)
        }

        return fallback(turkish: turkish, question: question, engine: context.engineLabel)
    }

    private static func looksTurkish(_ text: String) -> Bool {
        if text.range(of: "[çğıöşüÇĞİÖŞÜ]", options: .regularExpression) != nil { return true }
        let markers = ["nedir", "nasıl", "merhaba", "selam", "yardım", "özet", "dosya", "kimsin", "merhaba"]
        let lower = text.lowercased()
        return markers.contains { lower.contains($0) }
    }

    private static func isIdentity(_ lower: String) -> Bool {
        lower.contains("who are you") || lower.contains("what are you") || lower.contains("kimsin")
            || lower.contains("kimsiniz") || lower.contains("adın ne") || lower.contains("your name")
            || lower.contains("are you grok") || lower.contains("grok musun")
            || lower.contains("are you cursor") || lower.contains("x.ai") || lower.contains("xai")
    }

    private static func isHelp(_ lower: String) -> Bool {
        lower == "help" || lower == "yardım" || lower.hasPrefix("help ") || lower.contains("shortcuts")
            || lower.contains("kısayol") || lower.contains("ne yapabilir") || lower.contains("how do i")
    }

    private static func isGreeting(_ lower: String) -> Bool {
        ["hi", "hello", "hey", "merhaba", "selam", "günaydın"].contains(lower)
            || lower.hasPrefix("hello ") || lower.hasPrefix("hi ")
    }

    private static func isSummarize(_ lower: String) -> Bool {
        lower.contains("summar") || lower.contains("özet") || lower.contains("overview")
            || lower.contains("what does this") || lower.contains("bu dosya")
    }

    private static func isStats(_ lower: String) -> Bool {
        lower.contains("how many") || lower.contains("line count") || lower.contains("kaç satır")
            || lower.contains("kaç karakter") || lower.contains("word count") || lower.contains("stats")
    }

    private static func mentionsFile(_ lower: String) -> Bool {
        lower.contains("this file") || lower.contains("open file") || lower.contains("current file")
            || lower.contains("dosya") || lower.contains("açık dosya")
    }

    private static func mentionsSelection(_ lower: String) -> Bool {
        lower.contains("selection") || lower.contains("selected") || lower.contains("seçim") || lower.contains("seçili")
    }

    private static func identity(turkish: Bool, engine: String) -> String {
        if turkish {
            return """
            Ben ForgeBot’um — LocalForge içinde yazılmış yerel, özgün bir asistan. \
            Grok değilim, xAI ürünü değilim, Cursor da değilim. Ağ gerekmez. \
            Şu an \(engine). Açık dosya veya seçim varsa ona bakarak yanıtlarım.
            """
        }
        return """
        I’m ForgeBot, an original local assistant written for LocalForge. \
        I am not Grok, not an xAI product, and not Cursor. No cloud account. \
        Right now: \(engine). Open a file if you want answers grounded in your text.
        """
    }

    private static func help(turkish: Bool, fileName: String?) -> String {
        let fileBit = fileName.map { turkish ? "Açık dosya: \($0)." : "Open file: \($0)." }
            ?? (turkish ? "Henüz dosya açık değil." : "No file is open yet.")
        if turkish {
            return """
            LocalForge: klasör aç (⌘O), kaydet (⌘S), komut (⌘R), ForgeBot paneli (⌘L). \
            \(fileBit) Bana “özet”, “kaç satır”, veya dosyada aramak istediğin bir kelime yaz. \
            İsteğe bağlı: bu Mac’te Ollama çalışıyorsa yalnızca localhost kullanılır.
            """
        }
        return """
        LocalForge: open folder (⌘O), save (⌘S), run a command (⌘R), ForgeBot panel (⌘L). \
        \(fileBit) Ask for a summary, line counts, or a word to find in the open file. \
        Optional: if Ollama is running on this Mac, chat can use localhost only.
        """
    }

    private static func greeting(turkish: Bool, fileName: String?, engine: String) -> String {
        if turkish {
            let extra = fileName.map { " “\($0)” açık — özet veya arama isteyebilirsin." } ?? " İstersen bir klasör aç."
            return "Merhaba. ForgeBot buradayım (\(engine)).\(extra)"
        }
        let extra = fileName.map { " “\($0)” is open — ask for a summary or a search." } ?? " Open a folder when you want files."
        return "Hello. ForgeBot is here (\(engine)).\(extra)"
    }

    private static func stats(turkish: Bool, fileName: String, body: String, selection: String) -> String {
        let lines = lineCount(body)
        let words = wordCount(body)
        let chars = body.count
        let sel = selection.isEmpty ? "" : (turkish
            ? " Seçim: \(selection.count) karakter."
            : " Selection: \(selection.count) characters.")
        if turkish {
            return "“\(fileName)”: \(lines) satır, \(words) sözcük, \(chars) karakter.\(sel)"
        }
        return "“\(fileName)”: \(lines) lines, \(words) words, \(chars) characters.\(sel)"
    }

    private static func summarize(turkish: Bool, fileName: String, body: String, selection: String) -> String {
        let preview = firstMeaningfulLines(body, limit: 8)
        let headings = headingLikeLines(body)
        var parts: [String] = []
        if turkish {
            parts.append("“\(fileName)” özeti (\(lineCount(body)) satır). ForgeBot yerel bir tarama yapıyor — bulut modeli değil.")
        } else {
            parts.append("Summary of “\(fileName)” (\(lineCount(body)) lines). ForgeBot is scanning locally — not a cloud model.")
        }
        if !headings.isEmpty {
            parts.append((turkish ? "Yapı:\n" : "Structure:\n") + headings.prefix(12).map { "• \($0)" }.joined(separator: "\n"))
        }
        if !preview.isEmpty {
            parts.append((turkish ? "Başlangıç:\n" : "Opening:\n") + preview)
        }
        if !selection.isEmpty {
            parts.append((turkish ? "Seçimin:\n" : "Your selection:\n") + clipBlock(selection, 600))
        }
        return parts.joined(separator: "\n\n")
    }

    private static func search(turkish: Bool, fileName: String, body: String, needle: String) -> String {
        let hits = matchingLines(in: body, needle: needle, limit: 12)
        if hits.isEmpty {
            return turkish
                ? "“\(fileName)” içinde “\(needle)” geçmiyor."
                : "No lines in “\(fileName)” contain “\(needle)”."
        }
        let listed = hits.map { "L\($0.number): \($0.text)" }.joined(separator: "\n")
        return turkish
            ? "“\(fileName)” içinde “\(needle)” (\(hits.count) satır):\n\(listed)"
            : "“\(needle)” in “\(fileName)” (\(hits.count) line(s)):\n\(listed)"
    }

    private static func fileGrounded(turkish: Bool, question: String, fileName: String, body: String, selection: String) -> String {
        let tokens = significantTokens(from: question)
        var hits: [(number: Int, text: String)] = []
        for token in tokens.prefix(6) {
            hits.append(contentsOf: matchingLines(in: body, needle: token, limit: 4))
        }
        var unique: [(number: Int, text: String)] = []
        var seen = Set<Int>()
        for hit in hits where seen.insert(hit.number).inserted {
            unique.append(hit)
            if unique.count >= 10 { break }
        }

        var parts: [String] = []
        if turkish {
            parts.append("ForgeBot (yerel). “\(fileName)” bağlamında bakıyorum.")
        } else {
            parts.append("ForgeBot (local). Looking at “\(fileName)” for your question.")
        }
        parts.append(turkish ? "Soru: \(question)" : "Question: \(question)")
        if !unique.isEmpty {
            parts.append((turkish ? "İlgili satırlar:\n" : "Related lines:\n")
                + unique.map { "L\($0.number): \($0.text)" }.joined(separator: "\n"))
        } else {
            parts.append(summarize(turkish: turkish, fileName: fileName, body: body, selection: selection))
        }
        if !selection.isEmpty {
            parts.append((turkish ? "Seçim:\n" : "Selection:\n") + clipBlock(selection, 400))
        }
        return parts.joined(separator: "\n\n")
    }

    private static func selectionNote(turkish: Bool, selection: String, fileName: String?) -> String {
        let whereFrom = fileName.map { " (\($0))" } ?? ""
        if turkish {
            return "Seçili metin\(whereFrom):\n\(clipBlock(selection, 1200))\n\nForgeBot yalnızca bu seçime bakıyor; bulut yok."
        }
        return "Selected text\(whereFrom):\n\(clipBlock(selection, 1200))\n\nForgeBot is looking only at this selection; no cloud."
    }

    private static func fallback(turkish: Bool, question: String, engine: String) -> String {
        if turkish {
            return """
            ForgeBot burada (\(engine)). Bir bulut modeli değilim. \
            “\(question)” için açık bir dosya yok. Klasör açıp bir dosya seçersen özetler, sayar veya ararım. \
            Kim olduğumu sormak için “kimsin”, kısayollar için “yardım” yaz.
            """
        }
        return """
        ForgeBot here (\(engine)). I’m not a cloud model. \
        There’s no open file to ground “\(question)”. Open a folder and a file, then I can summarize, count, or search. \
        Ask “who are you” or “help” anytime.
        """
    }

    private static func searchNeedle(from question: String, lower: String) -> String? {
        let prefixes = ["find ", "search ", "locate ", "ara ", "bul ", "where is ", "where's "]
        for prefix in prefixes where lower.hasPrefix(prefix) {
            let start = question.index(question.startIndex, offsetBy: prefix.count)
            let rest = question[start...].trimmingCharacters(in: .whitespacesAndNewlines)
            if rest.count >= 2 { return rest }
        }
        if let quoted = firstQuoted(in: question), quoted.count >= 2 {
            return quoted
        }
        return nil
    }

    private static func firstQuoted(in text: String) -> String? {
        let openers: Set<Character> = ["\"", "“", "”", "'"]
        var start: String.Index?
        for index in text.indices {
            let ch = text[index]
            if openers.contains(ch) {
                if let start {
                    let inner = text[text.index(after: start)..<index]
                    return String(inner)
                }
                start = index
            }
        }
        return nil
    }

    private static func lineCount(_ text: String) -> Int {
        if text.isEmpty { return 0 }
        return text.reduce(1) { $1 == "\n" ? $0 + 1 : $0 }
    }

    private static func wordCount(_ text: String) -> Int {
        text.split { $0.isWhitespace || $0.isNewline }.count
    }

    private static func firstMeaningfulLines(_ text: String, limit: Int) -> String {
        let lines = text.split(omittingEmptySubsequences: false, whereSeparator: \.isNewline)
            .map { $0.trimmingCharacters(in: .whitespaces) }
            .filter { !$0.isEmpty && !$0.hasPrefix("//") && !$0.hasPrefix("#") && $0 != "{" && $0 != "}" }
        return lines.prefix(limit).joined(separator: "\n")
    }

    private static func headingLikeLines(_ text: String) -> [String] {
        text.split(whereSeparator: \.isNewline).compactMap { raw -> String? in
            let line = raw.trimmingCharacters(in: .whitespaces)
            if line.hasPrefix("#") { return line }
            if line.hasPrefix("func ") || line.hasPrefix("class ") || line.hasPrefix("struct ")
                || line.hasPrefix("enum ") || line.hasPrefix("def ") || line.hasPrefix("fn ") {
                return String(line.prefix(120))
            }
            return nil
        }
    }

    private static func matchingLines(in text: String, needle: String, limit: Int) -> [(number: Int, text: String)] {
        let query = needle.trimmingCharacters(in: .whitespacesAndNewlines)
        guard query.count >= 2 else { return [] }
        var results: [(number: Int, text: String)] = []
        for (index, raw) in text.split(omittingEmptySubsequences: false, whereSeparator: \.isNewline).enumerated() {
            let line = String(raw)
            if line.range(of: query, options: [.caseInsensitive, .diacriticInsensitive]) != nil {
                results.append((index + 1, String(line.prefix(180))))
                if results.count >= limit { break }
            }
        }
        return results
    }

    private static func significantTokens(from question: String) -> [String] {
        let stop: Set<String> = [
            "the", "a", "an", "and", "or", "of", "to", "in", "on", "for", "is", "it", "this", "that",
            "what", "how", "why", "please", "can", "you", "me", "my", "file", "dosya", "nedir", "nasıl",
            "bir", "bu", "mi", "mı", "mu", "mü", "about", "with"
        ]
        return question.split { $0.isWhitespace || $0.isPunctuation }.map(String.init)
            .filter { $0.count >= 3 && !stop.contains($0.lowercased()) }
    }

    private static func clipBlock(_ text: String, _ limit: Int) -> String {
        if text.count <= limit { return text }
        let idx = text.index(text.startIndex, offsetBy: limit)
        return String(text[..<idx]) + "…"
    }
}
