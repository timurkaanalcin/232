"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/client-api";
import type { LocationSessionDTO, RealtimeServerEvent } from "@/types";

export interface LiveSession {
  session: LocationSessionDTO;
  lat: number | null;
  lng: number | null;
  accuracy: number | null;
  speed: number | null;
  heading: number | null;
  lastUpdateAt: number | null;
}

export type LiveMapStatus = "connecting" | "live" | "reconnecting";

/**
 * Admin live map data source: merges the REST snapshot of active sessions
 * with realtime WebSocket position/lifecycle events.
 */
export function useLiveMap(enabled: boolean) {
  const [sessions, setSessions] = useState<Map<string, LiveSession>>(new Map());
  const [status, setStatus] = useState<LiveMapStatus>("connecting");
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stoppedRef = useRef(false);

  const snapshot = useQuery({
    queryKey: ["admin", "active-sessions"],
    queryFn: () => apiGet<{ sessions: LocationSessionDTO[] }>("/api/admin/sessions/active"),
    enabled,
    refetchInterval: 10_000,
  });

  useEffect(() => {
    if (!snapshot.data) return;
    setSessions((previous) => {
      const next = new Map<string, LiveSession>();
      for (const session of snapshot.data.sessions) {
        const existing = previous.get(session.id);
        next.set(session.id, {
          session,
          lat: existing?.lat ?? session.lastLat,
          lng: existing?.lng ?? session.lastLng,
          accuracy: existing?.accuracy ?? session.lastAccuracy,
          speed: existing?.speed ?? null,
          heading: existing?.heading ?? null,
          lastUpdateAt: existing?.lastUpdateAt ?? session.lastUpdateAt,
        });
      }
      return next;
    });
  }, [snapshot.data]);

  const handleEvent = useCallback((event: RealtimeServerEvent) => {
    if (event.t === "pos") {
      setSessions((previous) => {
        const entry = previous.get(event.sid);
        if (!entry) return previous;
        const next = new Map(previous);
        next.set(event.sid, {
          ...entry,
          lat: event.lat,
          lng: event.lng,
          accuracy: event.acc,
          speed: event.spd ?? null,
          heading: event.hdg ?? null,
          lastUpdateAt: event.ts,
        });
        return next;
      });
    } else if (event.t === "session_started") {
      setSessions((previous) => {
        const next = new Map(previous);
        next.set(event.session.id, {
          session: event.session,
          lat: event.session.lastLat,
          lng: event.session.lastLng,
          accuracy: event.session.lastAccuracy,
          speed: null,
          heading: null,
          lastUpdateAt: event.session.lastUpdateAt,
        });
        return next;
      });
    } else if (event.t === "session_ended") {
      setSessions((previous) => {
        if (!previous.has(event.sid)) return previous;
        const next = new Map(previous);
        next.delete(event.sid);
        return next;
      });
    }
  }, []);

  const connect = useCallback(async () => {
    if (stoppedRef.current) return;
    try {
      const { ticket } = await apiGet<{ ticket: string }>("/api/realtime/token?scope=view");
      if (stoppedRef.current) return;
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const ws = new WebSocket(`${protocol}//${window.location.host}/realtime/ws?ticket=${encodeURIComponent(ticket)}`);

      ws.onopen = () => {
        wsRef.current = ws;
        setStatus("live");
      };
      ws.onmessage = (message) => {
        try {
          handleEvent(JSON.parse(message.data as string) as RealtimeServerEvent);
        } catch {
          // ignore malformed frames
        }
      };
      ws.onclose = () => {
        wsRef.current = null;
        if (stoppedRef.current) return;
        setStatus("reconnecting");
        reconnectTimerRef.current = setTimeout(() => void connect(), 3_000);
      };
      ws.onerror = () => ws.close();
    } catch {
      setStatus("reconnecting");
      reconnectTimerRef.current = setTimeout(() => void connect(), 5_000);
    }
  }, [handleEvent]);

  useEffect(() => {
    if (!enabled) return;
    stoppedRef.current = false;
    void connect();
    return () => {
      stoppedRef.current = true;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      wsRef.current?.close(1000, "leaving");
      wsRef.current = null;
    };
  }, [enabled, connect]);

  return {
    sessions: [...sessions.values()],
    status,
    snapshotLoading: snapshot.isLoading,
    refetchSnapshot: snapshot.refetch,
  };
}
