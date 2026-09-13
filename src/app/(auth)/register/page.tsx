import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/modules/auth/register-form";
import { isGoogleEnabled } from "@/lib/auth-config";

export const metadata: Metadata = { title: "Hesap oluştur" };

export default function RegisterPage() {
  return (
    <AuthShell
      title="Hesap oluştur"
      description="Konum paylaşımı yalnızca açık izninizle başlar. Hesabınızı güvenle oluşturun."
      footer={
        <>
          Zaten hesabınız var mı?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Giriş yap
          </Link>
        </>
      }
    >
      <RegisterForm googleEnabled={isGoogleEnabled()} />
    </AuthShell>
  );
}
