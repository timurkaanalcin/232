import type { Config, Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import { jsonError } from "./_shared/sse";

export default async (req: Request, context: Context) => {
  if (req.method !== "GET") return jsonError("Method not allowed", 405);
  const key = context.params?.key;
  if (!key || key.includes("..") || key.includes("/")) {
    return jsonError("Geçersiz görsel anahtarı.", 400);
  }
  try {
    const store = getStore({ name: "havuz-images" });
    const result = await store.getWithMetadata(key, { type: "arrayBuffer" });
    if (!result?.data) return jsonError("Görsel bulunamadı.", 404);
    const contentType =
      (result.metadata?.contentType as string | undefined) || "image/png";
    return new Response(result.data, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return jsonError("Görsel deposu kullanılamıyor.", 503);
  }
};

export const config: Config = {
  path: "/api/image/:key",
  method: "GET",
};
