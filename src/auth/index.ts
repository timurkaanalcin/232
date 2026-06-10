import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { headers } from "next/headers";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { verifyPassword } from "@/lib/crypto";
import { loginSchema } from "@/lib/validators";
import { logAudit } from "@/lib/audit";
import { rateLimit } from "@/lib/rate-limit";
import { AUDIT_ACTIONS, RATE_LIMITS, SECURITY } from "@/lib/constants";
import { createUser, findUserByEmail, findUserById, touchLastLogin } from "@/services/users";
import { createDeviceSession } from "@/services/device-sessions";
import type { RoleId, UserRow } from "@/types";

function getAuthEnv(): CloudflareEnv {
  return getCloudflareContext().env as CloudflareEnv;
}

async function getRequestMetaSafe(): Promise<{ ip: string; userAgent: string }> {
  try {
    const h = await headers();
    return {
      ip: h.get("cf-connecting-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "",
      userAgent: h.get("user-agent") ?? "",
    };
  } catch {
    return { ip: "", userAgent: "" };
  }
}

function buildConfig(): NextAuthConfig {
  const providers: NextAuthConfig["providers"] = [];

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(
      Google({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      }),
    );
  }

  providers.push(
    Credentials({
      id: "credentials",
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const env = getAuthEnv();
        const db = env.DB;
        const meta = await getRequestMetaSafe();

        const rl = await rateLimit(env, `login:${meta.ip || "unknown"}`, RATE_LIMITS.LOGIN);
        if (!rl.allowed) return null;

        const user = await findUserByEmail(db, parsed.data.email);
        if (!user || !user.password_hash) {
          await logAudit(db, {
            action: AUDIT_ACTIONS.LOGIN_FAILED,
            actorEmail: parsed.data.email,
            ip: meta.ip,
            userAgent: meta.userAgent,
            metadata: { reason: "unknown_user_or_no_password" },
          });
          return null;
        }

        const valid = await verifyPassword(user.password_hash, parsed.data.password);
        if (!valid || user.status !== "active") {
          await logAudit(db, {
            action: AUDIT_ACTIONS.LOGIN_FAILED,
            actorId: user.id,
            actorEmail: user.email,
            ip: meta.ip,
            userAgent: meta.userAgent,
            metadata: { reason: valid ? "account_disabled" : "invalid_password" },
          });
          return null;
        }

        return { id: user.id, email: user.email, name: user.name, image: user.image, role: user.role_id };
      },
    }),
  );

  return {
    secret: process.env.AUTH_SECRET,
    trustHost: true,
    session: {
      strategy: "jwt",
      maxAge: SECURITY.SESSION_MAX_AGE_S,
      updateAge: 24 * 60 * 60,
    },
    pages: {
      signIn: "/login",
      error: "/login",
    },
    providers,
    callbacks: {
      async signIn({ user, account }) {
        if (account?.provider !== "google") return true;
        if (!user.email) return false;
        const db = getAuthEnv().DB;
        const existing = await findUserByEmail(db, user.email);
        // Disabled accounts must not be able to sign in via OAuth either.
        return existing?.status !== "disabled";
      },

      async jwt({ token, user, account }) {
        if (!user) return token;

        // Initial sign-in: resolve our database user and open a device session.
        const env = getAuthEnv();
        const db = env.DB;
        const meta = await getRequestMetaSafe();

        let dbUser: UserRow | null = null;
        if (account?.provider === "google") {
          dbUser = user.email ? await findUserByEmail(db, user.email) : null;
          if (!dbUser && user.email) {
            dbUser = await createUser(db, {
              email: user.email,
              name: user.name ?? user.email.split("@")[0] ?? "User",
              image: user.image ?? null,
              emailVerified: true,
            });
            await logAudit(db, {
              actorId: dbUser.id,
              actorEmail: dbUser.email,
              action: AUDIT_ACTIONS.REGISTER,
              targetType: "user",
              targetId: dbUser.id,
              ip: meta.ip,
              userAgent: meta.userAgent,
              metadata: { provider: "google" },
            });
          }
        } else if (user.id) {
          dbUser = await findUserById(db, user.id);
        }

        if (!dbUser || dbUser.status !== "active") return token;

        const sid = await createDeviceSession(db, {
          userId: dbUser.id,
          userAgent: meta.userAgent,
          ip: meta.ip,
        });

        token.uid = dbUser.id;
        token.role = dbUser.role_id as RoleId;
        token.sid = sid;
        token.name = dbUser.name;
        token.email = dbUser.email;
        token.picture = dbUser.image;

        await touchLastLogin(db, dbUser.id);
        await logAudit(db, {
          actorId: dbUser.id,
          actorEmail: dbUser.email,
          action: AUDIT_ACTIONS.LOGIN,
          targetType: "session",
          targetId: sid,
          ip: meta.ip,
          userAgent: meta.userAgent,
          metadata: { provider: account?.provider ?? "credentials" },
        });

        return token;
      },

      async session({ session, token }) {
        if (token.uid && token.sid) {
          session.user.id = token.uid;
          session.user.role = token.role ?? "user";
          session.user.sessionId = token.sid;
        }
        return session;
      },
    },
    events: {
      async signOut(message) {
        try {
          const token = "token" in message ? message.token : null;
          if (!token?.sid || !token.uid) return;
          const db = getAuthEnv().DB;
          const meta = await getRequestMetaSafe();
          await db
            .prepare(`UPDATE sessions SET revoked_at = ? WHERE id = ? AND revoked_at IS NULL`)
            .bind(Date.now(), token.sid)
            .run();
          await logAudit(db, {
            actorId: token.uid,
            actorEmail: token.email ?? "",
            action: AUDIT_ACTIONS.LOGOUT,
            targetType: "session",
            targetId: token.sid,
            ip: meta.ip,
            userAgent: meta.userAgent,
          });
        } catch (error) {
          console.error(JSON.stringify({ msg: "signout_event_failed", error: String(error) }));
        }
      },
    },
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth(() => buildConfig());
