import { t, type Locale } from "../lib/i18n";
import type { AppSettings, PoolModel } from "../lib/types";

export function SettingsModal({
  locale,
  settings,
  models,
  onChange,
  onClose,
}: {
  locale: Locale;
  settings: AppSettings;
  models: PoolModel[];
  onChange: (next: AppSettings) => void;
  onClose: () => void;
}) {
  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className="modal" role="dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{t(locale, "settingsTitle")}</h2>
          <div className="top-spacer" />
          <button type="button" className="btn" onClick={onClose}>
            {t(locale, "close")}
          </button>
        </div>
        <div className="field">
          <label htmlFor="sys">{t(locale, "systemPrompt")}</label>
          <textarea
            id="sys"
            value={settings.systemPrompt}
            placeholder={t(locale, "systemPromptHint")}
            onChange={(e) => onChange({ ...settings, systemPrompt: e.target.value })}
          />
        </div>
        <div className="field">
          <label htmlFor="temp">
            {t(locale, "temperature")}: {settings.temperature.toFixed(2)}
          </label>
          <input
            id="temp"
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={settings.temperature}
            onChange={(e) => onChange({ ...settings, temperature: Number(e.target.value) })}
          />
        </div>
        <div className="field">
          <label htmlFor="api">{t(locale, "siteUrl")}</label>
          <input
            id="api"
            className="search"
            style={{ margin: 0, width: "100%" }}
            type="url"
            placeholder="https://….netlify.app"
            value={settings.apiBase}
            onChange={(e) => onChange({ ...settings, apiBase: e.target.value })}
          />
          <span style={{ color: "var(--muted)", fontSize: 12 }}>{t(locale, "siteUrlHint")}</span>
        </div>
        <div className="field">
          <label htmlFor="def">{t(locale, "defaultModel")}</label>
          <select
            id="def"
            className="search"
            style={{ margin: 0, width: "100%" }}
            value={settings.defaultModelId}
            onChange={(e) => onChange({ ...settings, defaultModelId: e.target.value })}
          >
            {models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.displayName}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
