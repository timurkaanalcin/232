/**
 * Short-lived signed tickets that authenticate WebSocket upgrade requests.
 * The browser cannot set Authorization headers on WebSocket connections, so
 * the client first obtains a ticket over the authenticated HTTPS API and
 * passes it as a query parameter. Tickets expire after 60 seconds.
 */
import { base64UrlDecode, base64UrlEncode, hmacSign, hmacVerify } from "@/lib/crypto";
import { SECURITY } from "@/lib/constants";
import type { RealtimeTicketPayload } from "@/types";

export async function createTicket(
  secret: string,
  payload: Omit<RealtimeTicketPayload, "exp">,
): Promise<string> {
  const full: RealtimeTicketPayload = { ...payload, exp: Date.now() + SECURITY.WS_TICKET_TTL_MS };
  const body = base64UrlEncode(JSON.stringify(full));
  const sig = await hmacSign(secret, body);
  return `${body}.${sig}`;
}

export async function verifyTicket(secret: string, ticket: string): Promise<RealtimeTicketPayload | null> {
  const dot = ticket.lastIndexOf(".");
  if (dot <= 0) return null;
  const body = ticket.slice(0, dot);
  const sig = ticket.slice(dot + 1);
  if (!(await hmacVerify(secret, body, sig))) return null;
  try {
    const payload = JSON.parse(base64UrlDecode(body)) as RealtimeTicketPayload;
    if (typeof payload.exp !== "number" || payload.exp < Date.now()) return null;
    if (payload.scope !== "publish" && payload.scope !== "view") return null;
    if (typeof payload.sub !== "string" || !payload.sub) return null;
    return payload;
  } catch {
    return null;
  }
}
