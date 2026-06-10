import { describe, expect, it } from "vitest";
import {
  constantTimeEqual,
  hashPassword,
  hmacSign,
  hmacVerify,
  randomToken,
  sha256Hex,
  verifyPassword,
} from "@/lib/crypto";

describe("password hashing", () => {
  it("hashes and verifies a correct password", async () => {
    const hash = await hashPassword("S3curePass!word");
    expect(hash.startsWith("pbkdf2$")).toBe(true);
    expect(await verifyPassword(hash, "S3curePass!word")).toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const hash = await hashPassword("S3curePass!word");
    expect(await verifyPassword(hash, "wrong-password")).toBe(false);
  });

  it("produces unique salts for identical passwords", async () => {
    const a = await hashPassword("same-password-123");
    const b = await hashPassword("same-password-123");
    expect(a).not.toBe(b);
  });

  it("rejects malformed stored hashes", async () => {
    expect(await verifyPassword("not-a-valid-hash", "whatever")).toBe(false);
    expect(await verifyPassword("pbkdf2$abc$def", "whatever")).toBe(false);
  });
});

describe("constantTimeEqual", () => {
  it("returns true for equal buffers and false otherwise", () => {
    const a = new TextEncoder().encode("token");
    const b = new TextEncoder().encode("token");
    const c = new TextEncoder().encode("other");
    expect(constantTimeEqual(a, b)).toBe(true);
    expect(constantTimeEqual(a, c)).toBe(false);
  });
});

describe("tokens and hashing", () => {
  it("generates url-safe random tokens", () => {
    const token = randomToken(32);
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(randomToken()).not.toBe(randomToken());
  });

  it("computes a stable sha-256 hex digest", async () => {
    expect(await sha256Hex("hello")).toBe(
      "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
    );
  });
});

describe("hmac", () => {
  it("signs and verifies", async () => {
    const sig = await hmacSign("secret", "payload");
    expect(await hmacVerify("secret", "payload", sig)).toBe(true);
  });

  it("fails verification with a wrong secret or tampered data", async () => {
    const sig = await hmacSign("secret", "payload");
    expect(await hmacVerify("other-secret", "payload", sig)).toBe(false);
    expect(await hmacVerify("secret", "tampered", sig)).toBe(false);
  });
});
