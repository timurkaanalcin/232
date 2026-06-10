import { describe, expect, it } from "vitest";
import { createTicket, verifyTicket } from "@/lib/ws-ticket";

const SECRET = "test-secret-value";

describe("ws tickets", () => {
  it("round-trips a valid publish ticket", async () => {
    const ticket = await createTicket(SECRET, {
      sub: "user-1",
      role: "user",
      sid: "session-1",
      scope: "publish",
      lsid: "loc-1",
      name: "Test User",
    });
    const payload = await verifyTicket(SECRET, ticket);
    expect(payload?.sub).toBe("user-1");
    expect(payload?.scope).toBe("publish");
    expect(payload?.lsid).toBe("loc-1");
  });

  it("rejects a ticket signed with a different secret", async () => {
    const ticket = await createTicket(SECRET, {
      sub: "user-1",
      role: "admin",
      sid: "session-1",
      scope: "view",
      name: "Admin",
    });
    expect(await verifyTicket("wrong-secret", ticket)).toBeNull();
  });

  it("rejects a tampered ticket", async () => {
    const ticket = await createTicket(SECRET, {
      sub: "user-1",
      role: "user",
      sid: "session-1",
      scope: "publish",
      name: "Test",
    });
    const tampered = `${ticket.slice(0, -2)}xy`;
    expect(await verifyTicket(SECRET, tampered)).toBeNull();
  });

  it("rejects an expired ticket", async () => {
    const ticket = await createTicket(SECRET, {
      sub: "user-1",
      role: "user",
      sid: "session-1",
      scope: "publish",
      name: "Test",
    });
    // Force the clock far into the future.
    const realNow = Date.now;
    Date.now = () => realNow() + 120_000;
    try {
      expect(await verifyTicket(SECRET, ticket)).toBeNull();
    } finally {
      Date.now = realNow;
    }
  });

  it("rejects malformed input", async () => {
    expect(await verifyTicket(SECRET, "garbage")).toBeNull();
    expect(await verifyTicket(SECRET, "")).toBeNull();
  });
});
