"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogOutIcon, MapPinIcon, RefreshCwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE_NAME } from "@/modules/marketing/news-articles";
import type { ReactNode } from "react";

export function AdminLocationShell({
  children,
  onRefresh,
  refreshing,
}: {
  children: ReactNode;
  onRefresh?: () => void;
  refreshing?: boolean;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="flex h-12 shrink-0 items-center justify-between border-b px-4">
        <Link href="/admin/map" className="flex items-center gap-2 text-sm font-semibold">
          <MapPinIcon className="size-4 text-amber-600" />
          {SITE_NAME} · Konum
        </Link>
        <div className="flex items-center gap-1">
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={onRefresh}
              disabled={refreshing}
            >
              <RefreshCwIcon className={`size-3.5 ${refreshing ? "animate-spin" : ""}`} />
              Yenile
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={() => void signOut({ callbackUrl: pathname })}
          >
            <LogOutIcon className="size-3.5" />
            Çıkış
          </Button>
        </div>
      </header>
      <main className="relative min-h-0 flex-1">{children}</main>
    </div>
  );
}
