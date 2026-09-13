import type { Metadata } from "next";
import { SettingsModule } from "@/modules/settings/settings";

export const metadata: Metadata = { title: "Ayarlar" };

export default function SettingsPage() {
  return <SettingsModule />;
}
