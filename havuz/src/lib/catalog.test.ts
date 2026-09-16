import { describe, expect, it } from "vitest";
import { CURATED_MODELS, formatContext, guessProvider, mergePool, PROVIDER_COLORS, PROVIDER_LABELS } from "./catalog";
import { PRODUCTION_ORIGIN } from "./site";

describe("curated catalog", () => {
  it("includes every requested display name", () => {
    const names = CURATED_MODELS.map((m) => m.displayName);
    const required = [
      "Claude 4 Sonnet",
      "Claude 4 Sonnet 1M",
      "Claude 4.5 Haiku",
      "Claude 4.5 Opus",
      "Claude 4.5 Sonnet",
      "Claude 4.6 Opus",
      "Claude 4.6 Sonnet",
      "Claude 4.7 Opus",
      "Claude Fable 5",
      "Claude Fable 5.1",
      "Claude Opus 4.7 (fast mode)",
      "Claude Opus 4.8",
      "Claude Opus 5",
      "Claude Sonnet 5",
      "Composer 1",
      "Composer 2.5",
      "Grok 4.5",
      "Grok 4.6",
      "Gemini 2.5 Flash",
      "Gemini 3 Flash",
      "Gemini 3 Pro",
      "Gemini 3 Pro Image Preview",
      "Gemini 3.1 Pro",
      "Gemini 3.5 Flash",
      "Gemini 3.6 Flash",
      "Gemini 3.7 Flash",
      "Gemini 3.8 Flash",
      "GLM 5.2",
      "GPT-5",
      "GPT-5 Fast",
      "GPT-5 Mini",
      "GPT-5-Codex",
      "GPT-5.1 Codex",
      "GPT-5.1 Codex Max",
      "GPT-5.1 Codex Mini",
      "GPT-5.2",
      "GPT-5.2 Codex",
      "GPT-5.3 Codex",
      "GPT-5.4",
      "GPT-5.4 Mini",
      "GPT-5.4 Nano",
      "GPT-5.5",
      "GPT-5.6 Luna",
      "GPT-5.6 Sol",
      "GPT-5.6 Terra",
      "Kimi K2.7 Code",
      "Kimi K3",
      "Muse Spark 1.3",
    ];
    for (const name of required) {
      expect(names).toContain(name);
    }
  });
});

describe("mergePool", () => {
  it("marks curated rows available when the live id matches", () => {
    const merged = mergePool([
      { id: "claude-sonnet-4-5", provider: "anthropic" },
      { id: "gpt-5.4-mini", provider: "openai" },
    ]);
    expect(merged.find((m) => m.id === "claude-4.5-sonnet")?.available).toBe(true);
    expect(merged.find((m) => m.id === "gpt-5.4-mini")?.available).toBe(true);
    expect(merged.find((m) => m.id === "composer-1")?.available).toBe(false);
  });

  it("appends unknown live ids as new models", () => {
    const merged = mergePool([{ id: "acme/brand-new-9", provider: "openrouter" }]);
    const fresh = merged.find((m) => m.id === "acme/brand-new-9");
    expect(fresh?.isNew).toBe(true);
    expect(fresh?.available).toBe(true);
    expect(fresh?.defaultContext).toBeNull();
    expect(fresh?.provider).toBe("openrouter");
  });

  it("guesses providers from ids", () => {
    expect(guessProvider("claude-opus-5")).toBe("anthropic");
    expect(guessProvider("x-ai/grok-4.6")).toBe("xai");
    expect(guessProvider("moonshotai/kimi-k3")).toBe("moonshot");
    expect(guessProvider("z-ai/glm-5.2")).toBe("zai");
  });

  it("formats context badges", () => {
    expect(formatContext(200_000)).toBe("200k");
    expect(formatContext(1_000_000)).toBe("1M");
    expect(formatContext(null)).toBe("—");
  });

  it("keeps a color for every provider label", () => {
    expect(Object.keys(PROVIDER_COLORS).sort()).toEqual(Object.keys(PROVIDER_LABELS).sort());
  });

  it("pins the production origin", () => {
    expect(PRODUCTION_ORIGIN).toBe("https://aipo.customer.org.tr");
  });
});

describe("brand", () => {
  it("is named llvadAI", async () => {
    const { t } = await import("./i18n");
    expect(t("tr", "brand")).toBe("llvadAI");
    expect(t("en", "brand")).toBe("llvadAI");
  });

  it("keeps the ember mark identical in the SVG and BrandMark", async () => {
    const { readFile } = await import("node:fs/promises");
    const { fileURLToPath } = await import("node:url");
    const { dirname, join } = await import("node:path");
    const here = dirname(fileURLToPath(import.meta.url));
    const svg = await readFile(join(here, "../../public/favicon.svg"), "utf8");
    const mark = await readFile(join(here, "../components/BrandMark.tsx"), "utf8");
    const geometry = [
      'x="18.5" y="16" width="7.2" height="32"',
      'x="29.6" y="16" width="7.2" height="32"',
      'cx="46.2" cy="20.4" r="3.1"',
      "#ff6b1a",
      "#ff8a3d",
      "#070504",
    ];
    for (const token of geometry) {
      expect(svg).toContain(token);
      expect(mark).toContain(token);
    }
    expect(svg).not.toMatch(/#00e5|#14b8a6|teal/i);
  });
});
