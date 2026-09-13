import { describe, expect, it } from "vitest";
import {
  cn,
  formatAccuracy,
  formatCalendarDate,
  formatDateTime,
  formatDuration,
  formatTime,
  initials,
} from "@/lib/utils";

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

describe("localized date/time formatting", () => {
  const timestamp = Date.UTC(2026, 0, 1, 12, 0, 0);

  it("formats date/time with the supplied locale and timezone", () => {
    const preferences = { locale: "de-DE", timeZone: "Europe/Berlin" };
    expect(formatDateTime(timestamp, preferences)).toBe(
      new Intl.DateTimeFormat(preferences.locale, {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: preferences.timeZone,
      }).format(new Date(timestamp)),
    );
  });

  it("formats time with regional timezone offsets", () => {
    expect(formatTime(timestamp, { locale: "tr-TR", timeZone: "Europe/Istanbul" })).toBe(
      new Intl.DateTimeFormat("tr-TR", {
        timeStyle: "medium",
        timeZone: "Europe/Istanbul",
      }).format(new Date(timestamp)),
    );
  });

  it("formats calendar dates with localized weekday and month names", () => {
    expect(formatCalendarDate(timestamp, { locale: "ru-RU", timeZone: "Europe/Moscow" })).toBe(
      new Intl.DateTimeFormat("ru-RU", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Europe/Moscow",
      }).format(new Date(timestamp)),
    );
  });
});

describe("initials", () => {
  it("derives up to two initials", () => {
    expect(initials("Jane Doe")).toBe("JD");
    expect(initials("madonna")).toBe("M");
    expect(initials("")).toBe("?");
  });
});
