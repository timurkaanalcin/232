import {
  LOCAL_STUDIO,
  STUDIO_QUICK_ROLES,
  localModelById,
  type LocalModel,
} from "../lib/local-studio";
import { isPromptPresetId, PRESET_TEMPERATURES, presetPrompt, type PromptPresetId } from "../lib/presets";
import { t, type Locale } from "../lib/i18n";
import type { AppSettings } from "../lib/types";

export function StudioBar({
  locale,
  settings,
  onChange,
  onCopied,
}: {
  locale: Locale;
  settings: AppSettings;
  onChange: (next: AppSettings) => void;
  onCopied: (text: string) => void;
}) {
  function applyRole(role: LocalModel) {
    const next: AppSettings = { ...settings };
    if (isPromptPresetId(role.preset)) {
      const preset = role.preset as PromptPresetId;
      next.promptPresetId = preset;
      next.systemPrompt = presetPrompt(preset, locale);
      next.temperature = role.temperature || PRESET_TEMPERATURES[preset];
    } else if (role.temperature) {
      next.temperature = role.temperature;
    }
    onChange(next);
    const cmd = `./havuz-lms.sh ${role.id}`;
    void navigator.clipboard.writeText(cmd).then(() => onCopied(t(locale, "studioCopied")));
  }

  const trial = LOCAL_STUDIO.trialOrder.map((id) => localModelById(id)).filter(Boolean) as LocalModel[];

  return (
    <div className="studio-bar" aria-label={t(locale, "studioRoles")}>
      <span className="studio-label">{t(locale, "studioRoles")}</span>
      {STUDIO_QUICK_ROLES.map((role) => (
        <button
          key={role.id}
          type="button"
          className={`chip ${settings.promptPresetId === role.preset ? "teal" : ""}`}
          title={role.verdict}
          onClick={() => applyRole(role)}
        >
          {role.id === "claude"
            ? "Claude"
            : role.id === "baseline"
              ? locale === "tr"
                ? "Özgün 3.8"
                : "Base 3.8"
              : role.id === "fusion"
                ? "Fusion"
                : role.id === "turkish"
                  ? locale === "tr"
                    ? "Türkçe"
                    : "Turkish"
                  : role.id === "fast"
                    ? locale === "tr"
                      ? "Hızlı"
                      : "Fast"
                    : role.displayName}
        </button>
      ))}
      <span className="studio-hint">{t(locale, "studioRolesHint")}</span>
      <span className="studio-hint">
        {locale === "tr" ? "Deneme:" : "Trial:"} {trial.map((m) => m.id).join(" → ")} vs {LOCAL_STUDIO.baselineId}
      </span>
    </div>
  );
}
