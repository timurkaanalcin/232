import type { RealtimeClientMessage } from "@/types";

function finiteOrNull(value: number | null | undefined): number | null {
  if (value == null || !Number.isFinite(value)) return null;
  return value;
}

/** Tarayıcı Geolocation çıktısını API / WebSocket şemasına uygun hale getirir. */
export function positionFromGeolocation(pos: GeolocationPosition): RealtimeClientMessage {
  const acc = Number.isFinite(pos.coords.accuracy) ? Math.min(pos.coords.accuracy, 100_000) : 0;
  const spd = finiteOrNull(pos.coords.speed);
  const hdg = finiteOrNull(pos.coords.heading);

  return {
    t: "pos",
    lat: pos.coords.latitude,
    lng: pos.coords.longitude,
    acc,
    alt: finiteOrNull(pos.coords.altitude),
    spd: spd != null && spd >= 0 ? spd : null,
    hdg: hdg != null && hdg >= 0 && hdg <= 360 ? hdg : null,
    ts: pos.timestamp || Date.now(),
  };
}
