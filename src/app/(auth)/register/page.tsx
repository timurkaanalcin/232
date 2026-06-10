import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/modules/auth/register-form";
import { isGoogleEnabled } from "@/lib/auth-config";

export const metadata: Metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create your account"
      description="Start sharing your location securely — only ever with your consent."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <RegisterForm googleEnabled={isGoogleEnabled()} />
    </AuthShell>
  );
}
