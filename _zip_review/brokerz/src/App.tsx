import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import LandingPage from "@/components/LandingPage";
import TradingTerminal from "@/components/TradingTerminal";
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
import { initTemplatePlugins } from "@/lib/templateAssets";

type View = "site" | "terminal" | "admin";
type Page =
  | "home"
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
  const [view, setView] = useState<View>("site");
  const [page, setPage] = useState<Page>("home");
  const siteReady = useTemplateAssets(view === "site");

  useEffect(() => {
    if (view !== "site" || !siteReady) return;
    const t = window.setTimeout(() => initTemplatePlugins(), 120);
    return () => window.clearTimeout(t);
  }, [view, page, siteReady]);

  const launchTerminal = () => {
    window.scrollTo(0, 0);
    setView("terminal");
  };

  const launchAdmin = () => {
    window.scrollTo(0, 0);
    setView("admin");
  };

  const navigate = (p: string) => {
    setPage(p as Page);
    window.scrollTo(0, 0);
  };

  if (view === "terminal") {
    return (
      <div id="tw-app" className="tw-app tw-scope min-h-screen bg-black text-white">
        <TradingTerminal onBack={() => setView("site")} />
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

  const renderPage = () => {
    switch (page) {
      case "home":
        return <LandingPage onLaunchTerminal={launchTerminal} onNavigate={navigate} />;
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
        return <LandingPage onLaunchTerminal={launchTerminal} onNavigate={navigate} />;
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
