import { describe, expect, it } from "vitest";
import { cn, formatAccuracy, formatDuration, initials } from "@/lib/utils";

describe("cn", () => {
  it("merges and dedupes tailwind classes", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("text-sm", false, "font-bold")).toBe("text-sm font-bold");
  });
});

describe("formatAccuracy", () => {
  it("formats meters and kilometers", () => {
    expect(formatAccuracy(50)).toBe("±50 m");
    expect(formatAccuracy(1500)).toBe("±1.5 km");
    expect(formatAccuracy(null)).toBe("—");
  });
});

describe("formatDuration", () => {
  it("formats seconds, minutes and hours", () => {
    expect(formatDuration(0, 30_000)).toBe("30s");
    expect(formatDuration(0, 90_000)).toBe("1m 30s");
    expect(formatDuration(0, 3_700_000)).toBe("1h 1m");
  });
});

describe("initials", () => {
  it("derives up to two initials", () => {
    expect(initials("Jane Doe")).toBe("JD");
    expect(initials("madonna")).toBe("M");
    expect(initials("")).toBe("?");
  });
});
