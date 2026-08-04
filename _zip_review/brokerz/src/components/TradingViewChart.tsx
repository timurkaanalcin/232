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
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    setLoaded(false);
    containerRef.current.innerHTML = "";

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
      backgroundColor: "#0a0a0a",
      gridColor: "rgba(255,255,255,0.05)",
    };

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; overflow: hidden; background: #0a0a0a; }
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

    iframe.onload = () => {
      setLoaded(true);
    };

    iframe.srcdoc = html;
    iframeRef.current = iframe;
    containerRef.current.appendChild(iframe);

    const fallback = setTimeout(() => setLoaded(true), 2500);
    return () => {
      clearTimeout(fallback);
      if (containerRef.current) containerRef.current.innerHTML = "";
      iframeRef.current = null;
    };
  }, [symbol, theme, interval]);

  return (
    <div
      ref={containerRef}
      style={{ height: "100%", width: "100%", position: "relative", minHeight: "400px" }}
    >
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a]">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-yellow-400/20 border-t-yellow-400" />
            <span className="text-xs text-white/40">Loading chart…</span>
          </div>
        </div>
      )}
    </div>
  );
}

export const TradingViewChart = memo(TradingViewChartInner);
