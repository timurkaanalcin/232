import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/modules/auth/register-form";
import { isGoogleEnabled } from "@/lib/auth-config";

export const metadata: Metadata = { title: "Kayıt ol" };

export default function RegisterPage() {
  return (
    <AuthShell
      title="Hesap oluşturun"
      description="Favori, rezervasyon ve değerlemelerinizi tek yerden yönetin."
      footer={
        <>
          Zaten hesabınız var mı?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Giriş yapın
          </Link>
        </>
      }
    >
      <RegisterForm googleEnabled={isGoogleEnabled()} />
    </AuthShell>
  );
}
