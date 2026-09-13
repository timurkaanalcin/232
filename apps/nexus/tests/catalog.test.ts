import { describe, expect, it } from "vitest";
import {
  buildCatalog,
  findModel,
  flattenLiveProviders,
  formatContext,
  pickLiveCandidate,
  prettyModelName,
} from "../src/lib/catalog";
import { FEATURED_SEEDS } from "../src/lib/featured";

const sample = {
  anthropic: {
    models: {
      "claude-sonnet-5": { pricing: { input: 2, output: 10 } },
      "claude-opus-5": { pricing: { input: 5, output: 25 } },
      "claude-fable-5-1": { pricing: { input: 10, output: 50 } },
    },
  },
  openai: {
    models: ["gpt-5.6-sol", "gpt-5.4"],
  },
  gemini: {
    models: ["gemini-3.8-flash", "gemini-3-pro-image"],
  },
  openrouter: {
    models: ["x-ai/grok-4.6", "moonshotai/kimi-k3", "z-ai/glm-5.2", "~x-ai/grok-latest"],
  },
};

describe("catalog", () => {
  it("keeps every featured seed and marks live hits", () => {
    const models = buildCatalog(sample);
    const featured = models.filter((model) => model.featured);
    expect(featured).toHaveLength(FEATURED_SEEDS.length);
    expect(findModel(models, "featured:claude-sonnet-5")?.live).toBe(true);
    expect(findModel(models, "featured:gpt-5.6-sol")?.live).toBe(true);
    expect(findModel(models, "featured:grok-4.6")?.apiModel).toBe("x-ai/grok-4.6");
    expect(findModel(models, "featured:composer-2.5")?.live).toBe(false);
  });

  it("adds unknown live models automatically", () => {
    const models = buildCatalog(sample);
    const grokLatest = models.find((model) => model.apiModel === "~x-ai/grok-latest");
    expect(grokLatest?.featured).toBe(false);
    expect(grokLatest?.isNew).toBe(true);
    expect(grokLatest?.live).toBe(true);
  });

  it("resolves the first live candidate", () => {
    const live = flattenLiveProviders(sample);
    expect(pickLiveCandidate(["missing", "claude-sonnet-5"], live)?.apiModel).toBe("claude-sonnet-5");
    expect(pickLiveCandidate(["nobody"], live)).toBeUndefined();
  });

  it("formats context windows", () => {
    expect(formatContext(1_000_000)).toBe("1M");
    expect(formatContext(272_000)).toBe("272k");
    expect(formatContext(null)).toBeNull();
  });

  it("pretty-prints model ids", () => {
    expect(prettyModelName("x-ai/grok-4.6")).toContain("Grok");
  });
});
