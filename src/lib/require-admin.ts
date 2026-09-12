import { auth } from "@/auth";
import { ADMIN_ROLES } from "@/lib/constants";
import { NextResponse } from "next/server";

export async function requireAdminResponse() {
  const session = await auth();
  if (!session?.user?.role || !ADMIN_ROLES.includes(session.user.role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  return null;
}
