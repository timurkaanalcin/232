import { haversineMeters, reverseGeocode } from "@/lib/reverse-geocode";
import type { LocationSessionRow } from "@/types";

const MIN_MOVE_FOR_REGEOCODE_M = 25;
const MAX_ACCURACY_FOR_ADDRESS_M = 250;

/**
 * GPS noktasından tam adres çözümler ve oturuma yazar.
 * Aynı konumda gereksiz API çağrısı yapmaz.
 */
export async function resolveAndStoreSessionAddress(
  db: D1Database,
  env: CloudflareEnv,
  session: Pick<
    LocationSessionRow,
    "id" | "last_lat" | "last_lng" | "last_accuracy"
  > & { last_address?: string | null },
  lat: number,
  lng: number,
  accuracy: number,
): Promise<string | null> {
  if (accuracy > MAX_ACCURACY_FOR_ADDRESS_M) {
    return session.last_address ?? null;
  }

  if (
    session.last_address &&
    session.last_lat != null &&
    session.last_lng != null &&
    haversineMeters(session.last_lat, session.last_lng, lat, lng) < MIN_MOVE_FOR_REGEOCODE_M
  ) {
    return session.last_address;
  }

  try {
    const maxResultDistanceM = Math.max(50, Math.min(accuracy * 2, 120));
    const address = await reverseGeocode(lat, lng, {
      googleApiKey: env.GOOGLE_MAPS_API_KEY,
      maxResultDistanceM,
    });

    await db
      .prepare(`UPDATE location_sessions SET last_address = ? WHERE id = ? AND status = 'active'`)
      .bind(address, session.id)
      .run();

    return address;
  } catch (error) {
    console.error(
      JSON.stringify({ msg: "session_address_resolve_failed", sessionId: session.id, error: String(error) }),
    );
    return session.last_address ?? null;
  }
}
