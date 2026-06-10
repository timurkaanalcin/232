import { DurableObject } from "cloudflare:workers";

interface WindowState {
  count: number;
  resetAt: number;
}

/**
 * Fixed-window rate limiter. One instance per key (`rl:<key>`), so limits are
 * globally consistent without a central bottleneck. Storage is wiped by the
 * alarm once the window expires, keeping idle objects empty and free.
 */
export class RateLimiterDO extends DurableObject<CloudflareEnv> {
  async consume(
    limit: number,
    windowMs: number,
  ): Promise<{ allowed: boolean; remaining: number; retryAfterMs: number }> {
    const now = Date.now();
    let state = (await this.ctx.storage.get<WindowState>("window")) ?? null;

    if (!state || state.resetAt <= now) {
      state = { count: 0, resetAt: now + windowMs };
      await this.ctx.storage.setAlarm(state.resetAt);
    }

    state.count += 1;
    await this.ctx.storage.put("window", state);

    return {
      allowed: state.count <= limit,
      remaining: Math.max(0, limit - state.count),
      retryAfterMs: state.count <= limit ? 0 : Math.max(0, state.resetAt - now),
    };
  }

  async alarm(): Promise<void> {
    await this.ctx.storage.deleteAll();
  }
}
