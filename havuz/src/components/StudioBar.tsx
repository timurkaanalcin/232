import {
  LOCAL_STUDIO,
  STUDIO_QUICK_ROLES,
  localModelById,
  type LocalModel,
} from "../lib/local-studio";
import { isPromptPresetId, PRESET_TEMPERATURES, presetPrompt, type PromptPresetId } from "../lib/presets";
import { t, type Locale } from "../lib/i18n";
import type { AppSettings } from "../lib/types";

const ROLE_LABEL: Record<string, { tr: string; en: string }> = {
  claude: { tr: "Claude", en: "Claude" },
  baseline: { tr: "Özgün 3.8", en: "Base 3.8" },
  fusion: { tr: "Fusion", en: "Fusion" },
  turkish: { tr: "Türkçe", en: "Turkish" },
  fast: { tr: "Hızlı", en: "Fast" },
  qwopus: { tr: "Qwopus v2", en: "Qwopus v2" },
  coder: { tr: "Coder 30B", en: "Coder 30B" },
};

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
          className={`chip ${settings.promptPresetId === role.preset ? "on" : ""}`}
          title={role.verdict}
          onClick={() => applyRole(role)}
        >
          {ROLE_LABEL[role.id]?.[locale] ?? role.displayName}
        </button>
      ))}
      <span className="studio-hint">{t(locale, "studioRolesHint")}</span>
      <span className="studio-hint">
        {locale === "tr" ? "Deneme:" : "Trial:"} {trial.map((m) => m.id).join(" → ")} vs {LOCAL_STUDIO.baselineId}
      </span>
    </div>
  );
}
