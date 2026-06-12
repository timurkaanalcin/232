import { apiHandler, badRequest, jsonOk, requirePermission } from "@/lib/api";
import { reverseGeocode } from "@/lib/reverse-geocode";

/** Koordinat → tam açık adres (admin canlı harita). */
export const GET = apiHandler(async (request: Request) => {
  const { env } = await requirePermission("map.live_view");

  const url = new URL(request.url);
  const lat = Number(url.searchParams.get("lat"));
  const lng = Number(url.searchParams.get("lng"));

  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    throw badRequest("Invalid latitude");
  }
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
    throw badRequest("Invalid longitude");
  }

  const address = await reverseGeocode(lat, lng, { googleApiKey: env.GOOGLE_MAPS_API_KEY });
  return jsonOk({ address, lat, lng });
});
