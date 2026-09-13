import { describe, expect, it } from "vitest";
import {
  loginSchema,
  passwordSchema,
  positionSchema,
  createRiskEventSchema,
  createWalletSchema,
  riskEventActionSchema,
  riskEventQuerySchema,
  updateWalletStatusSchema,
  walletTransferSchema,
  registerSchema,
  startLocationSessionSchema,
  privacyPreferencesSchema,
  deleteLocationHistorySchema,
} from "@/lib/validators";
import { notificationPrefKeyForType } from "@/lib/constants";

describe("passwordSchema", () => {
  it("accepts strong passwords", () => {
    expect(passwordSchema.safeParse("Str0ngPassword").success).toBe(true);
  });

  it.each([["short1A"], ["alllowercase1"], ["ALLUPPERCASE1"], ["NoDigitsHere"]])(
    "rejects weak password %s",
    (value) => {
      expect(passwordSchema.safeParse(value).success).toBe(false);
    },
  );
});

describe("registerSchema", () => {
  it("normalizes email to lowercase", () => {
    const result = registerSchema.parse({
      name: "Jane",
      email: "Jane@Example.COM",
      password: "Str0ngPassword",
    });
    expect(result.email).toBe("jane@example.com");
  });
});

describe("loginSchema", () => {
  it("requires a non-empty password", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "" }).success).toBe(false);
  });
});

describe("startLocationSessionSchema", () => {
  it("requires explicit consent === true", () => {
    expect(startLocationSessionSchema.safeParse({ consent: false }).success).toBe(false);
    expect(startLocationSessionSchema.safeParse({ consent: true }).success).toBe(true);
  });
});

describe("privacy preference validators", () => {
  it("requires at least one preference field", () => {
    expect(privacyPreferencesSchema.safeParse({}).success).toBe(false);
    expect(privacyPreferencesSchema.safeParse({ marketingOptIn: true }).success).toBe(true);
  });

  it("rejects unknown retention windows", () => {
    expect(privacyPreferencesSchema.safeParse({ locationRetentionDays: 7 }).success).toBe(false);
    expect(privacyPreferencesSchema.safeParse({ locationRetentionDays: 90 }).success).toBe(true);
  });

  it("requires explicit confirmation to delete location history", () => {
    expect(deleteLocationHistorySchema.safeParse({ confirm: false }).success).toBe(false);
    expect(deleteLocationHistorySchema.safeParse({ confirm: true }).success).toBe(true);
  });
});

describe("notificationPrefKeyForType", () => {
  it("maps session and consent events to opt-out channels", () => {
    expect(notificationPrefKeyForType("location.session_started")).toBe("notifySession");
    expect(notificationPrefKeyForType("consent.revoked")).toBe("notifyConsent");
    expect(notificationPrefKeyForType("auth.login")).toBe("notifySecurity");
  });
});

describe("positionSchema", () => {
  it("accepts a valid position", () => {
    expect(
      positionSchema.safeParse({ lat: 41.0, lng: 29.0, acc: 10, ts: Date.now() }).success,
    ).toBe(true);
  });

  it("rejects out-of-range coordinates", () => {
    expect(positionSchema.safeParse({ lat: 200, lng: 29, acc: 10, ts: Date.now() }).success).toBe(false);
    expect(positionSchema.safeParse({ lat: 41, lng: -500, acc: 10, ts: Date.now() }).success).toBe(false);
  });
});

describe("risk event validators", () => {
  it("accepts paginated filters for risk events", () => {
    const result = riskEventQuerySchema.parse({
      page: "2",
      pageSize: "50",
      status: "open",
      severity: "critical",
      subject: "wallet-123",
    });

    expect(result).toMatchObject({ page: 2, pageSize: 50, status: "open", severity: "critical" });
  });

  it("bounds risk scores to the expected range", () => {
    expect(
      createRiskEventSchema.safeParse({
        source: "ai_risk_engine",
        eventType: "risk.limit_breached",
        severity: "warning",
        riskScore: 100,
        title: "Drawdown limit warning",
      }).success,
    ).toBe(true);

    expect(
      createRiskEventSchema.safeParse({
        source: "ai_risk_engine",
        eventType: "risk.limit_breached",
        severity: "warning",
        riskScore: 101,
        title: "Drawdown limit warning",
      }).success,
    ).toBe(false);
  });

  it("limits operator notes for risk event actions", () => {
    expect(riskEventActionSchema.safeParse({ note: "Reviewed by desk" }).success).toBe(true);
    expect(riskEventActionSchema.safeParse({ note: "x".repeat(1_001) }).success).toBe(false);
  });
});

describe("wallet validators", () => {
  it("normalizes wallet currencies to uppercase", () => {
    const result = createWalletSchema.parse({
      userId: "00000000-0000-4000-8000-000000000001",
      walletType: "trading",
      currency: "usd",
    });

    expect(result.currency).toBe("USD");
  });

  it("rejects invalid transfer amounts", () => {
    expect(
      walletTransferSchema.safeParse({
        fromWalletId: "00000000-0000-4000-8000-000000000001",
        toWalletId: "00000000-0000-4000-8000-000000000002",
        amountMinor: 1,
      }).success,
    ).toBe(true);

    expect(
      walletTransferSchema.safeParse({
        fromWalletId: "00000000-0000-4000-8000-000000000001",
        toWalletId: "00000000-0000-4000-8000-000000000002",
        amountMinor: 0,
      }).success,
    ).toBe(false);
  });

  it("accepts archive as a wallet status change", () => {
    expect(updateWalletStatusSchema.safeParse({ status: "archived", memo: "closed by admin" }).success).toBe(true);
    expect(updateWalletStatusSchema.safeParse({ status: "deleted" }).success).toBe(false);
  });
});
