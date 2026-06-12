"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiGet, apiPost } from "@/lib/client-api";
import { geolocationErrorMessage } from "@/lib/geolocation-errors";
import { positionFromGeolocation } from "@/lib/normalize-position";
import type { LocationSessionDTO, RealtimeClientMessage } from "@/types";

export type SharingState = "idle" | "starting" | "sharing" | "stopping";

export interface CurrentPosition {
  lat: number;
  lng: number;
  accuracy: number;
  heading: number | null;
  speed: number | null;
  timestamp: number;
}

interface UseLocationSharingResult {
  state: SharingState;
  session: LocationSessionDTO | null;
  position: CurrentPosition | null;
  error: string | null;
  connectionMode: "websocket" | "rest" | null;
  start: (label?: string, initialPosition?: GeolocationPosition) => Promise<void>;
  stop: () => Promise<void>;
  /** Adopt an already-active session (e.g. after a page reload). */
  resume: (session: LocationSessionDTO) => void;
}

const SEND_INTERVAL_MS = 2_000;
const REST_FALLBACK_INTERVAL_MS = 4_000;
const REST_HEARTBEAT_MS = 4_000;

/**
 * Full lifecycle of a location sharing session on the client:
 * consent (handled by the caller) -> session creation -> geolocation watch ->
 * realtime transmission over WebSocket with REST fallback -> explicit stop.
 */
export function useLocationSharing(): UseLocationSharingResult {
  const [state, setState] = useState<SharingState>("idle");
  const [session, setSession] = useState<LocationSessionDTO | null>(null);
  const [position, setPosition] = useState<CurrentPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connectionMode, setConnectionMode] = useState<"websocket" | "rest" | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const lastSentAtRef = useRef(0);
  const lastRestSentAtRef = useRef(0);
  const sessionRef = useRef<LocationSessionDTO | null>(null);
  const stateRef = useRef<SharingState>("idle");
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  stateRef.current = state;
  sessionRef.current = session;

  const cleanup = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.close(1000, "client_stopped");
      wsRef.current = null;
    }
    setConnectionMode(null);
  }, []);

  const connectWebSocket = useCallback(async (): Promise<boolean> => {
    try {
      const { ticket } = await apiGet<{ ticket: string }>("/api/realtime/token?scope=publish");
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const opened = await new Promise<boolean>((resolve) => {
        const ws = new WebSocket(
          `${protocol}//${window.location.host}/realtime/ws?ticket=${encodeURIComponent(ticket)}`,
        );
        const timer = setTimeout(() => {
          try {
            ws.close();
          } catch {
            /* noop */
          }
          resolve(false);
        }, 8_000);

        ws.onopen = () => {
          clearTimeout(timer);
          wsRef.current = ws;
          setConnectionMode("websocket");
          resolve(true);
        };
        ws.onclose = (event) => {
          clearTimeout(timer);
          wsRef.current = null;
          if (stateRef.current !== "sharing") return;
          if (event.reason === "session_ended" || event.reason === "session_timeout") {
            cleanup();
            setSession(null);
            setState("idle");
            setError(
              event.reason === "session_timeout"
                ? "Oturum hareketsizlik nedeniyle sonlandı"
                : "Oturum sonlandırıldı",
            );
            return;
          }
          setConnectionMode("rest");
          reconnectTimerRef.current = setTimeout(() => {
            if (stateRef.current === "sharing") void connectWebSocket();
          }, 5_000);
        };
        ws.onerror = () => {
          clearTimeout(timer);
          ws.close();
          resolve(false);
        };
      });
      if (!opened) setConnectionMode("rest");
      return opened;
    } catch {
      setConnectionMode("rest");
      reconnectTimerRef.current = setTimeout(() => {
        if (stateRef.current === "sharing") void connectWebSocket();
      }, 10_000);
      return false;
    }
  }, [cleanup]);

  const publishViaRest = useCallback(async (pos: GeolocationPosition, sessionId: string) => {
    const message = positionFromGeolocation(pos);
    await apiPost("/api/location/update", { sessionId, position: message });
  }, []);

  const transmit = useCallback((pos: GeolocationPosition) => {
    const message = positionFromGeolocation(pos);
    const current: CurrentPosition = {
      lat: message.lat,
      lng: message.lng,
      accuracy: message.acc,
      heading: message.hdg ?? null,
      speed: message.spd ?? null,
      timestamp: message.ts,
    };
    setPosition(current);

    const now = Date.now();

    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN && now - lastSentAtRef.current >= SEND_INTERVAL_MS) {
      lastSentAtRef.current = now;
      ws.send(JSON.stringify(message));
    }

    // REST yedek — admin harita snapshot'ı her zaman güncel kalsın.
    const activeSession = sessionRef.current;
    if (activeSession && now - lastRestSentAtRef.current >= REST_FALLBACK_INTERVAL_MS) {
      lastRestSentAtRef.current = now;
      void apiPost("/api/location/update", { sessionId: activeSession.id, position: message }).catch(() => {
        // next tick retries
      });
    }
  }, []);

  const startWatching = useCallback(() => {
    watchIdRef.current = navigator.geolocation.watchPosition(
      transmit,
      (geoError) => {
        if (geoError.code === geoError.PERMISSION_DENIED) {
          setError("Konum izni reddedildi. Tarayıcı ayarlarından bu siteye izin verin.");
          void stopInternal("permission_denied");
        }
      },
      { enableHighAccuracy: true, maximumAge: 1_000, timeout: 20_000 },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transmit]);

  const stopInternal = useCallback(
    async (reason: string) => {
      const activeSession = sessionRef.current;
      cleanup();
      if (activeSession) {
        try {
          await apiPost(`/api/location/sessions/${activeSession.id}/stop`);
        } catch {
          // The server-side stale sweep will end the session if this fails.
        }
      }
      setSession(null);
      setState("idle");
      if (reason === "permission_denied") {
        setError("Konum izni reddedildi. Tarayıcı ayarlarından bu siteye izin verin.");
      }
    },
    [cleanup],
  );

  const start = useCallback(
    async (label?: string, initialPosition?: GeolocationPosition) => {
      setError(null);
      setState("starting");
      try {
        // 1. Browser geolocation — call from user click when possible (initialPosition).
        const granted =
          initialPosition ??
          (await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 30_000,
              maximumAge: 0,
            });
          }));

        // 2. Create the consented session server-side.
        const { session: created } = await apiPost<{ session: LocationSessionDTO }>(
          "/api/location/sessions",
          { consent: true, label: label ?? "" },
        );
        setSession(created);
        sessionRef.current = created;

        // 3. Realtime channel + ilk konum (admin haritada hemen görünsün).
        await connectWebSocket();
        transmit(granted);
        await publishViaRest(granted, created.id);
        startWatching();
        setState("sharing");
      } catch (startError) {
        cleanup();
        setState("idle");
        if (startError instanceof GeolocationPositionError) {
          setError(geolocationErrorMessage(startError));
        } else {
          setError(startError instanceof Error ? startError.message : "Failed to start sharing");
        }
      }
    },
    [cleanup, connectWebSocket, publishViaRest, startWatching, transmit],
  );

  const stop = useCallback(async () => {
    setState("stopping");
    await stopInternal("user");
  }, [stopInternal]);

  const resume = useCallback(
    (activeSession: LocationSessionDTO) => {
      if (stateRef.current !== "idle") return;
      setSession(activeSession);
      sessionRef.current = activeSession;
      setState("sharing");
      void connectWebSocket();
      startWatching();
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          transmit(pos);
          void publishViaRest(pos, activeSession.id);
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 5_000, timeout: 20_000 },
      );
    },
    [connectWebSocket, publishViaRest, startWatching, transmit],
  );

  // Konum yayını sırasında periyodik REST güncellemesi (admin harita için).
  useEffect(() => {
    if (state !== "sharing" || !session?.id) return;
    const tick = () => {
      if (!sessionRef.current) return;
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          transmit(pos);
          void publishViaRest(pos, sessionRef.current!.id);
        },
        () => {},
        { enableHighAccuracy: false, maximumAge: 10_000, timeout: 15_000 },
      );
    };
    const id = setInterval(tick, REST_HEARTBEAT_MS);
    return () => clearInterval(id);
  }, [state, session?.id, transmit, publishViaRest]);

  useEffect(() => () => cleanup(), [cleanup]);

  return { state, session, position, error, connectionMode, start, stop, resume };
}
