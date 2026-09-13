import type { Metadata } from "next";
import { auth } from "@/auth";
import { AccountHome } from "@/modules/account/account-home";

export const metadata: Metadata = { title: "Hesabım" };

export default async function DashboardPage() {
  const session = await auth();
  return <AccountHome name={session?.user?.name ?? ""} />;
}
