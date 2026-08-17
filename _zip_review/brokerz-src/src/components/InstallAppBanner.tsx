import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";
import { useMessages } from "@/lib/i18n";

const DISMISS_KEY = "ubs_install_banner_dismissed_v1";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const mq = window.matchMedia("(display-mode: standalone)").matches;
  const ios = (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return mq || ios;
}

function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export default function InstallAppBanner() {
  const m = useMessages();
  const [hidden, setHidden] = useState(true);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHelp, setShowIosHelp] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    if (localStorage.getItem(DISMISS_KEY) === "1") return;
    setHidden(false);

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setHidden(false);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (hidden) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setHidden(true);
    setShowIosHelp(false);
  };

  const install = async () => {
    if (deferred) {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === "accepted") dismiss();
      setDeferred(null);
      return;
    }
    setShowIosHelp(true);
  };

  return (
    <div className="sticky top-0 z-[80] border-b border-black/8 bg-[#E60000] text-white shadow-sm">
      <div className="mx-auto flex max-w-[720px] items-center gap-3 px-3 py-2.5">
        <img src="/ubs-logo.png" alt="" className="h-9 w-9 rounded-xl bg-white object-contain p-1" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-semibold leading-tight">{m.install.title}</div>
          <div className="truncate text-[11px] text-white/85">{m.install.subtitle}</div>
        </div>
        <button
          type="button"
          onClick={install}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[12px] font-bold text-[#E60000]"
        >
          <Download className="h-3.5 w-3.5" />
          {m.install.cta}
        </button>
        <button
          type="button"
          aria-label="Close"
          onClick={dismiss}
          className="rounded-full p-1.5 text-white/80 hover:bg-white/15 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {showIosHelp && (
        <div className="border-t border-white/20 bg-[#b80000] px-4 py-3 text-[12px] leading-relaxed text-white/95">
          {isIos() ? (
            <p className="flex flex-wrap items-center gap-1">
              <Share className="inline h-3.5 w-3.5" />
              {m.install.iosHelp}
            </p>
          ) : (
            <p>{m.install.desktopHelp}</p>
          )}
          <button
            type="button"
            className="mt-2 text-[11px] font-semibold underline"
            onClick={() => setShowIosHelp(false)}
          >
            {m.install.gotIt}
          </button>
        </div>
      )}
    </div>
  );
}
