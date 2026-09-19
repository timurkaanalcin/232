import { apiHandler, assertSameOrigin, badRequest, jsonOk, requirePermission } from "@/lib/api";
import type { NewsDTO } from "@/lib/finance/types";
import { deleteNews, listNews, upsertNews } from "@/services/finance";

export const GET = apiHandler(async () => {
  await requirePermission("finance.manage");
  return jsonOk({ news: await listNews({ includeUnpublished: true }) });
});

export const POST = apiHandler(async (req: Request) => {
  await assertSameOrigin(req);
  await requirePermission("finance.manage");
  const body = (await req.json()) as Partial<NewsDTO>;
  if (!body.title || !body.slug) throw badRequest("title and slug are required");
  const now = Date.now();
  await upsertNews({
    id: body.id ?? crypto.randomUUID(),
    slug: body.slug,
    category: body.category ?? "Ekonomi",
    title: body.title,
    summary: body.summary ?? "",
    body: body.body ?? "",
    author: body.author ?? "borsahatti",
    imageUrl: body.imageUrl ?? "",
    sourceUrl: body.sourceUrl ?? "",
    ticker: body.ticker ?? null,
    breaking: Boolean(body.breaking),
    featured: Boolean(body.featured),
    published: body.published !== false,
    publishedAt: body.publishedAt ?? now,
    relatedSymbols: body.relatedSymbols ?? [],
  });
  return jsonOk({ ok: true });
});

export const DELETE = apiHandler(async (req: Request) => {
  await assertSameOrigin(req);
  await requirePermission("finance.manage");
  const id = new URL(req.url).searchParams.get("id");
  if (!id) throw badRequest("id is required");
  await deleteNews(id);
  return jsonOk({ ok: true });
});
