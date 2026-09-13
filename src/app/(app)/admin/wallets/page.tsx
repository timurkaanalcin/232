import type { Metadata } from "next";
import { WalletCenter } from "@/modules/admin/wallet-center";

export const metadata: Metadata = { title: "Wallets" };

export default function AdminWalletsPage() {
  return <WalletCenter />;
}
