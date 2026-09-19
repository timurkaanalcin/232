import { apiHandler, assertSameOrigin, badRequest, jsonOk, requirePermission } from "@/lib/api";
import type { VideoDTO } from "@/lib/finance/types";
import { deleteVideo, listVideos, upsertVideo } from "@/services/finance";

export const GET = apiHandler(async () => {
  await requirePermission("finance.manage");
  return jsonOk({ videos: await listVideos(true) });
});

export const POST = apiHandler(async (req: Request) => {
  await assertSameOrigin(req);
  await requirePermission("finance.manage");
  const body = (await req.json()) as Partial<VideoDTO>;
  if (!body.title || !body.youtubeId) throw badRequest("title and youtubeId are required");
  await upsertVideo({
    id: body.id ?? crypto.randomUUID(),
    title: body.title,
    channel: body.channel ?? "borsahatti TV",
    youtubeId: body.youtubeId,
    duration: body.duration ?? "",
    category: body.category ?? "Piyasa",
    featured: Boolean(body.featured),
    published: body.published !== false,
    sortOrder: body.sortOrder ?? 100,
  });
  return jsonOk({ ok: true });
});

export const DELETE = apiHandler(async (req: Request) => {
  await assertSameOrigin(req);
  await requirePermission("finance.manage");
  const id = new URL(req.url).searchParams.get("id");
  if (!id) throw badRequest("id is required");
  await deleteVideo(id);
  return jsonOk({ ok: true });
});
