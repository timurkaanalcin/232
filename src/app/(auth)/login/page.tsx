import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/modules/auth/login-form";
import { isGoogleEnabled } from "@/lib/auth-config";

export const metadata: Metadata = { title: "CRM Giriş" };

export default function LoginPage() {
  return (
    <AuthShell
      title="CRM paneline giriş"
      description="Client, Sale, Retention ve takip operasyonlarını yönetmek için giriş yapın."
      footer={
        <>
          Yeni hesap mı gerekiyor?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Hesap oluştur
          </Link>
        </>
      }
    >
      <Suspense fallback={null}>
        <LoginForm googleEnabled={isGoogleEnabled()} />
      </Suspense>
    </AuthShell>
  );
}
