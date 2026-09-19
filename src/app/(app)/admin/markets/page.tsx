import type { Metadata } from "next";
import { FinanceCms } from "@/modules/admin/finance-cms";

export const metadata: Metadata = { title: "Piyasa yönetimi" };

export default function Page() {
  return <FinanceCms />;
}
