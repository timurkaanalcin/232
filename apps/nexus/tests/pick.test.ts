import { describe, expect, it } from "vitest";
import { buildCatalog } from "../src/lib/catalog";
import { classifyPrompt, pickBestModel, POOL_ID, scoreModel } from "../src/lib/pick";

const models = buildCatalog({
  anthropic: { models: ["claude-opus-5", "claude-sonnet-5", "claude-haiku-4-5", "claude-opus-4-8"] },
  openai: { models: ["gpt-5.6-sol", "gpt-5.3-codex", "gpt-5-mini"] },
  gemini: { models: ["gemini-3.1-pro-preview", "gemini-3-pro-image", "gemini-3.8-flash"] },
  openrouter: { models: ["moonshotai/kimi-k2.7-code", "x-ai/grok-4.6"] },
});

describe("pickBestModel", () => {
  it("classifies prompts", () => {
    expect(classifyPrompt("İstanbul'un nüfusu kaç?")).toBe("accuracy");
    expect(classifyPrompt("Bu TypeScript fonksiyonunu refactor et")).toBe("code");
    expect(classifyPrompt("Bir korgi yağlıboya resmi üret")).toBe("image");
    expect(classifyPrompt("x^2 + 5x + 6 denklemini çöz, ispatla")).toBe("math");
  });

  it("picks Opus 5 for a factual question", () => {
    const pick = pickBestModel(models, "Dünyanın en kalabalık şehri hangisidir?");
    expect(pick?.model.key).toBe("claude-opus-5");
    expect(pick?.task).toBe("accuracy");
    expect(pick?.score).toBeGreaterThan(scoreModel(models.find((m) => m.key === "claude-4.5-haiku")!, "accuracy"));
  });

  it("picks a code model for engineering prompts", () => {
    const pick = pickBestModel(models, "function add(a,b){return a+b} TypeScript'e çevir ve test yaz");
    expect(pick?.model.isCode || /sol|opus/i.test(pick?.model.key ?? "")).toBe(true);
    expect(pick?.task).toBe("code");
  });

  it("picks an image model for image prompts", () => {
    const pick = pickBestModel(models, "generate an image of a lighthouse at dusk");
    expect(pick?.model.isImage).toBe(true);
  });

  it("never returns the virtual pool id", () => {
    const pick = pickBestModel(models, "Merhaba");
    expect(pick?.model.id).not.toBe(POOL_ID);
  });
});
