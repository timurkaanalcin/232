import Link from "next/link";
import type { ReactNode } from "react";
import { LineChartIcon } from "lucide-react";
import { FinanceLogo } from "@/modules/finance/logo";

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
        <Link href="/" aria-label="borsahatti ana sayfa" className="w-fit">
          <FinanceLogo />
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

      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary via-[#174ea6] to-[#0b57d0] lg:block">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:28px_28px]" />
        <div className="relative flex h-full flex-col justify-end p-12 text-white">
          <LineChartIcon className="mb-6 size-12" />
          <blockquote className="text-2xl font-medium leading-snug">
            Piyasalar, haberler ve izleme listesi — özgün borsahatti panosu. İçerik admin panelinden yönetilir.
          </blockquote>
          <p className="mt-4 text-sm text-white/80">Yatırım tavsiyesi değildir · Google Finance kopyası değildir</p>
        </div>
      </div>
    </div>
  );
}
