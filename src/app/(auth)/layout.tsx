import Link from "next/link";
import { Logo } from "@/components/layout/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="flex h-14 items-center px-4 sm:px-6">
        <Link href="/" aria-label="LiveTrack home">
          <Logo />
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md">{children}</div>
      </main>
      <footer className="p-4 text-center text-xs text-muted-foreground">
        Consent-first location sharing · GDPR/KVKK compliant
      </footer>
    </div>
  );
}
