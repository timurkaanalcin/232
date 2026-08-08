import type { ClosedTrade } from "@/types";

/** Client-side PDF via print-friendly HTML (no heavy deps) */
export function exportTradesPdf(trades: ClosedTrade[], accountLabel: string) {
  const rows = trades
    .slice(0, 500)
    .map(
      (t) => `<tr>
      <td>${t.symbol}</td>
      <td>${t.type}</td>
      <td>${t.volume}</td>
      <td>${t.openPrice}</td>
      <td>${t.closePrice}</td>
      <td style="color:${t.profit >= 0 ? "#16a34a" : "#e11d48"}">${t.profit.toFixed(2)}</td>
      <td>${new Date(t.closeTime).toLocaleString()}</td>
    </tr>`
    )
    .join("");

  const html = `<!doctype html><html><head><meta charset="utf-8"/><title>UBS Trade History</title>
  <style>
    body{font-family:system-ui,sans-serif;padding:24px;color:#111}
    h1{color:#E60000;margin:0 0 4px}
    table{width:100%;border-collapse:collapse;margin-top:16px;font-size:12px}
    th,td{border-bottom:1px solid #ddd;padding:8px;text-align:left}
    th{background:#f5f5f5}
  </style></head><body>
  <h1>UBS</h1>
  <div>${accountLabel}</div>
  <div style="color:#666;font-size:12px">${new Date().toLocaleString()} · ${trades.length} trades</div>
  <table><thead><tr>
    <th>Symbol</th><th>Side</th><th>Lots</th><th>Open</th><th>Close</th><th>P/L</th><th>Closed</th>
  </tr></thead><tbody>${rows || '<tr><td colspan="7">No trades</td></tr>'}</tbody></table>
  <script>window.onload=()=>setTimeout(()=>window.print(),200)</script>
  </body></html>`;

  const w = window.open("", "_blank", "noopener,noreferrer,width=900,height=700");
  if (!w) return false;
  w.document.write(html);
  w.document.close();
  return true;
}
