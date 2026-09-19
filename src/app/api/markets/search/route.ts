import { apiHandler, jsonOk } from "@/lib/api";
import { searchInstruments } from "@/services/finance";

export const GET = apiHandler(async (req: Request) => {
  const q = new URL(req.url).searchParams.get("q") ?? "";
  const results = await searchInstruments(q);
  return jsonOk({ results });
});
