import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import LandingPage from "@/components/LandingPage";
import OlympLandingPage from "@/components/OlympLandingPage";
import CustomerRegisterPage from "@/components/CustomerRegisterPage";
import CustomerLoginPage from "@/components/CustomerLoginPage";
import CustomerAppShell from "@/components/CustomerAppShell";
import InstallAppBanner from "@/components/InstallAppBanner";
import AiSupportChat from "@/components/AiSupportChat";
import AdminPanel from "@/components/AdminPanel";
import InstrumentsPage from "@/pages/InstrumentsPage";
import AccountsPage from "@/pages/AccountsPage";
import PlatformsPage from "@/pages/PlatformsPage";
import EducationPage from "@/pages/EducationPage";
import ToolsPage from "@/pages/ToolsPage";
import AboutPage from "@/pages/AboutPage";
import ConditionsPage from "@/pages/ConditionsPage";
import CopyTradingPage from "@/pages/CopyTradingPage";
import PromotionsPage from "@/pages/PromotionsPage";
import PartnershipPage from "@/pages/PartnershipPage";
import SupportPage from "@/pages/SupportPage";
import { useTemplateAssets } from "@/hooks/useTemplateAssets";
import { disableTemplateAssets, initTemplatePlugins } from "@/lib/templateAssets";
import {
  clearCustomerSession,
  getCustomerSession,
  type CustomerSession,
} from "@/lib/customerAuth";
import {
  applyBrandTheme,
  brandLandingTheme,
  getBrandTheme,
  shouldForceAdminView,
} from "@/lib/brands";

type View = "site" | "auth" | "app" | "admin";
type AppTab = "home" | "trade" | "kyc" | "account";
type Page =
  | "home"
  | "olymp"
  | "instruments"
  | "accounts"
  | "platforms"
  | "education"
  | "tools"
  | "about"
  | "conditions"
  | "copy-trading"
  | "promotions"
  | "partnership"
  | "support";

function PageShell({ children }: { children: React.ReactNode }) {
  return <div className="page-inner tw-compat tw-scope">{children}</div>;
}

export default function App() {
  const [view, setView] = useState<View>(() => (shouldForceAdminView() ? "admin" : "site"));
  const [authMode, setAuthMode] = useState<"login" | "register">("register");
  const [appTab, setAppTab] = useState<AppTab>("home");
  const [session, setSession] = useState<CustomerSession | null>(() => getCustomerSession());
  const [page, setPage] = useState<Page>(() => {
    const hash = window.location.hash.replace(/^#\/?/, "");
    if (hash === "olymp") return "olymp";
    if (hash === "home2") return "home";
    return "home";
  });
  const brand = getBrandTheme();
  const needsTemplate =
    view === "site" && page !== "home" && page !== "olymp";
  const siteReady = useTemplateAssets(needsTemplate);

  useEffect(() => {
    applyBrandTheme();
  }, []);

  const openCustomerApp = (tab: AppTab = "home") => {
    window.scrollTo(0, 0);
    setAppTab(tab);
    setView("app");
    const hash =
      tab === "trade"
        ? "#/trade"
        : tab === "kyc"
          ? "#/kyc"
          : tab === "account"
            ? "#/account"
            : "#/app";
    window.history.replaceState(null, "", hash);
  };

  useEffect(() => {
    const syncHash = () => {
      const hash = window.location.hash.replace(/^#\/?/, "");
      if (hash === "olymp") {
        setPage("olymp");
        setView("site");
      } else if (hash === "home" || hash === "home2" || hash === "") {
        setPage("home");
        setView("site");
      } else if (hash === "login" || hash === "register") {
        setAuthMode(hash === "login" ? "login" : "register");
        setView("auth");
      } else if (
        hash === "trade" ||
        hash === "terminal" ||
        hash === "app" ||
        hash === "kyc" ||
        hash === "account"
      ) {
        const active = getCustomerSession();
        setSession(active);
        if (active) {
          const tab: AppTab =
            hash === "trade" || hash === "terminal"
              ? "trade"
              : hash === "kyc"
                ? "kyc"
                : hash === "account"
                  ? "account"
                  : "home";
          setAppTab(tab);
          setView("app");
        } else {
          setAuthMode("login");
          setView("auth");
          window.history.replaceState(null, "", "#/login");
        }
      }
    };
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  useEffect(() => {
    if (view !== "site" || !siteReady) return;
    if (page === "home" || page === "olymp") return;
    const t = window.setTimeout(() => initTemplatePlugins(), 120);
    return () => window.clearTimeout(t);
  }, [view, page, siteReady]);

  useEffect(() => {
    if (page === "home" || page === "olymp" || view === "auth" || view === "app") {
      disableTemplateAssets();
    }
  }, [page, view]);

  useEffect(() => {
    document.documentElement.setAttribute("data-bs-theme", "dark");
    document.documentElement.classList.remove("theme-tickmill", "theme-olymp", "theme-ubs");
    if (page === "olymp" || brand.id === "7fx") {
      document.documentElement.classList.add("theme-olymp");
    } else if (page === "home" || view === "auth" || view === "app" || brand.id === "ubs") {
      document.documentElement.classList.add("theme-ubs");
    } else {
      document.documentElement.classList.add("theme-tickmill");
    }
    applyBrandTheme();
  }, [page, view, brand.id]);

  useEffect(() => {
    if (view === "app" && !getCustomerSession()) {
      setSession(null);
      setAuthMode("register");
      setView("auth");
      window.history.replaceState(null, "", "#/register");
    }
  }, [view]);

  const openAuth = (mode: "login" | "register" = "register") => {
    window.scrollTo(0, 0);
    setAuthMode(mode);
    setView("auth");
    window.history.replaceState(null, "", mode === "login" ? "#/login" : "#/register");
  };

  /** Trade desk is customers-only. Guests are sent to registration. */
  const launchTerminal = () => {
    const active = getCustomerSession();
    setSession(active);
    if (!active) {
      openAuth("register");
      return;
    }
    openCustomerApp("trade");
  };

  const handleAuthSuccess = () => {
    setSession(getCustomerSession());
    openCustomerApp("home");
  };

  const handleLogout = () => {
    clearCustomerSession();
    setSession(null);
    openAuth("login");
  };

  const launchAdmin = () => {
    window.scrollTo(0, 0);
    setView("admin");
  };

  const navigate = (p: string) => {
    const next = (p === "home2" ? "home" : p) as Page;
    setPage(next);
    setView("site");
    if (next === "olymp" || next === "home") {
      window.history.replaceState(null, "", next === "home" ? "#" : `#/${next}`);
    }
    window.scrollTo(0, 0);
  };

  if (view === "auth") {
    const goBack = () => {
      setView("site");
      window.history.replaceState(null, "", "#");
    };
    if (authMode === "login") {
      return (
        <CustomerLoginPage
          onSuccess={handleAuthSuccess}
          onBack={goBack}
          onGoRegister={() => openAuth("register")}
        />
      );
    }
    return (
      <CustomerRegisterPage
        onSuccess={handleAuthSuccess}
        onBack={goBack}
        onGoLogin={() => openAuth("login")}
      />
    );
  }

  if (view === "app") {
    const active = session ?? getCustomerSession();
    if (!active) return null;
    return (
      <div id="tw-app" className="tw-app tw-scope min-h-[100dvh] bg-[#f4f4f6]">
        <CustomerAppShell
          key={`${active.id}-${appTab}`}
          session={active}
          initialTab={appTab}
          onLogout={handleLogout}
          onBackSite={() => {
            setView("site");
            window.history.replaceState(null, "", "#");
          }}
        />
      </div>
    );
  }

  if (view === "admin") {
    return (
      <div id="tw-app" className="tw-app tw-scope min-h-screen bg-black text-white">
        <AdminPanel onBack={() => setView("site")} />
      </div>
    );
  }

  if (page === "home") {
    return (
      <>
        <InstallAppBanner />
        <OlympLandingPage
          theme={brandLandingTheme(brand.id)}
          onLaunchTerminal={launchTerminal}
          onLogin={() => openAuth("login")}
          onRegister={() => openAuth("register")}
          onNavigate={navigate}
        />
        <AiSupportChat />
      </>
    );
  }

  if (page === "olymp") {
    return (
      <OlympLandingPage
        theme="olymp"
        onLaunchTerminal={launchTerminal}
        onNavigate={navigate}
        onBackHome={() => navigate("home")}
      />
    );
  }

  const renderPage = () => {
    switch (page) {
      case "instruments":
        return (
          <PageShell>
            <InstrumentsPage onLaunchTerminal={launchTerminal} />
          </PageShell>
        );
      case "accounts":
        return (
          <PageShell>
            <AccountsPage onLaunchTerminal={launchTerminal} />
          </PageShell>
        );
      case "platforms":
        return (
          <PageShell>
            <PlatformsPage onLaunchTerminal={launchTerminal} />
          </PageShell>
        );
      case "education":
        return (
          <PageShell>
            <EducationPage onLaunchTerminal={launchTerminal} />
          </PageShell>
        );
      case "tools":
        return (
          <PageShell>
            <ToolsPage onLaunchTerminal={launchTerminal} />
          </PageShell>
        );
      case "about":
        return (
          <PageShell>
            <AboutPage onLaunchTerminal={launchTerminal} />
          </PageShell>
        );
      case "conditions":
        return (
          <PageShell>
            <ConditionsPage onLaunchTerminal={launchTerminal} />
          </PageShell>
        );
      case "copy-trading":
        return (
          <PageShell>
            <CopyTradingPage onLaunchTerminal={launchTerminal} />
          </PageShell>
        );
      case "promotions":
        return (
          <PageShell>
            <PromotionsPage onLaunchTerminal={launchTerminal} />
          </PageShell>
        );
      case "partnership":
        return (
          <PageShell>
            <PartnershipPage onLaunchTerminal={launchTerminal} />
          </PageShell>
        );
      case "support":
        return (
          <PageShell>
            <SupportPage onLaunchTerminal={launchTerminal} />
          </PageShell>
        );
      default:
        return (
          <LandingPage
            onLaunchTerminal={launchTerminal}
            onNavigate={navigate}
            onLaunchAdmin={launchAdmin}
            onSwitchOlymp={() => navigate("olymp")}
          />
        );
    }
  };

  return (
    <Layout
      currentPage={page}
      onNavigate={navigate}
      onLaunchTerminal={launchTerminal}
      onLaunchAdmin={launchAdmin}
    >
      {renderPage()}
    </Layout>
  );
}
