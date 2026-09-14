import { useMemo, useState } from "react";
import { formatContext, PROVIDER_COLORS, PROVIDER_LABELS } from "../lib/catalog";
import { t, type Locale } from "../lib/i18n";
import type { PoolModel, ProviderId } from "../lib/types";
import { IconClose, IconRefresh } from "./Icons";

const FILTERS: Array<ProviderId | "all"> = [
  "all",
  "anthropic",
  "cursor",
  "google",
  "openai",
  "moonshot",
  "zai",
  "meta",
  "xai",
  "openrouter",
  "local",
  "other",
];

export function ModelPicker({
  locale,
  models,
  selectedId,
  refreshing,
  onRefresh,
  onClose,
  onSelect,
}: {
  locale: Locale;
  models: PoolModel[];
  selectedId: string;
  refreshing: boolean;
  onRefresh: () => void;
  onClose: () => void;
  onSelect: (id: string) => void;
}) {
  const [q, setQ] = useState("");
  const [provider, setProvider] = useState<ProviderId | "all">("all");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return models.filter((model) => {
      if (provider !== "all" && model.provider !== provider) return false;
      if (!query) return true;
      return (
        model.displayName.toLowerCase().includes(query) ||
        model.id.toLowerCase().includes(query) ||
        model.gatewayIds.some((id) => id.toLowerCase().includes(query))
      );
    });
  }, [models, provider, q]);

  return (
    <div className="picker-backdrop" onClick={onClose} role="presentation">
      <div
        className="picker"
        role="dialog"
        aria-modal="true"
        aria-label={t(locale, "pickModel")}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="picker-head">
          <input
            className="search"
            style={{ margin: 0, width: "100%" }}
            autoFocus
            placeholder={t(locale, "searchModels")}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button type="button" className="btn" onClick={onRefresh} disabled={refreshing}>
            <IconRefresh size={15} />
            {refreshing ? t(locale, "refreshing") : t(locale, "refreshModels")}
          </button>
          <button type="button" className="btn btn-icon" onClick={onClose} aria-label={t(locale, "close")}>
            <IconClose />
          </button>
        </div>
        <div className="filters">
          {FILTERS.map((id) => (
            <button
              key={id}
              type="button"
              className={`filter ${provider === id ? "on" : ""}`}
              onClick={() => setProvider(id)}
            >
              {id !== "all" && <i className="dot" style={{ background: PROVIDER_COLORS[id] }} />}
              {id === "all" ? t(locale, "allProviders") : PROVIDER_LABELS[id][locale]}
            </button>
          ))}
        </div>
        <div className="model-list">
          {filtered.length === 0 && <div className="empty-side">{t(locale, "noModelMatch")}</div>}
          {filtered.map((model) => (
            <button
              key={model.id}
              type="button"
              className={`model-row ${selectedId === model.id ? "selected" : ""} ${
                model.available ? "" : "off"
              }`}
              onClick={() => onSelect(model.id)}
            >
              <div>
                <div className="model-name">
                  <i className="dot" style={{ background: PROVIDER_COLORS[model.provider] }} />
                  {model.displayName}
                </div>
                <div className="model-sub">
                  {PROVIDER_LABELS[model.provider][locale]}
                  {model.resolvedGatewayId ? ` · ${model.resolvedGatewayId}` : ""}
                </div>
              </div>
              <div className="chips">
                {model.isNew && <span className="chip gold">{t(locale, "newBadge")}</span>}
                {model.imageCapable && <span className="chip teal">{t(locale, "imageBadge")}</span>}
                <span className="chip">
                  {t(locale, "contextDefault")} {formatContext(model.defaultContext)}
                </span>
                <span className="chip">
                  {t(locale, "contextMax")} {formatContext(model.maxContext)}
                </span>
                <span className={`chip ${model.available ? "teal" : "rose"}`}>
                  {model.available ? t(locale, "available") : t(locale, "unavailable")}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
