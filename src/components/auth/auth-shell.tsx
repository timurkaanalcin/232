import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/layout/logo";
import { BRAND } from "@/lib/brand";

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
        <Link href="/" aria-label={`${BRAND.name} ana sayfa`} className="w-fit">
          <Logo />
        </Link>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
            <div className="mt-6">{children}</div>
            {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
          </div>
        </div>
      </div>
      <div className="relative hidden overflow-hidden bg-[#0B1F3A] lg:block">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:28px 28px]" />
        <div className="relative flex h-full flex-col justify-end p-12 text-white">
          <p className="text-sm uppercase tracking-[0.2em] text-amber-300">{BRAND.tagline}</p>
          <blockquote className="mt-4 text-2xl font-medium leading-snug">
            Ekspertizli stok, 14 gün iade ve aynı gün teslimat. Hesabınızdan rezervasyon ve değerlemelerinizi yönetin.
          </blockquote>
        </div>
      </div>
    </div>
  );
}
