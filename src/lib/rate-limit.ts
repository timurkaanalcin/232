/**
 * Distributed rate limiting backed by the RateLimiterDO Durable Object.
 * Each key gets its own object instance, so there is no global bottleneck.
 */

export interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

export async function rateLimit(
  env: CloudflareEnv,
  key: string,
  options: RateLimitOptions,
): Promise<RateLimitResult> {
  try {
    const stub = env.RATE_LIMITER.getByName(`rl:${key}`);
    return await stub.consume(options.limit, options.windowMs);
  } catch (error) {
    // Fail open: a rate limiter outage must not take down authentication.
    console.error(JSON.stringify({ msg: "rate_limit_unavailable", key, error: String(error) }));
    return { allowed: true, remaining: 0, retryAfterMs: 0 };
  }
}
