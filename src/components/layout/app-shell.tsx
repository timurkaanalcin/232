"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  ActivityIcon,
  HistoryIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MapIcon,
  MenuIcon,
  RadioIcon,
  ScrollTextIcon,
  SettingsIcon,
  ShieldAlertIcon,
  ShieldIcon,
  SirenIcon,
  UsersIcon,
  WalletIcon,
  XIcon,
} from "lucide-react";
import { HudClock } from "@/components/layout/hud-clock";
import { Logo } from "@/components/layout/logo";
import { NotificationCenter } from "@/components/layout/notification-center";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROLE_LABELS, ROLE_PERMISSIONS } from "@/lib/constants";
import { cn, initials } from "@/lib/utils";
import type { Permission, RoleId } from "@/types";

export interface ShellUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: RoleId;
}

interface NavItem {
  href: string;
  label: string;
  icon: typeof MapIcon;
  permission?: Permission;
}

const USER_NAV: NavItem[] = [
  { href: "/dashboard", label: "Komuta", icon: LayoutDashboardIcon },
  { href: "/history", label: "Geçmiş", icon: HistoryIcon },
  { href: "/settings", label: "Ayarlar", icon: SettingsIcon },
];

const ADMIN_NAV: NavItem[] = [
  { href: "/admin", label: "Operasyon", icon: ActivityIcon, permission: "stats.view" },
  { href: "/admin/map", label: "Canlı harita", icon: MapIcon, permission: "map.live_view" },
  { href: "/admin/sessions", label: "Oturumlar", icon: RadioIcon, permission: "sessions.view" },
  { href: "/admin/users", label: "Kullanıcılar", icon: UsersIcon, permission: "users.view" },
  { href: "/admin/audit", label: "Audit", icon: ScrollTextIcon, permission: "audit.view" },
  { href: "/admin/security", label: "Güvenlik", icon: ShieldAlertIcon, permission: "audit.view" },
  { href: "/admin/risk", label: "Risk", icon: SirenIcon, permission: "risk.view" },
  { href: "/admin/wallets", label: "Cüzdanlar", icon: WalletIcon, permission: "wallets.view" },
];

function NavLinks({ user, onNavigate }: { user: ShellUser; onNavigate?: () => void }) {
  const pathname = usePathname();
  const permissions = new Set(ROLE_PERMISSIONS[user.role] ?? []);
  const adminItems = ADMIN_NAV.filter((item) => !item.permission || permissions.has(item.permission));

  const renderItem = (item: NavItem) => {
    const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onNavigate}
        className={cn(
          "flex items-center gap-3 rounded-sm border border-transparent px-3 py-2 font-mono text-[12px] uppercase tracking-[0.12em] transition-colors",
          active
            ? "border-primary/30 bg-primary/15 text-primary"
            : "text-muted-foreground hover:border-primary/15 hover:bg-accent/60 hover:text-foreground",
        )}
      >
        <item.icon className="size-4 shrink-0" />
        {item.label}
      </Link>
    );
  };

  return (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {USER_NAV.map(renderItem)}
      {adminItems.length > 0 && (
        <>
          <div className="mt-5 mb-1 flex items-center gap-2 px-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/80">
            <ShieldIcon className="size-3" /> Operasyon
          </div>
          {adminItems.map(renderItem)}
        </>
      )}
    </nav>
  );
}

function UserMenu({ user }: { user: ShellUser }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full outline-none ring-ring focus-visible:ring-2 cursor-pointer">
          <Avatar>
            {user.image ? <AvatarImage src={user.image} alt={user.name} /> : null}
            <AvatarFallback>{initials(user.name)}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-0.5">
            <span className="truncate">{user.name}</span>
            <span className="truncate text-xs font-normal text-muted-foreground">{user.email}</span>
            <Badge variant="secondary" className="mt-1 w-fit">
              {ROLE_LABELS[user.role]}
            </Badge>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <SettingsIcon /> Ayarlar
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => void signOut({ callbackUrl: "/" })}>
          <LogOutIcon /> Çıkış
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppShell({ user, children }: { user: ShellUser; children: ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Fullscreen live map keeps its own HUD chrome.
  if (pathname.startsWith("/admin/map")) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-dvh bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-primary/15 bg-sidebar lg:flex">
        <div className="flex h-14 items-center border-b border-primary/10 px-5">
          <Link href="/dashboard" aria-label="CanlıSite ana sayfa">
            <Logo />
          </Link>
        </div>
        <div className="flex flex-1 flex-col gap-1 overflow-y-auto py-3">
          <NavLinks user={user} />
        </div>
        <div className="border-t border-primary/10 p-4 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          İzin temelli paylaşım
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
          <button
            aria-label="Menüyü kapat"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col border-r border-primary/15 bg-sidebar shadow-xl">
            <div className="flex h-14 items-center justify-between px-5">
              <Logo />
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} aria-label="Menüyü kapat">
                <XIcon className="size-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto py-3">
              <NavLinks user={user} onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        </div>
      )}

      <div className="flex min-h-dvh flex-col lg:pl-60">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-primary/15 bg-background/85 px-4 backdrop-blur sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Menüyü aç"
          >
            <MenuIcon className="size-5" />
          </Button>
          <Link href="/dashboard" className="lg:hidden" aria-label="CanlıSite ana sayfa">
            <Logo />
          </Link>
          <div className="hidden items-center gap-2 sm:flex">
            <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            <span className="hud-label">Sistem çevrimiçi</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <HudClock className="hidden font-mono text-xs tabular-nums text-primary sm:block" />
            <NotificationCenter />
            <ThemeToggle />
            <UserMenu user={user} />
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
