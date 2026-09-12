import { apiHandler, jsonOk } from "@/lib/api";
import { listVideos } from "@/services/finance";

export const GET = apiHandler(async () => {
  const videos = await listVideos();
  return jsonOk({ videos });
});
