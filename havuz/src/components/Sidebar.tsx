import { BrandMark } from "./BrandMark";
import { IconPlus, IconSearch, IconTrash } from "./Icons";
import { t, type Locale } from "../lib/i18n";
import type { Conversation } from "../lib/types";

function dayBucket(ts: number, locale: Locale): string {
  const d = new Date(ts);
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const y = new Date(start);
  y.setDate(y.getDate() - 1);
  if (d >= start) return t(locale, "today");
  if (d >= y) return t(locale, "yesterday");
  return t(locale, "earlier");
}

export function Sidebar({
  locale,
  open,
  conversations,
  activeId,
  query,
  onQuery,
  onNew,
  onSelect,
  onDelete,
}: {
  locale: Locale;
  open: boolean;
  conversations: Conversation[];
  activeId: string | null;
  query: string;
  onQuery: (q: string) => void;
  onNew: () => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const groups = new Map<string, Conversation[]>();
  for (const conv of filtered) {
    const key = dayBucket(conv.updatedAt, locale);
    groups.set(key, [...(groups.get(key) ?? []), conv]);
  }

  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <div className="brand">
        <BrandMark size={42} />
        <div>
          <h1>
            {t(locale, "brand").replace(/AI$/, "")}
            <span className="brand-ai">AI</span>
          </h1>
          <p>{t(locale, "tagline")}</p>
        </div>
      </div>
      <div className="sidebar-actions">
        <button type="button" className="btn btn-primary" onClick={onNew}>
          <IconPlus size={16} />
          {t(locale, "newChat")}
        </button>
      </div>
      <label className="search-wrap">
        <IconSearch size={15} />
        <input
          className="search"
          placeholder={t(locale, "searchChats")}
          value={query}
          onChange={(e) => onQuery(e.target.value)}
        />
      </label>
      <div className="conv-list">
        {filtered.length === 0 && <div className="empty-side">{t(locale, "emptyHistory")}</div>}
        {[...groups.entries()].map(([label, rows]) => (
          <div key={label}>
            <div className="conv-group">{label}</div>
            {rows.map((conv) => (
              <button
                key={conv.id}
                type="button"
                className={`conv ${activeId === conv.id ? "active" : ""}`}
                onClick={() => onSelect(conv.id)}
              >
                <div style={{ minWidth: 0 }}>
                  <div className="conv-title">{conv.title}</div>
                  <div className="conv-meta">
                    {new Date(conv.updatedAt).toLocaleTimeString(locale === "tr" ? "tr-TR" : "en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                <span
                  className="conv-x"
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(conv.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onDelete(conv.id);
                  }}
                  aria-label={t(locale, "deleteChat")}
                >
                  <IconTrash />
                </span>
              </button>
            ))}
          </div>
        ))}
      </div>
      <div className="sidebar-foot">{t(locale, "domain")}</div>
    </aside>
  );
}
