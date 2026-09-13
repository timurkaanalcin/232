import Foundation
import Security

/// Stores the xAI API key outside git: Keychain first, then env / local dotenv files.
enum GrokSecrets {
    static let service = "com.timurkaanalcin.localforge"
    static let account = "XAI_API_KEY"
    static let envKey = "XAI_API_KEY"

    static func resolvedAPIKey() -> String? {
        if let key = readKeychain(), !key.isEmpty { return key }
        if let key = ProcessInfo.processInfo.environment[envKey]?.trimmingCharacters(in: .whitespacesAndNewlines),
           !key.isEmpty {
            return key
        }
        if let key = readDotEnvFile(at: applicationSupportEnvURL()), !key.isEmpty { return key }
        if let key = readDotEnvFile(at: homeDotEnvURL()), !key.isEmpty { return key }
        return nil
    }

    static func hasStoredKey() -> Bool {
        resolvedAPIKey() != nil
    }

    static func keySourceDescription() -> String {
        if let key = readKeychain(), !key.isEmpty { return "macOS Keychain" }
        if let key = ProcessInfo.processInfo.environment[envKey], !key.isEmpty { return "XAI_API_KEY environment" }
        if readDotEnvFile(at: applicationSupportEnvURL()) != nil {
            return "Application Support .env"
        }
        if readDotEnvFile(at: homeDotEnvURL()) != nil {
            return "~/.localforge.env"
        }
        return "not set"
    }

    static func saveToKeychain(_ secret: String) throws {
        let trimmed = secret.trimmingCharacters(in: .whitespacesAndNewlines)
        deleteFromKeychain()
        guard !trimmed.isEmpty else { return }
        let data = Data(trimmed.utf8)
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
            kSecValueData as String: data,
            kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlock
        ]
        let status = SecItemAdd(query as CFDictionary, nil)
        guard status == errSecSuccess else {
            throw GrokSecretError.keychain(status)
        }
    }

    static func deleteFromKeychain() {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account
        ]
        SecItemDelete(query as CFDictionary)
    }

    static func applicationSupportEnvURL() -> URL {
        let base = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first
            ?? FileManager.default.homeDirectoryForCurrentUser.appendingPathComponent("Library/Application Support")
        return base.appendingPathComponent("LocalForge/.env", isDirectory: false)
    }

    static func homeDotEnvURL() -> URL {
        FileManager.default.homeDirectoryForCurrentUser.appendingPathComponent(".localforge.env")
    }

    private static func readKeychain() -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]
        var item: CFTypeRef?
        let status = SecItemCopyMatching(query as CFDictionary, &item)
        guard status == errSecSuccess, let data = item as? Data else { return nil }
        return String(data: data, encoding: .utf8)
    }

    private static func readDotEnvFile(at url: URL) -> String? {
        guard let raw = try? String(contentsOf: url, encoding: .utf8) else { return nil }
        for line in raw.split(whereSeparator: \.isNewline) {
            let trimmed = line.trimmingCharacters(in: .whitespaces)
            if trimmed.isEmpty || trimmed.hasPrefix("#") { continue }
            let parts = trimmed.split(separator: "=", maxSplits: 1)
            guard parts.count == 2 else { continue }
            let name = parts[0].trimmingCharacters(in: .whitespaces)
            var value = parts[1].trimmingCharacters(in: .whitespaces)
            if (value.hasPrefix("\"") && value.hasSuffix("\"")) || (value.hasPrefix("'") && value.hasSuffix("'")) {
                value = String(value.dropFirst().dropLast())
            }
            if name == envKey, !value.isEmpty { return value }
        }
        return nil
    }
}

enum GrokSecretError: LocalizedError {
    case keychain(OSStatus)

    var errorDescription: String? {
        switch self {
        case .keychain(let status):
            return "Keychain error (\(status))."
        }
    }
}
