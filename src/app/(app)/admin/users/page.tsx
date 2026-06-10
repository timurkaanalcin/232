import type { Metadata } from "next";
import { UserManagement } from "@/modules/admin/user-management";

export const metadata: Metadata = { title: "User management" };

export default function AdminUsersPage() {
  return <UserManagement />;
}
