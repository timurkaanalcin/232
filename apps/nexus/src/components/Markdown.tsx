import { renderMarkdown } from "@/lib/markdown";

export function Markdown({ text }: { text: string }) {
  return <div className="bubble" dangerouslySetInnerHTML={{ __html: renderMarkdown(text || "…") }} />;
}
