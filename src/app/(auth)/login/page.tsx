import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/modules/auth/login-form";
import { isGoogleEnabled } from "@/lib/auth-config";

export const metadata: Metadata = { title: "Giriş" };

export default function LoginPage() {
  return (
    <AuthShell
      title="Komuta giriş"
      description="İzin temelli konum paylaşımı ve oturumlarınızı yönetmek için giriş yapın."
      footer={
        <>
          CanlıSite yeni misiniz?{" "}
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
