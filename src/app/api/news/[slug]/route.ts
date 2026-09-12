import { apiHandler, jsonOk, notFound } from "@/lib/api";
import { getNewsBySlug } from "@/services/finance";

export const GET = apiHandler(async (_req: Request, context: { params: Promise<{ slug: string }> }) => {
  const { slug } = await context.params;
  const article = await getNewsBySlug(slug);
  if (!article || !article.published) throw notFound("Article");
  return jsonOk({ article });
});
