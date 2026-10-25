"use client";

import { useEffect, useState } from "react";
import type { NativeLocationFix } from "@/lib/normalize-position";

interface ListenerHandle {
  remove: () => Promise<void> | void;
}

interface LiveTrackBridge {
  getCurrentPosition: () => Promise<NativeLocationFix>;
  start: (options: { sessionId: string; origin: string }) => Promise<void>;
  stop: () => Promise<void>;
  isActive: () => Promise<{ active: boolean }>;
  getServerUrl: () => Promise<{ url: string; source: string }>;
  setServerUrl: (options: { url: string }) => Promise<void>;
  clearServerUrl: () => Promise<void>;
  addListener: (
    eventName: "location" | "stopped",
    listener: (event: NativeLocationFix & { reason?: string }) => void,
  ) => ListenerHandle | Promise<ListenerHandle>;
}

interface CapacitorGlobal {
  isNativePlatform?: () => boolean;
  getPlatform?: () => string;
  registerPlugin?: (name: string) => LiveTrackBridge;
}

function capacitor(): CapacitorGlobal | null {
  if (typeof window === "undefined") return null;
  return (window as Window & { Capacitor?: CapacitorGlobal }).Capacitor ?? null;
}

/** True only inside the Capacitor shell. The website never takes this path. */
export function isNativeApp(): boolean {
  return capacitor()?.isNativePlatform?.() === true;
}

export function nativePlatform(): "android" | "ios" | "web" {
  const platform = capacitor()?.getPlatform?.();
  if (platform === "android" || platform === "ios") return platform;
  return "web";
}

/**
 * null until the client knows. Avoids treating the website as native during hydration.
 */
export function useNativeApp(): boolean | null {
  const [native, setNative] = useState<boolean | null>(null);
  useEffect(() => {
    setNative(isNativeApp());
  }, []);
  return native;
}

function bridge(): LiveTrackBridge {
  const cap = capacitor();
  if (!cap?.isNativePlatform?.() || !cap.registerPlugin) {
    throw new Error("LiveTrack native features are only available in the mobile app.");
  }
  return cap.registerPlugin("LiveTrack");
}

export const nativeLocation = {
  getCurrentPosition(): Promise<NativeLocationFix> {
    return bridge().getCurrentPosition();
  },
  start(sessionId: string, origin: string): Promise<void> {
    return bridge().start({ sessionId, origin });
  },
  stop(): Promise<void> {
    return bridge().stop();
  },
  async isActive(): Promise<boolean> {
    const result = await bridge().isActive();
    return Boolean(result?.active);
  },
  getServerUrl(): Promise<{ url: string; source: string }> {
    return bridge().getServerUrl();
  },
  setServerUrl(url: string): Promise<void> {
    return bridge().setServerUrl({ url });
  },
  clearServerUrl(): Promise<void> {
    return bridge().clearServerUrl();
  },
  async listen(handlers: {
    onLocation: (fix: NativeLocationFix) => void;
    onStopped: (reason: string) => void;
  }): Promise<() => void> {
    const plugin = bridge();
    const locationHandle = await Promise.resolve(
      plugin.addListener("location", (event) => {
        handlers.onLocation(event);
      }),
    );
    const stoppedHandle = await Promise.resolve(
      plugin.addListener("stopped", (event) => {
        handlers.onStopped(event.reason ?? "user");
      }),
    );
    return () => {
      void locationHandle.remove();
      void stoppedHandle.remove();
    };
  },
};
