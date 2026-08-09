import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/layout/logo";
import {
  Building2Icon,
  Globe2Icon,
  LineChartIcon,
  LockKeyholeIcon,
  ShieldCheckIcon,
  TrendingUpIcon,
} from "lucide-react";

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
    <div className="min-h-dvh bg-[#070a0f] text-white">
      <div className="grid min-h-dvh lg:grid-cols-[0.92fr_1.08fr]">
        <div className="relative flex flex-col border-r border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_32%),linear-gradient(180deg,#0b111b,#070a0f)] px-6 py-8 sm:px-10">
          <div className="flex items-center justify-between">
            <Link href="/" aria-label="ALS Yatırım CRM home" className="w-fit">
              <Logo className="text-white" />
            </Link>
            <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
              Secure Login
            </span>
          </div>

          <div className="flex flex-1 items-center justify-center py-10">
            <div className="w-full max-w-md">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
                <LockKeyholeIcon className="size-3.5 text-emerald-300" />
                alsyatirim.login.org.tr
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur-xl sm:p-8">
                <div className="mb-7">
                  <h1 className="text-3xl font-semibold tracking-tight text-white">{title}</h1>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p>
                </div>
                {children}
                {footer && <div className="mt-6 text-center text-sm text-zinc-400">{footer}</div>}
              </div>
              <div className="mt-5 grid gap-2 text-xs text-zinc-500 sm:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <ShieldCheckIcon className="mb-2 size-4 text-emerald-300" />
                  SSL korumalı erişim
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <Globe2Icon className="mb-2 size-4 text-emerald-300" />
                  Bölgesel saat dilimi
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <Building2Icon className="mb-2 size-4 text-emerald-300" />
                  Şirket bazlı yetki
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative hidden overflow-hidden lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.18),transparent_28%),radial-gradient(circle_at_80%_70%,rgba(59,130,246,0.12),transparent_30%),linear-gradient(135deg,#080b12,#0d1420_45%,#05070b)]" />
          <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,0.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.7)_1px,transparent_1px)] [background-size:64px_64px]" />
          <div className="relative flex min-h-dvh flex-col justify-between p-10 xl:p-14">
            <div className="flex items-center justify-between text-sm text-zinc-400">
              <span>ALS Yatırım Operasyon Paneli</span>
              <span className="text-emerald-300">Live CRM</span>
            </div>

            <div className="grid gap-8">
              <div>
                <div className="mb-5 flex size-14 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-400/10 text-emerald-200">
                  <LineChartIcon className="size-7" />
                </div>
                <h2 className="max-w-xl text-5xl font-semibold tracking-tight text-white">
                  Profesyonel yatırım CRM ve trading operasyon merkezi.
                </h2>
                <p className="mt-5 max-w-lg text-base leading-7 text-zinc-400">
                  Shift şirketleri, Sale ve Retention ekipleri, client süreçleri, canlı broker bağlantısı ve
                  bölgesel takip saatleri tek güvenli panelde yönetilir.
                </p>
              </div>

              <div className="grid gap-4 xl:grid-cols-3">
                {[
                  ["Aktif Pipeline", "Sale / Retention"],
                  ["Broker Modu", "Live order gateway"],
                  ["Yetki Modeli", "Admin / Shift / Team"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur">
                    <p className="text-xs uppercase tracking-wider text-zinc-500">{label}</p>
                    <p className="mt-2 font-semibold text-white">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-zinc-400">Günlük operasyon görünümü</p>
                  <p className="mt-1 text-2xl font-semibold text-white">Client takipleri ve broker emirleri</p>
                </div>
                <TrendingUpIcon className="size-8 text-emerald-300" />
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-black/25 p-4">
                  <p className="text-2xl font-semibold text-emerald-300">24/7</p>
                  <p className="text-xs text-zinc-500">Güvenli erişim</p>
                </div>
                <div className="rounded-2xl bg-black/25 p-4">
                  <p className="text-2xl font-semibold text-white">6+</p>
                  <p className="text-xs text-zinc-500">Rol seviyesi</p>
                </div>
                <div className="rounded-2xl bg-black/25 p-4">
                  <p className="text-2xl font-semibold text-white">Live</p>
                  <p className="text-xs text-zinc-500">Broker-ready</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
