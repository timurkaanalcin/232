"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ActivityIcon,
  ArrowLeftIcon,
  BarChart3Icon,
  BriefcaseBusinessIcon,
  CheckCircle2Icon,
  Loader2Icon,
  RefreshCwIcon,
  SearchIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  UserRoundIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { apiGet, apiPost, ClientApiError } from "@/lib/client-api";
import { CRM_STATUS_LABELS } from "@/lib/constants";
import type {
  TradeOrderType,
  TradeSide,
  TradingClientDTO,
  TradingSymbolDTO,
  TradingWorkspaceDTO,
} from "@/types";

function money(value: number, currency = "$"): string {
  return `${currency}${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function numberValue(value: number): string {
  return value.toLocaleString("en-US", { maximumFractionDigits: 4 });
}

function formatTime(value: number): string {
  return new Intl.DateTimeFormat("tr-TR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

function errorMessage(error: unknown): string {
  return error instanceof ClientApiError ? error.message : "İşlem tamamlanamadı";
}

function demoCandles(symbol: string): number[] {
  const seed = symbol.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return Array.from({ length: 42 }, (_, index) => {
    const wave = Math.sin((index + seed) / 3) * 22;
    const trend = index * 1.4;
    const jitter = ((seed + index * 17) % 19) - 9;
    return 80 + wave + trend + jitter;
  });
}

function ClientSummary({ client }: { client?: TradingClientDTO }) {
  if (!client) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-zinc-400">
        İşlem başlatmak için bir CRM client seçin.
      </div>
    );
  }

  return (
    <div className="grid gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300">
          <UserRoundIcon className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold text-white">{client.name}</p>
          <p className="truncate text-xs text-zinc-400">
            ID {client.clientNumericId || "-"} · {client.email}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <InfoPill label="Sale" value={CRM_STATUS_LABELS[client.saleStatus]} />
        <InfoPill label="Retention" value={CRM_STATUS_LABELS[client.retentionStatus]} />
        <InfoPill label="Kaynak" value={client.adSource || "-"} />
        <InfoPill label="Yönetici" value={client.managerName || "-"} />
      </div>
    </div>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-black/35 p-2">
      <p className="text-[10px] uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="truncate font-medium text-zinc-100">{value}</p>
    </div>
  );
}

function MarketChart({ symbol }: { symbol: TradingSymbolDTO }) {
  const candles = useMemo(() => demoCandles(symbol.symbol), [symbol.symbol]);
  const min = Math.min(...candles);
  const max = Math.max(...candles);

  return (
    <div className="relative min-h-[390px] overflow-hidden rounded-2xl border border-white/10 bg-black">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:42px_42px]" />
      <div className="relative z-10 flex items-center justify-between border-b border-white/10 p-4">
        <div>
          <p className="text-sm text-zinc-400">{symbol.symbol} · Broker fiyat ekranı</p>
          <h2 className="text-xl font-semibold text-white">{symbol.name}</h2>
        </div>
        <div className={symbol.change >= 0 ? "text-right text-emerald-400" : "text-right text-red-400"}>
          <p className="text-2xl font-semibold">{money(symbol.price)}</p>
          <p className="text-xs">{symbol.change >= 0 ? "+" : ""}{symbol.change.toFixed(2)}%</p>
        </div>
      </div>
      <div className="relative z-10 flex h-[300px] items-end gap-1 px-5 pb-6 pt-8">
        {candles.map((value, index) => {
          const height = 18 + ((value - min) / Math.max(1, max - min)) * 230;
          const up = index === 0 || value >= (candles[index - 1] ?? value);
          return (
            <div key={`${value}-${index}`} className="flex flex-1 items-end justify-center">
              <div
                className={up ? "w-full max-w-2 rounded-t bg-emerald-500" : "w-full max-w-2 rounded-t bg-red-500"}
                style={{ height }}
              />
            </div>
          );
        })}
      </div>
      <div className="absolute bottom-4 left-4 z-10 rounded bg-white/5 px-2 py-1 text-xs text-zinc-500">
        Fiyat sağlayıcı/broker entegrasyonu ile güncellenir
      </div>
    </div>
  );
}

export function TradingWorkspace({ initialClientId = "" }: { initialClientId?: string }) {
  const queryClient = useQueryClient();
  const [selectedClientId, setSelectedClientId] = useState(initialClientId);
  const [selectedSymbol, setSelectedSymbol] = useState("TCELL");
  const [side, setSide] = useState<TradeSide>("buy");
  const [orderType, setOrderType] = useState<TradeOrderType>("market");
  const [quantity, setQuantity] = useState("100");
  const [price, setPrice] = useState("107.50");
  const [clientSearch, setClientSearch] = useState("");

  const workspaceQuery = useQuery({
    queryKey: ["admin", "trading", selectedClientId],
    queryFn: () =>
      apiGet<{ workspace: TradingWorkspaceDTO }>(
        `/api/admin/trading${selectedClientId ? `?clientId=${selectedClientId}` : ""}`,
      ),
    refetchInterval: 15_000,
  });

  const workspace = workspaceQuery.data?.workspace;
  const symbols = workspace?.symbols ?? [];
  const selectedSymbolData = symbols.find((symbol) => symbol.symbol === selectedSymbol) ?? symbols[0];
  const clients = workspace?.clients ?? [];
  const selectedClient = clients.find((client) => client.id === selectedClientId) ?? clients[0];

  useEffect(() => {
    setSelectedClientId(initialClientId);
  }, [initialClientId]);

  useEffect(() => {
    if (!selectedClientId && clients[0]) setSelectedClientId(clients[0].id);
  }, [clients, selectedClientId]);

  useEffect(() => {
    if (selectedSymbolData) setPrice(String(selectedSymbolData.price));
  }, [selectedSymbolData]);

  const filteredClients = clients.filter((client) => {
    const query = clientSearch.trim().toLowerCase();
    if (!query) return true;
    return [client.name, client.email, client.clientNumericId, client.phone, client.adSource]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });

  const createOrder = useMutation({
    mutationFn: () =>
      apiPost("/api/admin/trading", {
        clientId: selectedClientId,
        symbol: selectedSymbol,
        market: selectedSymbolData?.market ?? "US",
        side,
        orderType,
        quantity: Number(quantity),
        price: Number(price),
      }),
    onSuccess: () => {
      toast.success("Emir işlendi", {
        description: `${selectedSymbol} ${side === "buy" ? "AL" : "SAT"} emri broker API'ye iletildi ve CRM'e kaydedildi.`,
      });
      void queryClient.invalidateQueries({ queryKey: ["admin", "trading"] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "crm", "overview"] });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const notional = Number(quantity || 0) * Number(price || 0);
  const canSubmit = Boolean(selectedClientId && selectedSymbol && Number(quantity) > 0 && Number(price) > 0);

  return (
    <div className="min-h-dvh bg-[#050607] text-zinc-100">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#08090b]/95 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild className="text-zinc-300 hover:text-white">
              <Link href="/admin/users">
                <ArrowLeftIcon /> CRM Panel
              </Link>
            </Button>
            <div>
              <h1 className="text-lg font-semibold">CRM Trading Terminal</h1>
              <p className="text-xs text-zinc-500">Client bağlantılı canlı broker işlem paneli</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-300">
              Canlı Broker Modu
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void queryClient.invalidateQueries({ queryKey: ["admin", "trading"] })}
              className="border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
            >
              <RefreshCwIcon /> Yenile
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 border-t border-white/10 md:grid-cols-5">
          <Metric label="Equity" value={money(workspace?.summary.equity ?? 10_000)} />
          <Metric label="Kullanılan teminat" value={money(workspace?.summary.usedMargin ?? 0)} />
          <Metric label="Kullanılabilir" value={money(workspace?.summary.availableMargin ?? 10_000)} />
          <Metric label="Açık pozisyon" value={String(workspace?.summary.openPositions ?? 0)} />
          <Metric
            label="Günlük P/L"
            value={money(workspace?.summary.dailyPnl ?? 0)}
            positive={(workspace?.summary.dailyPnl ?? 0) >= 0}
          />
        </div>
      </header>

      <main className="grid gap-3 p-3 xl:grid-cols-[300px_1fr_300px]">
        <aside className="grid gap-3">
          <div className="rounded-2xl border border-white/10 bg-[#0b0d10] p-3">
            <Label className="text-zinc-400">CRM Client</Label>
            <div className="relative mt-2">
              <SearchIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
              <Input
                value={clientSearch}
                onChange={(event) => setClientSearch(event.target.value)}
                placeholder="Client ara"
                className="border-white/10 bg-black/40 pl-8 text-white"
              />
            </div>
            <div className="mt-3 grid max-h-[320px] gap-2 overflow-y-auto">
              {workspaceQuery.isLoading ? (
                <>
                  <Skeleton className="h-14 bg-white/10" />
                  <Skeleton className="h-14 bg-white/10" />
                </>
              ) : filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => setSelectedClientId(client.id)}
                    className={`rounded-xl border p-3 text-left transition ${
                      selectedClientId === client.id
                        ? "border-emerald-500/60 bg-emerald-500/10"
                        : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                    }`}
                  >
                    <p className="truncate text-sm font-medium">{client.name}</p>
                    <p className="truncate text-xs text-zinc-500">ID {client.clientNumericId || "-"} · {client.adSource || "Kaynak yok"}</p>
                  </button>
                ))
              ) : (
                <p className="py-4 text-center text-sm text-zinc-500">Client bulunamadı.</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0b0d10] p-3">
            <Label className="text-zinc-400">Sembol listesi</Label>
            <div className="mt-3 grid gap-2">
              {symbols.map((symbol) => (
                <button
                  key={symbol.symbol}
                  onClick={() => setSelectedSymbol(symbol.symbol)}
                  className={`flex items-center justify-between rounded-xl border p-3 text-left transition ${
                    selectedSymbol === symbol.symbol
                      ? "border-primary/70 bg-primary/10"
                      : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                  }`}
                >
                  <div>
                    <p className="text-sm font-semibold">{symbol.symbol}</p>
                    <p className="text-xs text-zinc-500">{symbol.name}</p>
                  </div>
                  <div className={symbol.change >= 0 ? "text-right text-emerald-400" : "text-right text-red-400"}>
                    <p className="text-sm font-medium">{numberValue(symbol.price)}</p>
                    <p className="text-xs">{symbol.change >= 0 ? "+" : ""}{symbol.change.toFixed(2)}%</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <section className="grid gap-3">
          {selectedSymbolData ? <MarketChart symbol={selectedSymbolData} /> : <Skeleton className="h-[390px] bg-white/10" />}

          <div className="grid gap-3 xl:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-[#0b0d10]">
              <div className="flex items-center gap-2 border-b border-white/10 p-3">
                <BriefcaseBusinessIcon className="size-4 text-emerald-400" />
                <h2 className="font-semibold">Açık Pozisyonlar</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs text-zinc-500">
                    <tr className="border-b border-white/10">
                      <th className="px-3 py-2 text-left">Client</th>
                      <th className="px-3 py-2 text-left">Sembol</th>
                      <th className="px-3 py-2 text-right">Miktar</th>
                      <th className="px-3 py-2 text-right">Ort.</th>
                      <th className="px-3 py-2 text-right">P/L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workspace?.positions.length ? (
                      workspace.positions.map((position) => (
                        <tr key={`${position.clientId}-${position.symbol}`} className="border-b border-white/5">
                          <td className="px-3 py-2">{position.clientNumericId || position.clientName}</td>
                          <td className="px-3 py-2 font-medium">{position.symbol}</td>
                          <td className="px-3 py-2 text-right">{numberValue(position.quantity)}</td>
                          <td className="px-3 py-2 text-right">{numberValue(position.averagePrice)}</td>
                          <td className={position.unrealizedPnl >= 0 ? "px-3 py-2 text-right text-emerald-400" : "px-3 py-2 text-right text-red-400"}>
                            {money(position.unrealizedPnl)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-3 py-8 text-center text-zinc-500">
                          Henüz açık pozisyon yok.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0b0d10]">
              <div className="flex items-center gap-2 border-b border-white/10 p-3">
                <ActivityIcon className="size-4 text-primary" />
                <h2 className="font-semibold">Son Emirler</h2>
              </div>
              <div className="max-h-[280px] overflow-auto">
                {workspace?.orders.length ? (
                  workspace.orders.map((order) => (
                    <div key={order.id} className="grid grid-cols-[1fr_auto] gap-3 border-b border-white/5 p-3 text-sm">
                      <div>
                        <p className="font-medium">
                          {order.symbol} · {order.side === "buy" ? "AL" : "SAT"} · {order.clientNumericId || order.clientName}
                        </p>
                        <p className="text-xs text-zinc-500">{formatTime(order.createdAt)} · {order.actorEmail}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{money(order.notional)}</p>
                        <Badge variant={order.status === "filled" ? "success" : "destructive"}>{order.status}</Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="py-8 text-center text-sm text-zinc-500">Henüz emir yok.</p>
                )}
              </div>
            </div>
          </div>
        </section>

        <aside className="grid content-start gap-3">
          <ClientSummary client={selectedClient} />

          <div className="rounded-2xl border border-white/10 bg-[#0b0d10] p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">Emir Paneli</h2>
              <Badge variant="secondary" className="bg-white/10 text-zinc-300">Live</Badge>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => setSide("buy")}
                className={side === "buy" ? "bg-emerald-500 text-white hover:bg-emerald-600" : "bg-white/10 text-zinc-200 hover:bg-white/15"}
              >
                <TrendingUpIcon /> Alış
              </Button>
              <Button
                onClick={() => setSide("sell")}
                className={side === "sell" ? "bg-red-500 text-white hover:bg-red-600" : "bg-white/10 text-zinc-200 hover:bg-white/15"}
              >
                <TrendingDownIcon /> Satış
              </Button>
            </div>

            <div className="mt-4 grid gap-3">
              <div className="grid gap-2">
                <Label className="text-zinc-400">Emir tipi</Label>
                <Select value={orderType} onValueChange={(value) => setOrderType(value as TradeOrderType)}>
                  <SelectTrigger className="border-white/10 bg-black/40 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="market">Piyasa</SelectItem>
                    <SelectItem value="limit">Limit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label className="text-zinc-400">Fiyat</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.0001"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  className="border-white/10 bg-black/40 text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-zinc-400">Miktar</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  className="border-white/10 bg-black/40 text-white"
                />
              </div>
              <div className="rounded-xl bg-black/40 p-3 text-sm">
                <div className="flex justify-between text-zinc-400">
                  <span>Yaklaşık tutar</span>
                  <span className="font-medium text-white">{money(Number.isFinite(notional) ? notional : 0)}</span>
                </div>
              </div>
              <Button
                size="lg"
                disabled={!canSubmit || createOrder.isPending}
                onClick={() => createOrder.mutate()}
                className={side === "buy" ? "bg-emerald-500 text-white hover:bg-emerald-600" : "bg-red-500 text-white hover:bg-red-600"}
              >
                {createOrder.isPending ? <Loader2Icon className="animate-spin" /> : <CheckCircle2Icon />}
                {side === "buy" ? "Alış emrini gönder" : "Satış emrini gönder"}
              </Button>
              <p className="text-xs text-zinc-500">
                Emirler sadece canlı broker API anahtarları yapılandırıldığında gerçek borsaya/aracı kuruma iletilir.
              </p>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

function Metric({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="border-r border-white/10 px-4 py-2 last:border-r-0">
      <p className="text-[10px] uppercase tracking-wide text-zinc-500">{label}</p>
      <p className={positive === undefined ? "font-semibold text-white" : positive ? "font-semibold text-emerald-400" : "font-semibold text-red-400"}>
        {value}
      </p>
    </div>
  );
}
