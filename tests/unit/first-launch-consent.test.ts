import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  FIRST_LAUNCH_CONSENT_KEY,
  hasCompletedFirstLaunchConsent,
  isLocationConsentAccepted,
  isNotificationConsentAccepted,
  parseFirstLaunchConsent,
  readFirstLaunchConsent,
  writeFirstLaunchConsent,
} from "@/lib/first-launch-consent";

describe("parseFirstLaunchConsent", () => {
  it("accepts a complete v1 record and forces marketing off", () => {
    const parsed = parseFirstLaunchConsent(
      JSON.stringify({
        version: 1,
        completedAt: 1,
        location: true,
        notifications: false,
        marketingOptIn: true,
      }),
    );
    expect(parsed).toEqual({
      version: 1,
      completedAt: 1,
      location: true,
      notifications: false,
      marketingOptIn: false,
    });
  });

  it("rejects incomplete or foreign payloads", () => {
    expect(parseFirstLaunchConsent(null)).toBeNull();
    expect(parseFirstLaunchConsent("{")).toBeNull();
    expect(parseFirstLaunchConsent(JSON.stringify({ version: 2, location: true }))).toBeNull();
    expect(parseFirstLaunchConsent(JSON.stringify({ version: 1, completedAt: 1 }))).toBeNull();
  });
});

describe("first-launch storage", () => {
  const memory = new Map<string, string>();

  beforeEach(() => {
    memory.clear();
    (globalThis as unknown as { window: unknown }).window = {
      localStorage: {
        getItem: (key: string) => memory.get(key) ?? null,
        setItem: (key: string, value: string) => {
          memory.set(key, value);
        },
        clear: () => memory.clear(),
      },
      dispatchEvent: () => true,
    };
  });

  afterEach(() => {
    memory.clear();
  });

  it("starts incomplete and persists per-item choices", () => {
    expect(hasCompletedFirstLaunchConsent()).toBe(false);
    expect(isLocationConsentAccepted()).toBe(false);

    const saved = writeFirstLaunchConsent({ location: true, notifications: false });
    expect(saved.marketingOptIn).toBe(false);
    expect(hasCompletedFirstLaunchConsent()).toBe(true);
    expect(isLocationConsentAccepted()).toBe(true);
    expect(isNotificationConsentAccepted()).toBe(false);
    expect(readFirstLaunchConsent()?.location).toBe(true);
    expect(memory.get(FIRST_LAUNCH_CONSENT_KEY)).toContain('"location":true');
  });

  it("does not treat declined items as granted", () => {
    writeFirstLaunchConsent({ location: false, notifications: false });
    expect(hasCompletedFirstLaunchConsent()).toBe(true);
    expect(isLocationConsentAccepted()).toBe(false);
    expect(isNotificationConsentAccepted()).toBe(false);
  });
});
