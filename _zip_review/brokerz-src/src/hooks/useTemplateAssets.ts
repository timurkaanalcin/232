import { useEffect, useState } from "react";
import {
  disableTemplateAssets,
  enableTemplateAssets,
  initTemplatePlugins,
} from "@/lib/templateAssets";

export function useTemplateAssets(enabled: boolean) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!enabled) {
      disableTemplateAssets();
      setReady(false);
      return;
    }

    const theme =
      (localStorage.getItem("theme") as "light" | "dark" | null) || "dark";

    enableTemplateAssets(theme).then(() => {
      if (cancelled) return;
      setReady(true);
      requestAnimationFrame(() => initTemplatePlugins());
    });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !ready) return;
    const t = window.setTimeout(() => initTemplatePlugins(), 100);
    return () => window.clearTimeout(t);
  }, [enabled, ready]);

  return ready;
}
