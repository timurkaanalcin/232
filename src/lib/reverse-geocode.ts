interface NominatimAddress {
  house_number?: string;
  road?: string;
  pedestrian?: string;
  footway?: string;
  neighbourhood?: string;
  suburb?: string;
  quarter?: string;
  district?: string;
  town?: string;
  city?: string;
  municipality?: string;
  county?: string;
  state?: string;
  postcode?: string;
  country?: string;
}

interface NominatimReverseResult {
  lat?: string;
  lon?: string;
  display_name?: string;
  address?: NominatimAddress;
  addresstype?: string;
  distance?: number;
}

export interface ReverseGeocodeOptions {
  googleApiKey?: string;
  /** Sonuç koordinatı ile istek noktası arasındaki max. fark (metre). */
  maxResultDistanceM?: number;
}

/** İki nokta arası mesafe (metre). */
export function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** OpenStreetMap yanıtını Türkçe tam adrese çevirir. */
export function formatNominatimAddress(data: NominatimReverseResult): string {
  const a = data.address;
  if (!a) return data.display_name?.trim() || "";

  const street = [a.road, a.pedestrian, a.footway].find(Boolean);
  const streetLine = street ? [street, a.house_number].filter(Boolean).join(" ") : null;
  const locality = [a.neighbourhood, a.suburb, a.quarter].find(Boolean);
  const district = [a.district, a.town, a.municipality].find(Boolean);
  const city = a.city || a.county || a.state;
  const postal = a.postcode ? `PK: ${a.postcode}` : null;

  const parts = [streetLine, locality, district, city, postal, a.country].filter(
    (p): p is string => Boolean(p?.trim()),
  );

  if (parts.length > 0) return parts.join(", ");
  return data.display_name?.trim() || "";
}

async function googleReverseGeocode(lat: number, lng: number, apiKey: string): Promise<string> {
  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("latlng", `${lat},${lng}`);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("language", "tr");
  url.searchParams.set("region", "tr");

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Google Geocoding HTTP ${res.status}`);

  const data = (await res.json()) as {
    status: string;
    results?: Array<{ formatted_address: string; geometry?: { location?: { lat: number; lng: number } } }>;
  };

  if (data.status !== "OK" || !data.results?.length) {
    throw new Error(`Google Geocoding: ${data.status}`);
  }

  // En yakın sonucu seç
  let best = data.results[0]!;
  let bestDist = Infinity;
  for (const r of data.results) {
    const g = r.geometry?.location;
    if (!g) continue;
    const d = haversineMeters(lat, lng, g.lat, g.lng);
    if (d < bestDist) {
      bestDist = d;
      best = r;
    }
  }

  return best.formatted_address;
}

async function nominatimReverseGeocode(
  lat: number,
  lng: number,
  maxDistanceM: number,
): Promise<string> {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lng));
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("accept-language", "tr");
  url.searchParams.set("zoom", "19");

  const res = await fetch(url.toString(), {
    headers: {
      "User-Agent": "borsahatti/1.0 (consent location admin)",
      Accept: "application/json",
    },
  });

  if (!res.ok) throw new Error(`Nominatim HTTP ${res.status}`);

  const data = (await res.json()) as NominatimReverseResult;
  const resultLat = Number(data.lat);
  const resultLng = Number(data.lon);

  if (Number.isFinite(resultLat) && Number.isFinite(resultLng)) {
    const dist =
      data.distance != null && Number.isFinite(data.distance)
        ? data.distance
        : haversineMeters(lat, lng, resultLat, resultLng);
    if (dist > maxDistanceM) {
      throw new Error(`Nominatim sonucu çok uzak (${Math.round(dist)} m)`);
    }
  }

  const formatted = formatNominatimAddress(data);
  if (!formatted) throw new Error("Nominatim boş adres döndürdü");
  return formatted;
}

/**
 * GPS koordinatından tam açık adres.
 * 1) Google Maps (en doğru, GOOGLE_MAPS_API_KEY gerekir)
 * 2) Nominatim (ücretsiz yedek, mesafe doğrulamalı)
 */
export async function reverseGeocode(
  lat: number,
  lng: number,
  options: ReverseGeocodeOptions = {},
): Promise<string> {
  const maxDist = options.maxResultDistanceM ?? 80;

  if (options.googleApiKey?.trim()) {
    try {
      return await googleReverseGeocode(lat, lng, options.googleApiKey.trim());
    } catch (error) {
      console.error(JSON.stringify({ msg: "google_geocode_failed", error: String(error) }));
    }
  }

  return nominatimReverseGeocode(lat, lng, maxDist);
}
