import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/modules/auth/reset-password-form";

export const metadata: Metadata = { title: "Yeni şifre" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return (
    <AuthShell
      title="Yeni şifre belirleyin"
      description="Güçlü bir şifre seçin. Bu işlem tüm cihazlardan çıkış yaptırır."
      footer={
        <Link href="/login" className="text-primary hover:underline">
          Girişe dön
        </Link>
      }
    >
      <ResetPasswordForm token={token ?? null} />
    </AuthShell>
  );
}
