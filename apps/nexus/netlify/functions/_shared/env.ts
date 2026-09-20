export function readEnv(name: string): string | undefined {
  const netlifyEnv = (globalThis as { Netlify?: { env?: { get?: (key: string) => string | undefined } } }).Netlify;
  const fromNetlify = netlifyEnv?.env?.get?.(name);
  if (fromNetlify) return fromNetlify;
  if (typeof process !== "undefined") {
    return process.env[name];
  }
  return undefined;
}

export function gatewayReady(): boolean {
  return Boolean(
    readEnv("NETLIFY_AI_GATEWAY_KEY") ||
      readEnv("OPENAI_API_KEY") ||
      readEnv("ANTHROPIC_API_KEY") ||
      readEnv("GEMINI_API_KEY") ||
      readEnv("OPENROUTER_API_KEY"),
  );
}
