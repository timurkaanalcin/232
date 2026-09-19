import { apiHandler, jsonOk } from "@/lib/api";
import { getOverview } from "@/services/finance";

export const GET = apiHandler(async () => {
  const overview = await getOverview();
  return jsonOk({ overview });
});
