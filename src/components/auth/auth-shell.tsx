import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/layout/logo";
import { ShieldCheckIcon } from "lucide-react";

export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex flex-col px-6 py-8 sm:px-10">
        <Link href="/" aria-label="CanlıSite ana sayfa" className="w-fit">
          <Logo />
        </Link>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">
            <p className="hud-label mb-2">Kimlik doğrulama</p>
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
            <div className="mt-6">{children}</div>
            {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
          </div>
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-[#07140f] lg:block">
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgb(52_211_153/0.18)_1px,transparent_1px),linear-gradient(90deg,rgb(52_211_153/0.18)_1px,transparent_1px)] [background-size:32px_32px]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
        <div className="relative flex h-full flex-col justify-end p-12 text-emerald-50">
          <ShieldCheckIcon className="mb-6 size-12 text-emerald-300" />
          <p className="hud-label mb-3 text-emerald-300">Komuta merkezi</p>
          <blockquote className="text-2xl font-medium leading-snug">
            Konum paylaşımı yalnızca açık izinle başlar. Operasyon paneli audit kaydı ve durdurma hakkı ile
            çalışır.
          </blockquote>
          <p className="mt-4 font-mono text-xs uppercase tracking-[0.16em] text-emerald-200/70">
            GDPR &amp; KVKK · Audit trail · Consent-first
          </p>
        </div>
      </div>
    </div>
  );
}
