import { describe, expect, it } from "vitest";
import { deviceNameFromUserAgent } from "@/lib/device";

describe("deviceNameFromUserAgent", () => {
  it("detects Chrome on Windows", () => {
    const ua =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";
    expect(deviceNameFromUserAgent(ua)).toBe("Chrome on Windows");
  });

  it("detects Safari on iOS", () => {
    const ua =
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
    expect(deviceNameFromUserAgent(ua)).toBe("Safari on iOS");
  });

  it("falls back gracefully for empty input", () => {
    expect(deviceNameFromUserAgent("")).toBe("Unknown device");
  });
});
