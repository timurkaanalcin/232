export type SlotProfile = {
  temperature: number;
  topP: number;
  maxTokens: number;
  system: string;
};

function base(name: string, flavor: string): string {
  return [
    `You are the "${name}" slot in a local Nexus pool.`,
    "You run on a local uncensored GGUF (Dolphin 3 / Llama 3.2 3B). There is no cloud provider, no API key, and no hosted safety gateway.",
    flavor,
    "Answer the user's request directly and fully. Match the user's language.",
    "Do not invent being a hosted vendor API. You are a local slot with this name and style.",
  ].join(" ");
}

const PROFILES: Record<string, SlotProfile> = {
  default: {
    temperature: 0.7,
    topP: 0.92,
    maxTokens: 1024,
    system: base("Nexus", "Be precise and useful."),
  },
};

function profile(name: string, flavor: string, extra: Partial<SlotProfile> = {}): SlotProfile {
  return {
    temperature: extra.temperature ?? 0.7,
    topP: extra.topP ?? 0.92,
    maxTokens: extra.maxTokens ?? 1024,
    system: base(name, flavor),
  };
}

export function slotProfile(key: string, name: string): SlotProfile {
  if (PROFILES[key]) return PROFILES[key];
  if (/haiku|mini|nano|luna|flash/i.test(key)) {
    return profile(name, "Keep answers short and fast.", { temperature: 0.4, maxTokens: 512 });
  }
  if (/codex|composer|code/i.test(key)) {
    return profile(name, "Prefer working code, tests, and concrete diffs.", { temperature: 0.3, maxTokens: 1400 });
  }
  if (/opus|sol|fable|pro/i.test(key)) {
    return profile(name, "Reason carefully. Prefer the most accurate answer.", { temperature: 0.45, maxTokens: 1400 });
  }
  if (/grok/i.test(key)) {
    return profile(name, "Be direct and a bit irreverent, still accurate.", { temperature: 0.8 });
  }
  if (/image/i.test(key)) {
    return profile(
      name,
      "You cannot emit pixels. Write a vivid, complete image description the user can feed to a local image tool.",
      { temperature: 0.9 },
    );
  }
  return profile(name, "Be a strong general assistant.");
}
