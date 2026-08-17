import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  CandlestickChart,
  ChevronRight,
  Home,
  LogOut,
  Shield,
  User,
  Wallet,
} from "lucide-react";
import type { CustomerSession } from "@/lib/customerAuth";
import { getCustomerSession } from "@/lib/customerAuth";
import { getKyc, type KycStatus } from "@/lib/kyc";
import { ensureWelcomeNotif } from "@/lib/notifications";
import TradingTerminal from "@/components/TradingTerminal";
import KycVerification from "@/components/KycVerification";
import InstallAppBanner from "@/components/InstallAppBanner";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import NotificationBell from "@/components/NotificationBell";
import WithdrawPanel from "@/components/WithdrawPanel";
import ProfileExtras from "@/components/ProfileExtras";
import AiSupportChat from "@/components/AiSupportChat";
import { useMessages } from "@/lib/i18n";

type Tab = "home" | "trade" | "kyc" | "account";

interface Props {
  session: CustomerSession;
  initialTab?: Tab;
  onLogout: () => void;
  onBackSite: () => void;
}

export default function CustomerAppShell({
  session: initialSession,
  initialTab = "home",
  onLogout,
  onBackSite,
}: Props) {
  const m = useMessages();
  const [session, setSession] = useState(initialSession);
  const [tab, setTab] = useState<Tab>(initialTab);
  const kyc = useMemo(() => getKyc(session.id), [session.id, tab]);
  const kycText = m.kyc.labels[kyc.status as KycStatus] ?? m.kyc.labels.none;

  useEffect(() => {
    ensureWelcomeNotif(session.id);
  }, [session.id]);

  const syncBalance = () => {
    const fresh = getCustomerSession();
    if (fresh) setSession(fresh);
  };

  const go = (next: Tab) => {
    syncBalance();
    setTab(next);
    const hash =
      next === "trade"
        ? "#/trade"
        : next === "kyc"
          ? "#/kyc"
          : next === "account"
            ? "#/account"
            : "#/app";
    window.history.replaceState(null, "", hash);
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#f4f4f6] text-black antialiased">
      <InstallAppBanner />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {tab === "home" && (
          <HomeTab
            session={session}
            kycStatus={kyc.status}
            kycText={kycText}
            onTrade={() => go("trade")}
            onKyc={() => go("kyc")}
            onAccount={() => go("account")}
            onBackSite={onBackSite}
          />
        )}
        {tab === "trade" && (
          <div className="min-h-0 flex-1 overflow-hidden bg-[#140106]">
            <TradingTerminal
              session={session}
              compact
              onBack={() => go("home")}
              onLogout={onLogout}
              onOpenKyc={() => go("kyc")}
              onBalanceChange={syncBalance}
            />
          </div>
        )}
        {tab === "kyc" && (
          <div className="min-h-0 flex-1 overflow-y-auto">
            <KycVerification
              customerId={session.id}
              customerName={session.name}
              onBack={() => go("home")}
            />
          </div>
        )}
        {tab === "account" && (
          <AccountTab
            session={session}
            kycLabelText={kycText}
            onLogout={onLogout}
            onBack={() => go("home")}
            onBalanceChange={syncBalance}
          />
        )}
      </div>

      <nav className="safe-bottom sticky bottom-0 z-40 border-t border-black/8 bg-white/95 backdrop-blur">
        <div className="mx-auto grid max-w-[480px] grid-cols-4 px-1 py-1.5">
          <NavBtn active={tab === "home"} label={m.app.home} icon={<Home className="h-5 w-5" />} onClick={() => go("home")} />
          <NavBtn active={tab === "trade"} label={m.app.trade} icon={<CandlestickChart className="h-5 w-5" />} onClick={() => go("trade")} />
          <NavBtn active={tab === "kyc"} label={m.app.kyc} icon={<Shield className="h-5 w-5" />} onClick={() => go("kyc")} />
          <NavBtn active={tab === "account"} label={m.app.accountTab} icon={<User className="h-5 w-5" />} onClick={() => go("account")} />
        </div>
      </nav>

      <AiSupportChat />
    </div>
  );
}

function NavBtn({
  active,
  label,
  icon,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-[10px] font-semibold ${
        active ? "text-[#E60000]" : "text-black/45"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function HomeTab({
  session,
  kycStatus,
  kycText,
  onTrade,
  onKyc,
  onAccount,
  onBackSite,
}: {
  session: CustomerSession;
  kycStatus: string;
  kycText: string;
  onTrade: () => void;
  onKyc: () => void;
  onAccount: () => void;
  onBackSite: () => void;
}) {
  const m = useMessages();
  return (
    <div className="mx-auto w-full max-w-[480px] flex-1 overflow-y-auto pb-4">
      <header className="flex items-center justify-between gap-2 px-4 pb-2 pt-4">
        <button type="button" onClick={onBackSite} className="rounded-full p-2 text-black/50 hover:bg-black/5">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <img src="/ubs-logo.png" alt="UBS" className="h-8 object-contain" />
        <div className="flex items-center gap-0.5">
          <NotificationBell customerId={session.id} />
          <LanguageSwitcher tone="brand" compact />
          <button type="button" onClick={onAccount} className="rounded-full p-2 text-black/50 hover:bg-black/5">
            <User className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="px-4">
        <p className="text-[13px] text-black/50">{m.app.hello}</p>
        <h1 className="text-[22px] font-bold tracking-tight">{session.name || "Customer"}</h1>

        <div className="mt-4 rounded-3xl bg-gradient-to-br from-[#1a1a1a] to-[#3a0000] px-5 py-5 text-white shadow-lg">
          <div className="flex items-center gap-2 text-[12px] text-white/70">
            <Wallet className="h-3.5 w-3.5" />
            {m.app.balance}
          </div>
          <div className="mt-1 text-[32px] font-bold tabular-nums tracking-tight">
            ${Number(session.balance).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-3 text-[11px] text-white/55">
            {m.app.account} · {session.accountNumber}
          </div>
        </div>

        {kycStatus !== "approved" && (
          <button
            type="button"
            onClick={onKyc}
            className="mt-4 flex w-full items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-left"
          >
            <Shield className="h-5 w-5 shrink-0 text-amber-700" />
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-bold text-amber-900">{m.app.kycNeeded}</div>
              <div className="text-[11px] text-amber-800/80">{m.app.kycNeededSub}</div>
            </div>
            <ChevronRight className="h-4 w-4 text-amber-700" />
          </button>
        )}

        <div className="mt-5 grid grid-cols-2 gap-3">
          <Quick tile={m.app.tradeCta} sub={m.app.tradeSub} onClick={onTrade} tone="red" />
          <Quick tile={m.app.kyc} sub={kycText} onClick={onKyc} tone="dark" />
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-black/8 bg-white">
          <ActionRow icon={<BadgeCheck className="h-4 w-4" />} title={m.app.status} value={m.app.active} onClick={onAccount} />
          <ActionRow icon={<Shield className="h-4 w-4" />} title={m.app.verification} value={kycText} onClick={onKyc} />
          <ActionRow icon={<CandlestickChart className="h-4 w-4" />} title={m.app.tradeSub} value={m.app.open} onClick={onTrade} last />
        </div>
      </div>
    </div>
  );
}

function Quick({
  tile,
  sub,
  onClick,
  tone,
}: {
  tile: string;
  sub: string;
  onClick: () => void;
  tone: "red" | "dark";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl px-4 py-4 text-left ${
        tone === "red" ? "bg-[#E60000] text-white" : "bg-white text-black border border-black/8"
      }`}
    >
      <div className="text-[14px] font-bold">{tile}</div>
      <div className={`mt-0.5 text-[11px] ${tone === "red" ? "text-white/80" : "text-black/45"}`}>{sub}</div>
    </button>
  );
}

function ActionRow({
  icon,
  title,
  value,
  onClick,
  last,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  onClick: () => void;
  last?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-3.5 text-left ${last ? "" : "border-b border-black/6"}`}
    >
      <span className="text-[#E60000]">{icon}</span>
      <span className="flex-1 text-[13px] font-medium">{title}</span>
      <span className="text-[12px] text-black/45">{value}</span>
      <ChevronRight className="h-4 w-4 text-black/25" />
    </button>
  );
}

function AccountTab({
  session,
  kycLabelText,
  onLogout,
  onBack,
  onBalanceChange,
}: {
  session: CustomerSession;
  kycLabelText: string;
  onLogout: () => void;
  onBack: () => void;
  onBalanceChange: () => void;
}) {
  const m = useMessages();
  return (
    <div className="mx-auto w-full max-w-[480px] flex-1 overflow-y-auto px-4 pb-28 pt-4">
      <div className="mb-3 flex items-center justify-between">
        <button type="button" onClick={onBack} className="rounded-full p-2 hover:bg-black/5">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-1">
          <NotificationBell customerId={session.id} />
          <LanguageSwitcher tone="brand" compact />
        </div>
      </div>
      <h2 className="text-[20px] font-bold">{m.app.myAccount}</h2>
      <div className="mt-4 space-y-2 rounded-2xl border border-black/8 bg-white p-4 text-[13px]">
        <Info k={m.app.name} v={session.name} />
        <Info k={m.app.email} v={session.email} />
        <Info k={m.app.accountNo} v={session.accountNumber} />
        <Info k={m.app.kyc} v={kycLabelText} />
        <Info
          k={m.app.balance}
          v={`$${Number(session.balance).toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
        />
      </div>

      <WithdrawPanel
        customerId={session.id}
        email={session.email}
        balance={session.balance}
        onBalanceChange={() => onBalanceChange()}
      />

      <ProfileExtras customerId={session.id} email={session.email} name={session.name} />

      <button
        type="button"
        onClick={onLogout}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white py-3.5 text-[14px] font-semibold text-[#E60000]"
      >
        <LogOut className="h-4 w-4" />
        {m.app.logout}
      </button>
    </div>
  );
}

function Info({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-black/6 py-2 last:border-0">
      <span className="text-black/45">{k}</span>
      <span className="font-medium">{v}</span>
    </div>
  );
}
