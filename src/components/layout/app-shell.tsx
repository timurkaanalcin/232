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
  ScrollTextIcon,
  SettingsIcon,
  ShieldAlertIcon,
  ShieldIcon,
  SirenIcon,
  UsersIcon,
  WalletIcon,
  XIcon,
} from "lucide-react";
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
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/history", label: "History", icon: HistoryIcon },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];

const ADMIN_NAV: NavItem[] = [
  { href: "/admin", label: "Overview", icon: ActivityIcon, permission: "stats.view" },
  { href: "/admin/map", label: "Live Map", icon: MapIcon, permission: "map.live_view" },
  { href: "/admin/users", label: "Users", icon: UsersIcon, permission: "users.view" },
  { href: "/admin/audit", label: "Audit Logs", icon: ScrollTextIcon, permission: "audit.view" },
  { href: "/admin/security", label: "Security", icon: ShieldAlertIcon, permission: "audit.view" },
  { href: "/admin/risk", label: "Risk", icon: SirenIcon, permission: "risk.view" },
  { href: "/admin/wallets", label: "Wallets", icon: WalletIcon, permission: "wallets.view" },
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
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          active
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
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
          <div className="mt-5 mb-1 flex items-center gap-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <ShieldIcon className="size-3" /> Administration
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
            <SettingsIcon /> Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => void signOut({ callbackUrl: "/" })}>
          <LogOutIcon /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppShell({ user, children }: { user: ShellUser; children: ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Admin: sadece konum ekranı — sidebar yok
  if (pathname.startsWith("/admin")) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-dvh bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r bg-sidebar lg:flex">
        <div className="flex h-14 items-center px-5">
          <Link href="/dashboard" aria-label="LiveTrack home">
            <Logo />
          </Link>
        </div>
        <div className="flex flex-1 flex-col gap-1 overflow-y-auto py-3">
          <NavLinks user={user} />
        </div>
        <div className="border-t p-4 text-xs text-muted-foreground">
          Consent-first location sharing
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
          <button
            aria-label="Close menu"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col border-r bg-sidebar shadow-xl">
            <div className="flex h-14 items-center justify-between px-5">
              <Logo />
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <XIcon className="size-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto py-3">
              <NavLinks user={user} onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Main column */}
      <div className="flex min-h-dvh flex-col lg:pl-60">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <MenuIcon className="size-5" />
          </Button>
          <Link href="/dashboard" className="lg:hidden" aria-label="LiveTrack home">
            <Logo />
          </Link>
          <div className="ml-auto flex items-center gap-2">
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
