import type { DefaultSession } from "next-auth";
import type { RoleId } from "@/types";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: RoleId;
      /** Device session id - server-side revocation handle. */
      sessionId: string;
    } & DefaultSession["user"];
  }

  interface User {
    role?: RoleId;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid?: string;
    role?: RoleId;
    sid?: string;
  }
}
