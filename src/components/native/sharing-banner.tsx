"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { RadioIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { apiGet, apiPost } from "@/lib/client-api";
import { nativeLocation, nativePlatform, useNativeApp } from "@/lib/native-location";
import type { LocationSessionDTO, Paginated } from "@/types";

interface SessionsResponse {
  history: Paginated<LocationSessionDTO>;
  active: LocationSessionDTO | null;
}

/** In-app indicator while the native shell is actively sharing. */
export function NativeSharingBanner() {
  const native = useNativeApp();
  const queryClient = useQueryClient();
  const [active, setActive] = useState(false);
  const [stopping, setStopping] = useState(false);

  useEffect(() => {
    if (native !== true) return;
    let remove = () => {};
    let cancelled = false;
    void nativeLocation.isActive().then((sharing) => {
      if (!cancelled) setActive(sharing);
    }).catch(() => {
      if (!cancelled) setActive(false);
    });
    void nativeLocation
      .listen({
        onLocation: () => setActive(true),
        onStopped: () => setActive(false),
      })
      .then((unsubscribe) => {
        remove = unsubscribe;
        if (cancelled) unsubscribe();
      })
      .catch(() => {
        // The website has no native bridge.
      });
    return () => {
      cancelled = true;
      remove();
    };
  }, [native]);

  if (native !== true || !active) return null;

  const stop = async () => {
    setStopping(true);
    try {
      await nativeLocation.stop();
      const sessions = await apiGet<SessionsResponse>("/api/location/sessions?page=1&pageSize=1");
      if (sessions.active) {
        await apiPost(`/api/location/sessions/${sessions.active.id}/stop`);
      }
      setActive(false);
      void queryClient.invalidateQueries({ queryKey: ["location-sessions"] });
      toast.success("Location sharing stopped");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not stop sharing");
    } finally {
      setStopping(false);
    }
  };

  return (
    <div className="flex items-center gap-3 border-b bg-emerald-500/10 px-4 py-2 text-sm sm:px-6">
      <RadioIcon className="size-4 shrink-0 text-emerald-600" />
      <p className="min-w-0 flex-1">
        <span className="font-medium">Location sharing is on.</span>{" "}
        <span className="text-muted-foreground">
          {nativePlatform() === "android"
            ? "Authorized staff can see your live position, including while the screen is locked. The notification stays until you stop."
            : "Authorized staff can see your live position, including while the screen is locked. The blue location indicator stays on until you stop."}
        </span>
      </p>
      <Button size="sm" variant="destructive" onClick={() => void stop()} disabled={stopping}>
        {stopping ? "Stopping…" : "Stop"}
      </Button>
    </div>
  );
}
