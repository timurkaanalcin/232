"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  ActivityIcon,
  LogOutIcon,
  MapIcon,
  RefreshCwIcon,
  ScrollTextIcon,
  ShieldAlertIcon,
  SirenIcon,
  UsersIcon,
  WalletIcon,
} from "lucide-react";
import { HudClock } from "@/components/layout/hud-clock";
import { Button } from "@/components/ui/button";
import { ROLE_PERMISSIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Permission, RoleId } from "@/types";
import type { ReactNode } from "react";

const OPS_NAV: { href: string; label: string; icon: typeof MapIcon; permission?: Permission }[] = [
  { href: "/admin", label: "Operasyon", icon: ActivityIcon, permission: "stats.view" },
  { href: "/admin/map", label: "Harita", icon: MapIcon, permission: "map.live_view" },
  { href: "/admin/users", label: "Kullanıcı", icon: UsersIcon, permission: "users.view" },
  { href: "/admin/audit", label: "Audit", icon: ScrollTextIcon, permission: "audit.view" },
  { href: "/admin/security", label: "Güvenlik", icon: ShieldAlertIcon, permission: "audit.view" },
  { href: "/admin/risk", label: "Risk", icon: SirenIcon, permission: "risk.view" },
  { href: "/admin/wallets", label: "Cüzdan", icon: WalletIcon, permission: "wallets.view" },
];

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
  const { data } = useSession();
  const role = (data?.user?.role ?? "user") as RoleId;
  const permissions = new Set(ROLE_PERMISSIONS[role] ?? []);
  const items = OPS_NAV.filter((item) => !item.permission || permissions.has(item.permission));

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="flex h-12 shrink-0 items-center gap-3 border-b border-primary/20 bg-sidebar/90 px-3 backdrop-blur">
        <Link
          href="/admin/map"
          className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-primary"
        >
          <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          Komuta · Konum
        </Link>
        <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
          {items.map((item) => {
            const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-sm px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors",
                  active ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <item.icon className="size-3" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <HudClock className="mr-2 hidden font-mono text-[11px] tabular-nums text-primary sm:block" />
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em]"
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
            className="h-8 gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em]"
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
