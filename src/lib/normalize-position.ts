import type { RealtimeClientMessage } from "@/types";

export interface NativeLocationFix {
  lat: number;
  lng: number;
  acc: number;
  alt?: number | null;
  spd?: number | null;
  hdg?: number | null;
  ts: number;
}

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

/** Native plugin fix -> the same payload the web client already sends. */
export function positionFromNativeFix(fix: NativeLocationFix): RealtimeClientMessage {
  const acc = Number.isFinite(fix.acc) ? Math.min(Math.max(fix.acc, 0), 100_000) : 0;
  const spd = finiteOrNull(fix.spd);
  const hdg = finiteOrNull(fix.hdg);
  const ts = Number.isFinite(fix.ts) && fix.ts > 0 ? Math.round(fix.ts) : Date.now();
  return {
    t: "pos",
    lat: fix.lat,
    lng: fix.lng,
    acc,
    alt: finiteOrNull(fix.alt),
    spd: spd != null && spd >= 0 && spd <= 600 ? spd : null,
    hdg: hdg != null && hdg >= 0 && hdg <= 360 ? hdg : null,
    ts,
  };
}

/** Adapts a native fix so the existing transmit path can publish it. */
export function nativeFixToGeolocationPosition(fix: NativeLocationFix): GeolocationPosition {
  const message = positionFromNativeFix(fix);
  const coords: GeolocationCoordinates = {
    latitude: message.lat,
    longitude: message.lng,
    accuracy: message.acc,
    altitude: message.alt ?? null,
    altitudeAccuracy: null,
    heading: message.hdg ?? null,
    speed: message.spd ?? null,
    toJSON() {
      return {
        latitude: this.latitude,
        longitude: this.longitude,
        accuracy: this.accuracy,
        altitude: this.altitude,
        altitudeAccuracy: this.altitudeAccuracy,
        heading: this.heading,
        speed: this.speed,
      };
    },
  };
  return {
    coords,
    timestamp: message.ts,
    toJSON() {
      return { coords: coords.toJSON(), timestamp: message.ts };
    },
  };
}
