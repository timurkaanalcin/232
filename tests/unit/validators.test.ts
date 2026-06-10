import { describe, expect, it } from "vitest";
import {
  loginSchema,
  passwordSchema,
  positionSchema,
  registerSchema,
  startLocationSessionSchema,
} from "@/lib/validators";

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
