import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "CRM Panel" };

export default function DashboardPage() {
  redirect("/admin/users");
}
