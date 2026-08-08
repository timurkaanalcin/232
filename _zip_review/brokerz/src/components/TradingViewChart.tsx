import { useEffect, useRef, memo, useState } from "react";

interface Props {
  symbol: string;
  theme?: "dark" | "light";
  interval?: string;
}

const TV_INTERVALS: Record<string, string> = {
  M1: "1",
  M5: "5",
  M15: "15",
  M30: "30",
  H1: "60",
  H4: "240",
  D1: "D",
};

function TradingViewChartInner({ symbol, theme = "dark", interval = "5" }: Props) {
  // Host is DOM-only (iframe). Loading overlay is a sibling — never mix React children
  // inside the host that we clear, or React commitDeletion hits removeChild NotFoundError.
  const hostRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // #region agent log
    fetch("http://127.0.0.1:7592/ingest/abe513a0-761a-4a15-a754-72df22875d63", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "3c04c7" },
      body: JSON.stringify({
        sessionId: "3c04c7",
        location: "TradingViewChart.tsx:effect",
        message: "chart effect start",
        data: { symbol, interval, theme, hasHost: !!hostRef.current },
        hypothesisId: "E",
        timestamp: Date.now(),
        runId: "post-fix",
      }),
    }).catch(() => {});
    // #endregion

    const host = hostRef.current;
    if (!host) return;

    setLoaded(false);
    while (host.firstChild) host.removeChild(host.firstChild);

    const tvInterval = TV_INTERVALS[interval] ?? "5";

    const config = {
      autosize: true,
      symbol,
      interval: tvInterval,
      timezone: "Etc/UTC",
      theme,
      style: "1",
      locale: "en",
      enable_publishing: false,
      allow_symbol_change: true,
      calendar: false,
      hide_side_toolbar: false,
      details: false,
      hotlists: false,
      hide_volume: false,
      withdateranges: true,
      studies: ["STD;EMA", "STD;RSI"],
      support_host: "on",
      backgroundColor: "#131722",
      gridColor: "rgba(255,255,255,0.06)",
    };

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; overflow: hidden; background: #131722; }
    .tradingview-widget-container { width: 100%; height: 100%; }
    .tradingview-widget-container__widget { width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div class="tradingview-widget-container">
    <div class="tradingview-widget-container__widget"></div>
    <script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js" async>
      ${JSON.stringify(config)}
    </script>
  </div>
</body>
</html>`;

    const iframe = document.createElement("iframe");
    iframe.style.cssText = "width:100%;height:100%;border:none;display:block;";
    iframe.sandbox.add("allow-scripts", "allow-same-origin", "allow-popups", "allow-forms");
    iframe.title = "TradingView Chart";
    iframe.onload = () => setLoaded(true);
    iframe.srcdoc = html;
    host.appendChild(iframe);

    const fallback = setTimeout(() => setLoaded(true), 2500);
    return () => {
      clearTimeout(fallback);
      while (host.firstChild) host.removeChild(host.firstChild);
    };
  }, [symbol, theme, interval]);

  return (
    <div style={{ height: "100%", width: "100%", position: "relative", minHeight: "400px" }}>
      <div ref={hostRef} style={{ height: "100%", width: "100%" }} />
      {!loaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#131722]">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#00b67a]/25 border-t-[#00b67a]" />
            <span className="text-xs text-white/40">Loading chart…</span>
          </div>
        </div>
      )}
    </div>
  );
}

export const TradingViewChart = memo(TradingViewChartInner);
