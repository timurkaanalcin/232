/** First-launch bulk consent — location + notifications only. No extra sensors. */

export const FIRST_LAUNCH_CONSENT_KEY = "canlisite.firstLaunchConsent.v1";
export const FIRST_LAUNCH_CONSENT_EVENT = "canlisite:first-launch-consent";

export interface FirstLaunchConsent {
  version: 1;
  completedAt: number;
  location: boolean;
  notifications: boolean;
  /** Always stored false from this screen; marketing requires a later opt-in. */
  marketingOptIn: false;
}

export type FirstLaunchChoices = Pick<FirstLaunchConsent, "location" | "notifications">;

export function emptyFirstLaunchChoices(): FirstLaunchChoices {
  return { location: false, notifications: false };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function parseFirstLaunchConsent(raw: string | null): FirstLaunchConsent | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return null;
    if (parsed.version !== 1) return null;
    if (typeof parsed.completedAt !== "number" || !Number.isFinite(parsed.completedAt)) return null;
    if (typeof parsed.location !== "boolean") return null;
    if (typeof parsed.notifications !== "boolean") return null;
    return {
      version: 1,
      completedAt: parsed.completedAt,
      location: parsed.location,
      notifications: parsed.notifications,
      marketingOptIn: false,
    };
  } catch {
    return null;
  }
}

export function readFirstLaunchConsent(): FirstLaunchConsent | null {
  if (typeof window === "undefined") return null;
  return parseFirstLaunchConsent(window.localStorage.getItem(FIRST_LAUNCH_CONSENT_KEY));
}

export function hasCompletedFirstLaunchConsent(): boolean {
  return readFirstLaunchConsent() !== null;
}

export function isLocationConsentAccepted(): boolean {
  return readFirstLaunchConsent()?.location === true;
}

export function isNotificationConsentAccepted(): boolean {
  return readFirstLaunchConsent()?.notifications === true;
}

export function writeFirstLaunchConsent(choices: FirstLaunchChoices): FirstLaunchConsent {
  const record: FirstLaunchConsent = {
    version: 1,
    completedAt: Date.now(),
    location: choices.location,
    notifications: choices.notifications,
    marketingOptIn: false,
  };
  if (typeof window !== "undefined") {
    window.localStorage.setItem(FIRST_LAUNCH_CONSENT_KEY, JSON.stringify(record));
    window.dispatchEvent(new CustomEvent(FIRST_LAUNCH_CONSENT_EVENT, { detail: record }));
  }
  return record;
}

/** Session-level ConsentDialog accepted — keep bulk consent in sync. */
export function markLocationConsentAccepted(): FirstLaunchConsent {
  const current = readFirstLaunchConsent();
  return writeFirstLaunchConsent({
    location: true,
    notifications: current?.notifications ?? false,
  });
}

declare global {
  interface Window {
    CanlisiteNative?: {
      requestAcceptedPermissions?: (location: boolean, notifications: boolean) => void;
    };
  }
}
