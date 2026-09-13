import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/modules/auth/forgot-password-form";

export const metadata: Metadata = { title: "Şifre sıfırla" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Şifrenizi mi unuttunuz?"
      description="E-posta adresinizi girin; sıfırlama bağlantısını gönderelim."
      footer={
        <Link href="/login" className="text-primary hover:underline">
          Girişe dön
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
