import type { Config } from "@netlify/functions";
import { loadCatalog } from "./_shared/catalog";

export default async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors() });
  }
  if (req.method !== "GET") {
    return Response.json({ error: "Method not allowed" }, { status: 405, headers: cors() });
  }

  const url = new URL(req.url);
  const catalog = await loadCatalog(url.searchParams.get("refresh") === "1");
  const featured = catalog.models.filter((model) => model.featured);
  const providers = [...new Set(catalog.models.map((model) => model.vendorLabel))].sort();

  return Response.json(
    {
      fetchedAt: catalog.fetchedAt,
      source: catalog.source,
      featured,
      models: catalog.models,
      providers,
      newCount: catalog.models.filter((model) => model.isNew).length,
      liveCount: catalog.models.filter((model) => model.live).length,
      gatewayReady: catalog.gatewayReady,
    },
    { headers: cors() },
  );
};

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Cache-Control": "public, max-age=30",
  };
}

export const config: Config = {
  path: "/api/models",
  method: ["GET", "OPTIONS"],
};
