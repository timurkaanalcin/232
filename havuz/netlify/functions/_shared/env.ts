declare const Netlify: { env: { get(name: string): string | undefined } };

export function netlifyEnv(name: string): string | undefined {
  try {
    const value = Netlify.env.get(name);
    return value && value.trim() ? value : undefined;
  } catch {
    return undefined;
  }
}

export function gatewaySecrets() {
  const openaiKey = netlifyEnv("OPENAI_API_KEY") ?? netlifyEnv("NETLIFY_AI_GATEWAY_KEY");
  const openaiBase =
    netlifyEnv("OPENAI_BASE_URL") ??
    netlifyEnv("NETLIFY_AI_GATEWAY_BASE_URL") ??
    netlifyEnv("NETLIFY_AI_GATEWAY_URL");
  const anthropicKey = netlifyEnv("ANTHROPIC_API_KEY") ?? netlifyEnv("NETLIFY_AI_GATEWAY_KEY");
  const anthropicBase = netlifyEnv("ANTHROPIC_BASE_URL");
  const geminiKey = netlifyEnv("GEMINI_API_KEY") ?? netlifyEnv("NETLIFY_AI_GATEWAY_KEY");
  const geminiBase = netlifyEnv("GOOGLE_GEMINI_BASE_URL");
  const openrouterKey = netlifyEnv("OPENROUTER_API_KEY") ?? netlifyEnv("NETLIFY_AI_GATEWAY_KEY");
  const openrouterBase = netlifyEnv("OPENROUTER_BASE_URL") ?? openaiBase;

  return {
    openaiKey,
    openaiBase,
    anthropicKey,
    anthropicBase,
    geminiKey,
    geminiBase,
    openrouterKey,
    openrouterBase,
    gatewayKey: netlifyEnv("NETLIFY_AI_GATEWAY_KEY"),
    gatewayBase: netlifyEnv("NETLIFY_AI_GATEWAY_BASE_URL") ?? netlifyEnv("NETLIFY_AI_GATEWAY_URL"),
  };
}

export function isGatewayReady(): boolean {
  const s = gatewaySecrets();
  return Boolean(
    s.gatewayKey || s.openaiKey || s.anthropicKey || s.geminiKey || s.openrouterKey,
  );
}
