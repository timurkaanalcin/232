/**
 * Server-side API helpers: error envelope, auth guards, request metadata,
 * CSRF origin validation and rate-limit enforcement.
 */
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/auth";
import { getEnv } from "@/lib/db";
import { rateLimit, type RateLimitOptions } from "@/lib/rate-limit";
import { ROLE_PERMISSIONS, SECURITY_EVENT_TYPES } from "@/lib/constants";
import { logSecurityEvent } from "@/services/security-events";
import type { Permission, RoleId } from "@/types";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

export const unauthorized = () => new ApiError(401, "unauthorized", "Authentication required");
export const forbidden = () => new ApiError(403, "forbidden", "You do not have permission to perform this action");
export const notFound = (what = "Resource") => new ApiError(404, "not_found", `${what} not found`);
export const badRequest = (message: string) => new ApiError(400, "bad_request", message);
export const tooManyRequests = () =>
  new ApiError(429, "rate_limited", "Too many requests. Please try again later.");

/** Wraps a route handler with a consistent JSON error envelope. */
export function apiHandler<Args extends unknown[]>(
  handler: (...args: Args) => Promise<NextResponse | Response>,
): (...args: Args) => Promise<NextResponse | Response> {
  return async (...args: Args) => {
    try {
      return await handler(...args);
    } catch (error) {
      if (error instanceof ApiError) {
        return NextResponse.json(
          { error: { code: error.code, message: error.message } },
          { status: error.status },
        );
      }
      console.error(JSON.stringify({ msg: "unhandled_api_error", error: String(error) }));
      return NextResponse.json(
        { error: { code: "internal", message: "An unexpected error occurred" } },
        { status: 500 },
      );
    }
  };
}

export interface RequestMeta {
  ip: string;
  userAgent: string;
}

export async function getRequestMeta(): Promise<RequestMeta> {
  const h = await headers();
  return {
    ip: h.get("cf-connecting-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "",
    userAgent: h.get("user-agent") ?? "",
  };
}

/**
 * CSRF defence-in-depth for mutating endpoints: session cookies are SameSite=Lax,
 * and on top of that we reject cross-origin requests outright.
 */
export async function assertSameOrigin(request: Request): Promise<void> {
  const origin = request.headers.get("origin");
  if (!origin) return; // same-origin fetches and non-browser clients may omit Origin
  const host = request.headers.get("host");
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    throw new ApiError(403, "csrf", "Invalid request origin");
  }
  if (originHost !== host) {
    throw new ApiError(403, "csrf", "Cross-origin request rejected");
  }
}

export interface AuthedUser {
  id: string;
  email: string;
  name: string;
  role: RoleId;
  /** Device session id (sid claim). */
  sessionId: string;
}

export interface AuthedContext {
  user: AuthedUser;
  env: CloudflareEnv;
  db: D1Database;
  meta: RequestMeta;
}

/**
 * Resolves the authenticated user and validates that their device session has
 * not been revoked (server-side session control on top of the JWT).
 */
export async function requireUser(): Promise<AuthedContext> {
  const session = await auth();
  const user = session?.user;
  if (!user?.id || !user.sessionId) throw unauthorized();

  const env = getEnv();
  const db = env.DB;
  const now = Date.now();

  const row = await db
    .prepare(`SELECT id, revoked_at, expires_at, last_seen_at FROM sessions WHERE id = ? AND user_id = ?`)
    .bind(user.sessionId, user.id)
    .first<{ id: string; revoked_at: number | null; expires_at: number; last_seen_at: number }>();

  if (!row || row.revoked_at !== null || row.expires_at < now) throw unauthorized();

  // Throttled activity tracking (at most one write per 5 minutes per session).
  if (now - row.last_seen_at > 5 * 60 * 1000) {
    await db.prepare(`UPDATE sessions SET last_seen_at = ? WHERE id = ?`).bind(now, row.id).run();
  }

  return {
    user: {
      id: user.id,
      email: user.email ?? "",
      name: user.name ?? "",
      role: (user.role ?? "user") as RoleId,
      sessionId: user.sessionId,
    },
    env,
    db,
    meta: await getRequestMeta(),
  };
}

const permissionCache = new Map<RoleId, { permissions: Set<string>; loadedAt: number }>();
const PERMISSION_CACHE_TTL_MS = 60_000;

export async function getPermissions(db: D1Database, role: RoleId): Promise<Set<string>> {
  const cached = permissionCache.get(role);
  if (cached && Date.now() - cached.loadedAt < PERMISSION_CACHE_TTL_MS) return cached.permissions;
  try {
    const result = await db
      .prepare(`SELECT permission FROM permissions WHERE role_id = ?`)
      .bind(role)
      .all<{ permission: string }>();
    const permissions = new Set(result.results.map((r) => r.permission));
    permissionCache.set(role, { permissions, loadedAt: Date.now() });
    return permissions;
  } catch {
    return new Set(ROLE_PERMISSIONS[role] ?? []);
  }
}

export async function requirePermission(permission: Permission): Promise<AuthedContext> {
  const context = await requireUser();
  const permissions = await getPermissions(context.db, context.user.role);
  if (!permissions.has(permission)) throw forbidden();
  return context;
}

export async function enforceRateLimit(
  key: string,
  options: RateLimitOptions,
  env?: CloudflareEnv,
  meta?: RequestMeta,
): Promise<void> {
  const resolvedEnv = env ?? getEnv();
  const result = await rateLimit(resolvedEnv, key, options);
  if (!result.allowed) {
    void logSecurityEvent(resolvedEnv.DB, {
      eventType: SECURITY_EVENT_TYPES.RATE_LIMITED,
      severity: "warning",
      ip: meta?.ip,
      userAgent: meta?.userAgent,
      metadata: { key, retryAfterMs: result.retryAfterMs },
    });
    throw tooManyRequests();
  }
}

export function jsonOk<T>(data: T, init?: ResponseInit): NextResponse {
  return NextResponse.json(data as unknown as Record<string, unknown>, init);
}
