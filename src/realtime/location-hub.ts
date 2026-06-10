import { DurableObject } from "cloudflare:workers";
import { positionSchema } from "@/lib/validators";
import { logAudit } from "@/lib/audit";
import { AUDIT_ACTIONS, REALTIME } from "@/lib/constants";
import { endLocationSession, persistPosition } from "@/services/location-sessions";
import type { LocationSessionDTO, RealtimeServerEvent, SessionEndReason } from "@/types";

interface SocketAttachment {
  userId: string;
  role: string;
  scope: "publish" | "view";
  /** Location session id (publish scope only). */
  lsid?: string;
  name: string;
}

interface ActiveSessionState {
  userId: string;
  lastUpdateAt: number;
}

const VIEWER_TAG = "viewer";
const pubTag = (lsid: string) => `pub:${lsid}`;
const activeKey = (lsid: string) => `active:${lsid}`;

/**
 * Central realtime hub for live location sharing.
 *
 * - Publishers (users actively sharing) connect with `scope=publish` and
 *   stream position messages over WebSocket.
 * - Viewers (admin live map) connect with `scope=view` and receive position
 *   and session lifecycle events.
 *
 * Uses the WebSocket Hibernation API so idle connections cost nothing.
 * Position points are throttled and persisted to D1, and an alarm sweeps
 * stale sessions (no updates for 5 minutes) into `ended/timeout`.
 */
export class LocationHub extends DurableObject<CloudflareEnv> {
  /** In-memory throttle bookkeeping; safe to lose on hibernation. */
  private lastBroadcastAt = new Map<string, number>();
  private lastPersistAt = new Map<string, number>();

  constructor(ctx: DurableObjectState, env: CloudflareEnv) {
    super(ctx, env);
    this.ctx.setWebSocketAutoResponse(
      new WebSocketRequestResponsePair(JSON.stringify({ t: "ping" }), JSON.stringify({ t: "pong" })),
    );
  }

  // --------------------------------------------------------------------------
  // WebSocket lifecycle
  // --------------------------------------------------------------------------

  override async fetch(request: Request): Promise<Response> {
    if (request.headers.get("Upgrade")?.toLowerCase() !== "websocket") {
      return new Response("Expected WebSocket upgrade", { status: 426 });
    }

    const userId = request.headers.get("x-lt-user");
    const role = request.headers.get("x-lt-role") ?? "user";
    const scope = request.headers.get("x-lt-scope") as "publish" | "view" | null;
    const lsid = request.headers.get("x-lt-lsid") ?? undefined;
    const name = request.headers.get("x-lt-name") ?? "";

    if (!userId || !scope || (scope === "publish" && !lsid)) {
      return new Response("Bad upgrade request", { status: 400 });
    }

    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];

    const tags = scope === "view" ? [VIEWER_TAG] : [pubTag(lsid!), `pubuser:${userId}`];
    this.ctx.acceptWebSocket(server, tags);

    const attachment: SocketAttachment = { userId, role, scope, lsid, name };
    server.serializeAttachment(attachment);

    if (scope === "publish" && lsid) {
      await this.ctx.storage.put<ActiveSessionState>(activeKey(lsid), {
        userId,
        lastUpdateAt: Date.now(),
      });
      await this.ensureSweepAlarm();
    }

    this.send(server, {
      t: "hello",
      now: Date.now(),
      viewers: this.ctx.getWebSockets(VIEWER_TAG).length,
    });

    return new Response(null, { status: 101, webSocket: client });
  }

  override async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
    if (typeof message !== "string" || message.length > 4096) return;

    const attachment = ws.deserializeAttachment() as SocketAttachment | null;
    if (!attachment || attachment.scope !== "publish" || !attachment.lsid) return;

    let parsed: unknown;
    try {
      parsed = JSON.parse(message);
    } catch {
      return;
    }
    const data = parsed as { t?: string };
    if (data.t !== "pos") return;

    const position = positionSchema.safeParse(parsed);
    if (!position.success) {
      this.send(ws, { t: "error", code: "invalid_position", message: "Position rejected" });
      return;
    }

    await this.ingestPosition(attachment.lsid, attachment.userId, position.data);
  }

  override async webSocketClose(): Promise<void> {
    // Publishers may reconnect; sessions are ended explicitly via the API or
    // by the stale-session alarm, never by a transient socket drop.
  }

  override async webSocketError(_ws: WebSocket, error: unknown): Promise<void> {
    console.error(JSON.stringify({ msg: "websocket_error", error: String(error) }));
  }

  // --------------------------------------------------------------------------
  // RPC methods (called from API routes / the Worker)
  // --------------------------------------------------------------------------

  async sessionStarted(session: LocationSessionDTO): Promise<void> {
    await this.ctx.storage.put<ActiveSessionState>(activeKey(session.id), {
      userId: session.userId,
      lastUpdateAt: Date.now(),
    });
    await this.ensureSweepAlarm();
    this.broadcastToViewers({ t: "session_started", session });
  }

  async sessionEnded(lsid: string, reason: SessionEndReason): Promise<void> {
    await this.ctx.storage.delete(activeKey(lsid));
    this.lastBroadcastAt.delete(lsid);
    this.lastPersistAt.delete(lsid);

    this.broadcastToViewers({ t: "session_ended", sid: lsid, reason });

    // Force-close the publisher socket so the device stops transmitting.
    for (const socket of this.ctx.getWebSockets(pubTag(lsid))) {
      try {
        socket.close(1000, "session_ended");
      } catch {
        // already closed
      }
    }
  }

  /** REST fallback for clients without a working WebSocket connection. */
  async publishPosition(
    lsid: string,
    userId: string,
    position: { lat: number; lng: number; acc: number; alt?: number | null; spd?: number | null; hdg?: number | null; ts: number },
  ): Promise<void> {
    const valid = positionSchema.safeParse(position);
    if (!valid.success) return;
    await this.ingestPosition(lsid, userId, valid.data);
  }

  async connectionCounts(): Promise<{ viewers: number; publishers: number }> {
    const all = this.ctx.getWebSockets();
    const viewers = this.ctx.getWebSockets(VIEWER_TAG).length;
    return { viewers, publishers: all.length - viewers };
  }

  // --------------------------------------------------------------------------
  // Stale session sweep
  // --------------------------------------------------------------------------

  override async alarm(): Promise<void> {
    const now = Date.now();
    const active = await this.ctx.storage.list<ActiveSessionState>({ prefix: "active:" });

    for (const [key, state] of active) {
      if (now - state.lastUpdateAt < REALTIME.STALE_SESSION_TIMEOUT_MS) continue;

      const lsid = key.slice("active:".length);
      const ended = await endLocationSession(this.env.DB, lsid, "timeout");
      await this.ctx.storage.delete(key);

      if (ended) {
        await logAudit(this.env.DB, {
          actorId: null,
          actorEmail: "system",
          action: AUDIT_ACTIONS.LOCATION_SESSION_STOPPED,
          targetType: "location_session",
          targetId: lsid,
          metadata: { reason: "timeout", userId: state.userId },
        });
        this.broadcastToViewers({ t: "session_ended", sid: lsid, reason: "timeout" });
        for (const socket of this.ctx.getWebSockets(pubTag(lsid))) {
          try {
            socket.close(1000, "session_timeout");
          } catch {
            // already closed
          }
        }
      }
    }

    await this.ensureSweepAlarm();
  }

  // --------------------------------------------------------------------------
  // Internals
  // --------------------------------------------------------------------------

  private async ingestPosition(
    lsid: string,
    userId: string,
    position: { lat: number; lng: number; acc: number; alt?: number | null; spd?: number | null; hdg?: number | null; ts: number },
  ): Promise<void> {
    const now = Date.now();

    // Keep the registry fresh for the stale sweep.
    await this.ctx.storage.put<ActiveSessionState>(activeKey(lsid), { userId, lastUpdateAt: now });

    const lastBroadcast = this.lastBroadcastAt.get(lsid) ?? 0;
    if (now - lastBroadcast >= REALTIME.BROADCAST_INTERVAL_MS) {
      this.lastBroadcastAt.set(lsid, now);
      this.broadcastToViewers({
        t: "pos",
        sid: lsid,
        uid: userId,
        lat: position.lat,
        lng: position.lng,
        acc: position.acc,
        spd: position.spd ?? null,
        hdg: position.hdg ?? null,
        ts: position.ts,
      });
    }

    const lastPersist = this.lastPersistAt.get(lsid) ?? 0;
    if (now - lastPersist >= REALTIME.PERSIST_INTERVAL_MS) {
      this.lastPersistAt.set(lsid, now);
      try {
        await persistPosition(this.env.DB, {
          sessionId: lsid,
          userId,
          lat: position.lat,
          lng: position.lng,
          accuracy: position.acc,
          altitude: position.alt ?? null,
          speed: position.spd ?? null,
          heading: position.hdg ?? null,
          recordedAt: Math.min(position.ts, now + 60_000),
        });
      } catch (error) {
        console.error(JSON.stringify({ msg: "position_persist_failed", lsid, error: String(error) }));
      }
    }
  }

  private broadcastToViewers(event: RealtimeServerEvent): void {
    const payload = JSON.stringify(event);
    for (const socket of this.ctx.getWebSockets(VIEWER_TAG)) {
      try {
        socket.send(payload);
      } catch {
        // socket already closed
      }
    }
  }

  private send(ws: WebSocket, event: RealtimeServerEvent): void {
    try {
      ws.send(JSON.stringify(event));
    } catch {
      // socket already closed
    }
  }

  private async ensureSweepAlarm(): Promise<void> {
    const active = await this.ctx.storage.list({ prefix: "active:", limit: 1 });
    if (active.size > 0) {
      const current = await this.ctx.storage.getAlarm();
      if (current === null) {
        await this.ctx.storage.setAlarm(Date.now() + REALTIME.SWEEP_INTERVAL_MS);
      }
    }
  }
}