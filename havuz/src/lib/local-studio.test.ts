import { describe, expect, it } from "vitest";
import {
  LOCAL_STUDIO,
  downloadableModels,
  enrichLocalModels,
  matchLocalModel,
} from "./local-studio";
import { PROMPT_PRESETS } from "./presets";
import type { PoolModel } from "./types";

describe("local studio catalog", () => {
  it("keeps the trial order and baseline", () => {
    expect(LOCAL_STUDIO.trialOrder).toEqual(["claude", "fusion", "turkish"]);
    expect(LOCAL_STUDIO.baselineId).toBe("baseline");
    expect(LOCAL_STUDIO.models.find((m) => m.id === "claude")?.wave).toBe(1);
    expect(LOCAL_STUDIO.models.find((m) => m.id === "fusion")?.wave).toBe(1);
  });

  it("bans v1 and rico03", () => {
    expect(LOCAL_STUDIO.models.filter((m) => m.banned).map((m) => m.id).sort()).toEqual([
      "barozp-v1",
      "rico03",
    ]);
  });

  it("downloads six wave-1 modules", () => {
    const ids = downloadableModels(1).map((m) => m.id);
    expect(ids).toEqual(["baseline", "claude", "fusion", "turkish", "fast", "embed"]);
  });

  it("matches v2 to claude and not v1", () => {
    expect(matchLocalModel("barozp/Qwen3.8-27B-Opus-Distill-v2-MLX-4bit")?.id).toBe("claude");
    expect(matchLocalModel("Qwen3.8-27B-Opus-Distill-Q4_K_M")?.id).toBe("barozp-v1");
    expect(matchLocalModel("rico03/Qwen3.8-27B-Claude-Opus-Reasoning-Distilled")?.id).toBe("rico03");
    expect(matchLocalModel("lmstudio-community/Qwen3.8-27B-MLX-4bit")?.id).toBe("baseline");
  });

  it("enriches live LM Studio ids", () => {
    const row: PoolModel = {
      id: "barozp/Qwen3.8-27B-Opus-Distill-v2-MLX-4bit",
      provider: "local",
      displayName: "Raw",
      defaultContext: null,
      maxContext: null,
      gatewayIds: ["x"],
      curated: false,
      available: true,
      source: "live",
      isNew: false,
      resolvedGatewayId: "x",
    };
    const [out] = enrichLocalModels([row]);
    expect(out.displayName).toContain("Opus-Distill-v2");
    expect(out.capabilities).toContain("chat");
    expect(out.imageCapable).toBe(true);
  });

  it("has a prompt preset for every chat role that declares one", () => {
    for (const model of LOCAL_STUDIO.models) {
      if (!model.preset || model.banned) continue;
      expect(model.preset in PROMPT_PRESETS).toBe(true);
    }
  });
});
