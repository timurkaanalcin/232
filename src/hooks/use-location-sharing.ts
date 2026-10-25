"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiGet, apiPost } from "@/lib/client-api";
import { geolocationErrorMessage } from "@/lib/geolocation-errors";
import { isNativeApp, nativeLocation, nativePlatform } from "@/lib/native-location";
import { nativeFixToGeolocationPosition, positionFromGeolocation } from "@/lib/normalize-position";
import type { LocationSessionDTO } from "@/types";

export type SharingState = "idle" | "starting" | "sharing" | "stopping";

export interface ShareOptions {
  /** The user tapped through the in-app background-location explanation. */
  backgroundExplained?: boolean;
  /** Do not open Android's "Allow all the time" prompt. The notification still stays up. */
  skipBackgroundPrompt?: boolean;
}

/** Thrown before any background-location system prompt, so the UI can explain it first. */
export class BackgroundExplanationRequired extends Error {
  constructor() {
    super("Background location needs an in-app explanation before the system prompt.");
    this.name = "BackgroundExplanationRequired";
  }
}

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
  start: (label?: string, initialPosition?: GeolocationPosition, options?: ShareOptions) => Promise<void>;
  stop: () => Promise<void>;
  /** Adopt an already-active session (e.g. after a page reload). */
  resume: (session: LocationSessionDTO, options?: ShareOptions) => Promise<void>;
}

/**
 * Returns whether to show Android's "Allow all the time" prompt.
 * The prompt itself must run only after foreground location is granted.
 * iOS keeps background updates with when-in-use permission and the blue indicator.
 */
async function androidNeedsBackgroundPrompt(options?: ShareOptions): Promise<boolean> {
  if (!isNativeApp() || nativePlatform() !== "android") return false;
  let access: "granted" | "not_required" | "needs_explanation" = "not_required";
  try {
    access = await nativeLocation.backgroundAccess();
  } catch {
    return false;
  }
  if (access !== "needs_explanation") return false;
  if (!options?.backgroundExplained) {
    throw new BackgroundExplanationRequired();
  }
  return !options.skipBackgroundPrompt;
}

async function requestAndroidBackgroundAccess(): Promise<void> {
  try {
    await nativeLocation.requestBackgroundAccess(true);
  } catch {
    // The foreground-service notification still keeps updates going.
  }
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
  const nativeUnsubRef = useRef<(() => void) | null>(null);
  const stopInFlightRef = useRef(false);
  const lastSentAtRef = useRef(0);
  const lastRestSentAtRef = useRef(0);
  const sessionRef = useRef<LocationSessionDTO | null>(null);
  const stateRef = useRef<SharingState>("idle");
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  stateRef.current = state;
  sessionRef.current = session;

  const cleanup = useCallback(() => {
    if (nativeUnsubRef.current) {
      nativeUnsubRef.current();
      nativeUnsubRef.current = null;
    }
    if (watchIdRef.current !== null && typeof navigator !== "undefined" && navigator.geolocation) {
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
      if (stopInFlightRef.current) return;
      stopInFlightRef.current = true;
      const activeSession = sessionRef.current;
      cleanup();
      if (isNativeApp()) {
        try {
          await nativeLocation.stop();
        } catch {
          // The foreground indicator may already have been dismissed.
        }
      }
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
        setError(
          isNativeApp()
            ? "Location permission was denied. LiveTrack only asks after you choose to share. You can allow it in system settings."
            : "Konum izni reddedildi. Tarayıcı ayarlarından bu siteye izin verin.",
        );
      } else if (reason === "notification_unavailable") {
        setError("LiveTrack could not show the sharing notification, so sharing was not started.");
      } else if (reason === "location_unavailable") {
        setError("Location services are turned off. Enable them and try again.");
      }
      stopInFlightRef.current = false;
    },
    [cleanup],
  );

  const attachNativeWatch = useCallback(
    async (sessionId: string) => {
      const remove = await nativeLocation.listen({
        onLocation: (fix) => transmit(nativeFixToGeolocationPosition(fix)),
        onStopped: (reason) => {
          void stopInternal(reason);
        },
      });
      nativeUnsubRef.current = remove;
      const alreadyRunning = await nativeLocation.isActive();
      if (!alreadyRunning) {
        await nativeLocation.start(sessionId, window.location.origin);
      }
    },
    [stopInternal, transmit],
  );

  const start = useCallback(
    async (label?: string, initialPosition?: GeolocationPosition, options?: ShareOptions) => {
      setError(null);
      setState("starting");
      try {
        const askBackground = await androidNeedsBackgroundPrompt(options);
        // 1. Device location. On mobile this is the OS prompt, and only after consent.
        const granted =
          initialPosition ??
          (isNativeApp()
            ? nativeFixToGeolocationPosition(await nativeLocation.getCurrentPosition())
            : await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                  enableHighAccuracy: true,
                  timeout: 30_000,
                  maximumAge: 0,
                });
              }));
        if (askBackground) {
          await requestAndroidBackgroundAccess();
        }

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
        if (isNativeApp()) {
          await attachNativeWatch(created.id);
        } else {
          startWatching();
        }
        setState("sharing");
      } catch (startError) {
        if (startError instanceof BackgroundExplanationRequired) {
          setState("idle");
          throw startError;
        }
        const created = sessionRef.current;
        cleanup();
        if (created && isNativeApp()) {
          try {
            await nativeLocation.stop();
          } catch {
            // Sharing never became active.
          }
          try {
            await apiPost(`/api/location/sessions/${created.id}/stop`);
          } catch {
            // Stale sweep closes the session if this fails.
          }
        }
        setSession(null);
        sessionRef.current = null;
        setState("idle");
        if (startError instanceof GeolocationPositionError) {
          setError(geolocationErrorMessage(startError));
        } else {
          setError(startError instanceof Error ? startError.message : "Failed to start sharing");
        }
      }
    },
    [attachNativeWatch, cleanup, connectWebSocket, publishViaRest, startWatching, transmit],
  );

  const stop = useCallback(async () => {
    setState("stopping");
    await stopInternal("user");
  }, [stopInternal]);

  const resume = useCallback(
    async (activeSession: LocationSessionDTO, options?: ShareOptions) => {
      if (stateRef.current !== "idle") return;
      const alreadyRunning = isNativeApp() ? await nativeLocation.isActive().catch(() => false) : false;
      const askBackground = alreadyRunning ? false : await androidNeedsBackgroundPrompt(options);
      if (askBackground) {
        try {
          await nativeLocation.getCurrentPosition();
        } catch (error) {
          const message = error instanceof Error ? error.message : "Location permission was denied.";
          setError(message);
          throw error instanceof Error ? error : new Error(message);
        }
        await requestAndroidBackgroundAccess();
      }
      if (stateRef.current !== "idle") return;
      setSession(activeSession);
      sessionRef.current = activeSession;
      setState("sharing");
      try {
          await connectWebSocket();
          if (isNativeApp()) {
            await attachNativeWatch(activeSession.id);
            try {
              const fix = await nativeLocation.getCurrentPosition();
              const pos = nativeFixToGeolocationPosition(fix);
              transmit(pos);
              await publishViaRest(pos, activeSession.id);
            } catch {
              // The foreground watch keeps publishing if this extra fix fails.
            }
            return;
          }
          startWatching();
          navigator.geolocation.getCurrentPosition(
        (pos) => {
          transmit(pos);
          void publishViaRest(pos, activeSession.id);
        },
        () => {},
            { enableHighAccuracy: true, maximumAge: 5_000, timeout: 20_000 },
          );
      } catch (resumeError) {
        await stopInternal(
          resumeError instanceof Error && /permission/i.test(resumeError.message) ? "permission_denied" : "location_unavailable",
        );
        if (resumeError instanceof Error && resumeError.message) {
          setError(resumeError.message);
        }
      }
    },
    [attachNativeWatch, connectWebSocket, publishViaRest, startWatching, stopInternal, transmit],
  );

  // Konum yayını sırasında periyodik REST güncellemesi (admin harita için).
  useEffect(() => {
    if (state !== "sharing" || !session?.id || isNativeApp()) return;
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
