import { PRODUCTION_ORIGIN } from "../lib/site";
import { LM_STUDIO_ORIGIN } from "../lib/openai-local";
import { isLocalOpenAI } from "../lib/openai-local";
import {
  PRESET_TEMPERATURES,
  PROMPT_PRESETS,
  presetPrompt,
  type PromptPresetId,
} from "../lib/presets";
import { t, type Locale } from "../lib/i18n";
import type { AppSettings, PoolModel } from "../lib/types";
import { IconClose } from "./Icons";

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
  function applyPreset(id: PromptPresetId) {
    onChange({
      ...settings,
      promptPresetId: id,
      systemPrompt: presetPrompt(id, locale),
      temperature: PRESET_TEMPERATURES[id],
    });
  }

  const local = isLocalOpenAI(settings.apiBase);

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className="modal modal-wide" role="dialog" aria-modal="true" aria-labelledby="settings-title" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2 id="settings-title">{t(locale, "settingsTitle")}</h2>
          <div className="top-spacer" />
          <button type="button" className="btn btn-icon" onClick={onClose} aria-label={t(locale, "close")}>
            <IconClose />
          </button>
        </div>
        <div className="field">
          <label>{t(locale, "promptPresets")}</label>
          <div className="chips" style={{ marginTop: 4 }}>
            {(Object.keys(PROMPT_PRESETS) as PromptPresetId[]).map((id) => (
              <button
                key={id}
                type="button"
                className={`chip ${settings.promptPresetId === id ? "on" : ""}`}
                onClick={() => applyPreset(id)}
              >
                {PROMPT_PRESETS[id][locale]}
              </button>
            ))}
            <button
              type="button"
              className="chip"
              onClick={() => onChange({ ...settings, systemPrompt: "", promptPresetId: "" })}
            >
              {t(locale, "presetClear")}
            </button>
          </div>
        </div>
        <div className="field">
          <label htmlFor="sys">{t(locale, "systemPrompt")}</label>
          <textarea
            id="sys"
            value={settings.systemPrompt}
            placeholder={t(locale, "systemPromptHint")}
            onChange={(e) =>
              onChange({
                ...settings,
                systemPrompt: e.target.value,
                promptPresetId: "",
              })
            }
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
            placeholder={PRODUCTION_ORIGIN}
            value={settings.apiBase}
            onChange={(e) => onChange({ ...settings, apiBase: e.target.value })}
          />
          <span className="field-hint">{t(locale, "siteUrlHint")}</span>
          <div className="chips" style={{ marginTop: 8 }}>
            <button
              type="button"
              className={`chip ${local ? "on" : ""}`}
              onClick={() => onChange({ ...settings, apiBase: LM_STUDIO_ORIGIN })}
            >
              {t(locale, "useLmStudio")}
            </button>
            <button
              type="button"
              className="chip"
              onClick={() => onChange({ ...settings, apiBase: PRODUCTION_ORIGIN })}
            >
              {t(locale, "useNetlify")}
            </button>
            <button type="button" className="chip" onClick={() => onChange({ ...settings, apiBase: "" })}>
              {t(locale, "useSameOrigin")}
            </button>
          </div>
        </div>
        <div className="field">
          <label htmlFor="def">{t(locale, "defaultModel")}</label>
          <select
            id="def"
            className="search select"
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
