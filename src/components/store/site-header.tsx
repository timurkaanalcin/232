"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HeartIcon, MenuIcon, PhoneIcon, XIcon } from "lucide-react";
import { PistaLogo } from "@/components/store/logo";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/araclar", label: "Araç Al" },
  { href: "/sat", label: "Aracını Sat" },
  { href: "/nasil-calisir", label: "Nasıl Çalışır" },
  { href: "/finansman", label: "Finansman" },
  { href: "/garanti", label: "Garanti" },
  { href: "/merkezler", label: "Merkezler" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-[#0B1F3A] text-white/80">
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-4 text-xs">
          <p>240 puanlık ekspertiz · 14 gün iade · 12 ay garanti</p>
          <a href={BRAND.phoneHref} className="inline-flex items-center gap-1.5 hover:text-white">
            <PhoneIcon className="size-3.5" />
            {BRAND.phone}
          </a>
        </div>
      </div>
      <div className="border-b border-black/5 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
          <PistaLogo />
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full px-3 py-2 text-sm font-medium transition-colors",
                    active ? "bg-[#0B1F3A] text-white" : "text-slate-700 hover:bg-slate-100",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild className="hidden sm:inline-flex">
              <Link href="/favoriler" aria-label="Favoriler">
                <HeartIcon className="size-5" />
              </Link>
            </Button>
            <Button variant="outline" className="hidden sm:inline-flex" asChild>
              <Link href="/login">Giriş</Link>
            </Button>
            <Button className="bg-amber-500 text-[#0B1F3A] hover:bg-amber-400" asChild>
              <Link href="/sat">Ücretsiz değerle</Link>
            </Button>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen((v) => !v)}>
              {open ? <XIcon /> : <MenuIcon />}
            </Button>
          </div>
        </div>
        {open ? (
          <div className="border-t border-black/5 px-4 py-3 lg:hidden">
            <nav className="grid gap-1">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-100"
                >
                  {item.label}
                </Link>
              ))}
              <Link href="/favoriler" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm">
                Favoriler
              </Link>
              <Link href="/login" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm">
                Giriş / Kayıt
              </Link>
            </nav>
          </div>
        ) : null}
      </div>
    </header>
  );
}
