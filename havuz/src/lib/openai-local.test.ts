import { describe, expect, it } from "vitest";
import { isLocalOpenAI } from "./openai-local";
import { enrichLocalModels } from "./local-studio";
import type { PoolModel } from "./types";

describe("isLocalOpenAI", () => {
  it("detects LM Studio origins", () => {
    expect(isLocalOpenAI("http://127.0.0.1:1234")).toBe(true);
    expect(isLocalOpenAI("http://localhost:1234/")).toBe(true);
    expect(isLocalOpenAI("https://llvadai.netlify.app")).toBe(false);
    expect(isLocalOpenAI("https://aipo.customer.org.tr")).toBe(false);
    expect(isLocalOpenAI("")).toBe(false);
  });
});

describe("enrichLocalModels", () => {
  it("sorts catalog hits ahead of unknown ids", () => {
    const rows: PoolModel[] = [
      {
        id: "mystery-7b",
        provider: "local",
        displayName: "Mystery",
        defaultContext: null,
        maxContext: null,
        gatewayIds: ["mystery-7b"],
        curated: false,
        available: true,
        source: "live",
        isNew: false,
        resolvedGatewayId: "mystery-7b",
      },
      {
        id: "nomic-embed-text-v1.5",
        provider: "local",
        displayName: "Nomic",
        defaultContext: null,
        maxContext: null,
        gatewayIds: ["nomic-embed-text-v1.5"],
        curated: false,
        available: true,
        source: "live",
        isNew: false,
        resolvedGatewayId: "nomic-embed-text-v1.5",
      },
    ];
    const out = enrichLocalModels(rows);
    expect(out[0].id).toBe("nomic-embed-text-v1.5");
    expect(out[0].capabilities).toContain("embed");
  });
});
