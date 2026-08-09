import type { Metadata } from "next";
import { ClientDetail } from "@/modules/admin/client-detail";

export const metadata: Metadata = { title: "Client detay" };

export default async function AdminClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ClientDetail clientId={id} />;
}
