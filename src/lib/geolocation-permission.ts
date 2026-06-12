export type GeolocationPermissionState = "granted" | "prompt" | "denied" | "unknown";

export async function getGeolocationPermission(): Promise<GeolocationPermissionState> {
  if (typeof navigator === "undefined" || !navigator.permissions?.query) {
    return "unknown";
  }
  try {
    const result = await navigator.permissions.query({ name: "geolocation" });
    return result.state as GeolocationPermissionState;
  } catch {
    return "unknown";
  }
}

/** Kullanıcı tıklamasıyla konum iste — yüksek hassasiyet, başarısızsa düşük hassasiyet dene. */
export function requestCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    const onSuccess = (pos: GeolocationPosition) => resolve(pos);
    const onError = (err: GeolocationPositionError) => {
      if (err.code !== err.TIMEOUT) {
        reject(err);
        return;
      }
      // Zaman aşımı: düşük hassasiyetle tekrar dene
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: false,
        timeout: 45_000,
        maximumAge: 30_000,
      });
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: 25_000,
      maximumAge: 0,
    });
  });
}
