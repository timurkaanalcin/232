import { notificationPrefKeyForType } from "@/lib/constants";
import type { PrivacyPreferencesDTO } from "@/types";

interface PrivacyPrefsRow {
  user_id: string;
  notify_session: number;
  notify_security: number;
  notify_consent: number;
  marketing_opt_in: number;
  location_retention_days: number;
  updated_at: number;
}

export const DEFAULT_PRIVACY_PREFS: PrivacyPreferencesDTO = {
  notifySession: true,
  notifySecurity: true,
  notifyConsent: true,
  marketingOptIn: false,
  locationRetentionDays: 0,
  updatedAt: null,
};

function toDTO(row: PrivacyPrefsRow): PrivacyPreferencesDTO {
  const days = row.location_retention_days;
  const locationRetentionDays: PrivacyPreferencesDTO["locationRetentionDays"] =
    days === 30 || days === 90 || days === 365 ? days : 0;
  return {
    notifySession: row.notify_session === 1,
    notifySecurity: row.notify_security === 1,
    notifyConsent: row.notify_consent === 1,
    marketingOptIn: row.marketing_opt_in === 1,
    locationRetentionDays,
    updatedAt: row.updated_at,
  };
}

export async function getPrivacyPrefs(db: D1Database, userId: string): Promise<PrivacyPreferencesDTO> {
  try {
    const row = await db
      .prepare(`SELECT * FROM user_privacy_prefs WHERE user_id = ?`)
      .bind(userId)
      .first<PrivacyPrefsRow>();
    return row ? toDTO(row) : { ...DEFAULT_PRIVACY_PREFS };
  } catch {
    return { ...DEFAULT_PRIVACY_PREFS };
  }
}

export async function upsertPrivacyPrefs(
  db: D1Database,
  userId: string,
  patch: Partial<Omit<PrivacyPreferencesDTO, "updatedAt">>,
): Promise<PrivacyPreferencesDTO> {
  const current = await getPrivacyPrefs(db, userId);
  const next: PrivacyPreferencesDTO = {
    notifySession: patch.notifySession ?? current.notifySession,
    notifySecurity: patch.notifySecurity ?? current.notifySecurity,
    notifyConsent: patch.notifyConsent ?? current.notifyConsent,
    marketingOptIn: patch.marketingOptIn ?? current.marketingOptIn,
    locationRetentionDays: patch.locationRetentionDays ?? current.locationRetentionDays,
    updatedAt: Date.now(),
  };

  await db
    .prepare(
      `INSERT INTO user_privacy_prefs (
         user_id, notify_session, notify_security, notify_consent, marketing_opt_in, location_retention_days, updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(user_id) DO UPDATE SET
         notify_session = excluded.notify_session,
         notify_security = excluded.notify_security,
         notify_consent = excluded.notify_consent,
         marketing_opt_in = excluded.marketing_opt_in,
         location_retention_days = excluded.location_retention_days,
         updated_at = excluded.updated_at`,
    )
    .bind(
      userId,
      next.notifySession ? 1 : 0,
      next.notifySecurity ? 1 : 0,
      next.notifyConsent ? 1 : 0,
      next.marketingOptIn ? 1 : 0,
      next.locationRetentionDays,
      next.updatedAt,
    )
    .run();

  return next;
}

export async function shouldSendNotification(db: D1Database, userId: string, type: string): Promise<boolean> {
  const key = notificationPrefKeyForType(type);
  if (!key) return true;
  const prefs = await getPrivacyPrefs(db, userId);
  return prefs[key];
}
