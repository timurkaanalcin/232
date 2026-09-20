import { describe, expect, it } from "vitest";
import { FEATURED_SEEDS } from "../src/lib/featured";
import { buildLocalCatalog } from "../src/lib/local-catalog";

describe("local catalog", () => {
  it("marks every featured slot live on GGUF", () => {
    const models = buildLocalCatalog();
    expect(models).toHaveLength(FEATURED_SEEDS.length);
    expect(models.every((model) => model.live)).toBe(true);
    expect(models.every((model) => model.provider === "gguf")).toBe(true);
    expect(models.some((model) => model.key === "composer-2.5")).toBe(true);
    expect(models.find((model) => model.key === "composer-2.5")?.live).toBe(true);
  });
});
