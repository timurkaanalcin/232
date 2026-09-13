import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="code-copy"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1400);
      }}
    >
      {copied ? "Kopyalandı" : "Kopyala"}
    </button>
  );
}

export function Markdown({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ href, children }) => (
          <a href={href} target="_blank" rel="noreferrer">
            {children}
          </a>
        ),
        pre: ({ children }) => <pre>{children}</pre>,
        code: ({ className, children, ...props }) => {
          const text = String(children).replace(/\n$/, "");
          const inline = !className && !text.includes("\n");
          if (inline) {
            return (
              <code className="inline-code" {...props}>
                {children}
              </code>
            );
          }
          const lang = className?.replace("language-", "") ?? "";
          return (
            <div className="code-block">
              <div className="code-bar">
                <span>{lang || "code"}</span>
                <CopyButton text={text} />
              </div>
              <code className={className} {...props}>
                {children}
              </code>
            </div>
          );
        },
        img: ({ src, alt }) => <img src={src} alt={alt ?? ""} className="gen-image" />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
