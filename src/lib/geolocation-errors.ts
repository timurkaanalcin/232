/** Türkçe geolocation hata mesajları */
export function geolocationErrorMessage(error: GeolocationPositionError): string {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "Konum izni reddedildi. Adres çubuğundaki kilit simgesine tıklayıp Konum → İzin ver seçin. (iPhone: Ayarlar → Gizlilik → Konum Servisleri)";
    case error.POSITION_UNAVAILABLE:
      return "Konum alınamadı. Cihazınızda Konum Servisleri ve Wi-Fi/GPS açık olsun.";
    case error.TIMEOUT:
      return "Konum isteği zaman aşımına uğradı. Tekrar deneyin.";
    default:
      return "Konum alınamadı. Tarayıcı ayarlarını kontrol edin.";
  }
}

export function geolocationUnavailableMessage(): string | null {
  if (typeof window === "undefined") return null;
  if (!window.isSecureContext) {
    return "Konum yalnızca HTTPS veya localhost üzerinde çalışır.";
  }
  if (!navigator.geolocation) {
    return "Tarayıcınız konum özelliğini desteklemiyor.";
  }
  return null;
}
