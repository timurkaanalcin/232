"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiDelete, apiGet, apiPost } from "@/lib/client-api";
import type { NewsDTO, QuoteDTO, VideoDTO } from "@/lib/finance/types";
import { SITE_NAME } from "@/modules/marketing/news-articles";

type Tab = "ozet" | "enstruman" | "haber" | "video";

export function FinanceCms() {
  const [tab, setTab] = useState<Tab>("ozet");
  const stats = useQuery({
    queryKey: ["admin", "finance", "stats"],
    queryFn: () =>
      apiGet<{ stats: { instruments: number; publishedNews: number; draftNews: number; videos: number; featured: number } }>(
        "/api/admin/finance/stats",
      ),
  });

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b bg-white dark:bg-background">
        <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-4 text-sm">
            <span className="font-semibold">{SITE_NAME} admin</span>
            <Link href="/admin/markets" className="text-primary">
              Piyasalar
            </Link>
            <Link href="/admin/map" className="text-muted-foreground hover:text-foreground">
              Konum
            </Link>
            <Link href="/admin/users" className="text-muted-foreground hover:text-foreground">
              Kullanıcılar
            </Link>
            <Link href="/" className="text-muted-foreground hover:text-foreground">
              Site
            </Link>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl gap-5 px-4 py-6">
        <div>
          <h1 className="text-2xl font-semibold">Piyasa içerik paneli</h1>
          <p className="text-sm text-muted-foreground">Enstrüman, haber ve video kayıtlarını buradan yönetin.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["ozet", "Özet"],
              ["enstruman", "Enstrümanlar"],
              ["haber", "Haberler"],
              ["video", "Videolar"],
            ] as const
          ).map(([id, label]) => (
            <Button key={id} variant={tab === id ? "default" : "outline"} size="sm" onClick={() => setTab(id)}>
              {label}
            </Button>
          ))}
        </div>
        {tab === "ozet" && stats.data ? (
          <div className="grid gap-3 sm:grid-cols-4">
            <Stat title="Enstrüman" value={stats.data.stats.instruments} />
            <Stat title="Öne çıkan" value={stats.data.stats.featured} />
            <Stat title="Yayında haber" value={stats.data.stats.publishedNews} />
            <Stat title="Video" value={stats.data.stats.videos} />
          </div>
        ) : null}
        {tab === "enstruman" ? <InstrumentAdmin /> : null}
        {tab === "haber" ? <NewsAdmin /> : null}
        {tab === "video" ? <VideoAdmin /> : null}
      </div>
    </div>
  );
}

function Stat({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-xl border bg-white p-4 dark:bg-card">
      <div className="text-xs text-muted-foreground">{title}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}

function InstrumentAdmin() {
  const query = useQuery({
    queryKey: ["admin", "finance", "instruments"],
    queryFn: () => apiGet<{ instruments: QuoteDTO[] }>("/api/admin/finance/instruments"),
  });
  const [form, setForm] = useState({
    id: "",
    symbol: "",
    name: "",
    nameTr: "",
    yahooSymbol: "",
    type: "stock",
    region: "us",
    exchange: "",
    currency: "USD",
    sector: "",
    descriptionTr: "",
    basePrice: "100",
    featured: false,
  });

  async function save() {
    await apiPost("/api/admin/finance/instruments", {
      ...form,
      basePrice: Number(form.basePrice),
    });
    toast.success("Enstrüman kaydedildi");
    void query.refetch();
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
      <form
        className="grid gap-2 rounded-xl border bg-white p-4 dark:bg-card"
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        <h2 className="font-semibold">Yeni / güncelle</h2>
        <Field label="ID" value={form.id} onChange={(v) => setForm({ ...form, id: v.toUpperCase() })} />
        <Field label="Sembol" value={form.symbol} onChange={(v) => setForm({ ...form, symbol: v })} />
        <Field label="Yahoo sembolü" value={form.yahooSymbol} onChange={(v) => setForm({ ...form, yahooSymbol: v })} />
        <Field label="Ad" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
        <Field label="Türkçe ad" value={form.nameTr} onChange={(v) => setForm({ ...form, nameTr: v })} />
        <Field label="Tür" value={form.type} onChange={(v) => setForm({ ...form, type: v })} />
        <Field label="Bölge" value={form.region} onChange={(v) => setForm({ ...form, region: v })} />
        <Field label="Borsa" value={form.exchange} onChange={(v) => setForm({ ...form, exchange: v })} />
        <Field label="Para birimi" value={form.currency} onChange={(v) => setForm({ ...form, currency: v })} />
        <Field label="Sektör" value={form.sector} onChange={(v) => setForm({ ...form, sector: v })} />
        <Field label="Baz fiyat" value={form.basePrice} onChange={(v) => setForm({ ...form, basePrice: v })} />
        <Label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => setForm({ ...form, featured: e.target.checked })}
          />
          Öne çıkar
        </Label>
        <Label>Açıklama</Label>
        <Textarea value={form.descriptionTr} onChange={(e) => setForm({ ...form, descriptionTr: e.target.value })} />
        <Button type="submit">Kaydet</Button>
      </form>
      <div className="overflow-x-auto rounded-xl border bg-white dark:bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs text-muted-foreground">
              <th className="p-3">ID</th>
              <th className="p-3">Ad</th>
              <th className="p-3">Tür</th>
              <th className="p-3">Fiyat</th>
            </tr>
          </thead>
          <tbody>
            {(query.data?.instruments ?? []).map((item) => (
              <tr key={item.instrumentId} className="border-b last:border-0">
                <td className="p-3 font-medium">{item.instrumentId}</td>
                <td className="p-3">{item.nameTr}</td>
                <td className="p-3">{item.type}</td>
                <td className="p-3 tabular-nums">{item.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function NewsAdmin() {
  const query = useQuery({
    queryKey: ["admin", "finance", "news"],
    queryFn: () => apiGet<{ news: NewsDTO[] }>("/api/admin/finance/news"),
  });
  const [form, setForm] = useState({
    title: "",
    slug: "",
    category: "Borsa",
    summary: "",
    body: "",
    author: "borsahatti Editörü",
    imageUrl: "",
    ticker: "",
    breaking: false,
    featured: true,
    published: true,
  });

  async function save() {
    await apiPost("/api/admin/finance/news", form);
    toast.success("Haber kaydedildi");
    void query.refetch();
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[420px_1fr]">
      <form
        className="grid gap-2 rounded-xl border bg-white p-4 dark:bg-card"
        onSubmit={(e) => {
          e.preventDefault();
          void save();
        }}
      >
        <h2 className="font-semibold">Haber yaz</h2>
        <Field label="Başlık" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
        <Field label="Slug" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} />
        <Field label="Kategori" value={form.category} onChange={(v) => setForm({ ...form, category: v })} />
        <Field label="Ticker" value={form.ticker} onChange={(v) => setForm({ ...form, ticker: v })} />
        <Field label="Görsel URL" value={form.imageUrl} onChange={(v) => setForm({ ...form, imageUrl: v })} />
        <Field label="Yazar" value={form.author} onChange={(v) => setForm({ ...form, author: v })} />
        <Label>Özet</Label>
        <Textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
        <Label>Metin</Label>
        <Textarea className="min-h-40" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
        <Label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
          Yayında
        </Label>
        <Button type="submit">Yayınla</Button>
      </form>
      <div className="grid gap-2">
        {(query.data?.news ?? []).map((item) => (
          <div key={item.id} className="flex items-start justify-between gap-3 rounded-xl border bg-white p-3 dark:bg-card">
            <div>
              <div className="text-xs text-muted-foreground">{item.category}</div>
              <div className="font-medium">{item.title}</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                void apiDelete(`/api/admin/finance/news?id=${item.id}`).then(() => {
                  toast.success("Silindi");
                  void query.refetch();
                });
              }}
            >
              Sil
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function VideoAdmin() {
  const query = useQuery({
    queryKey: ["admin", "finance", "videos"],
    queryFn: () => apiGet<{ videos: VideoDTO[] }>("/api/admin/finance/videos"),
  });
  const [form, setForm] = useState({
    title: "",
    youtubeId: "",
    channel: "borsahatti TV",
    duration: "",
    category: "Piyasa",
    featured: false,
    published: true,
  });

  return (
    <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
      <form
        className="grid gap-2 rounded-xl border bg-white p-4 dark:bg-card"
        onSubmit={(e) => {
          e.preventDefault();
          void apiPost("/api/admin/finance/videos", form).then(() => {
            toast.success("Video kaydedildi");
            void query.refetch();
          });
        }}
      >
        <h2 className="font-semibold">Video ekle</h2>
        <Field label="Başlık" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
        <Field label="YouTube ID" value={form.youtubeId} onChange={(v) => setForm({ ...form, youtubeId: v })} />
        <Field label="Kanal" value={form.channel} onChange={(v) => setForm({ ...form, channel: v })} />
        <Field label="Süre" value={form.duration} onChange={(v) => setForm({ ...form, duration: v })} />
        <Button type="submit">Kaydet</Button>
      </form>
      <div className="grid gap-2">
        {(query.data?.videos ?? []).map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded-xl border bg-white p-3 dark:bg-card">
            <div>
              <div className="font-medium">{item.title}</div>
              <div className="text-xs text-muted-foreground">{item.youtubeId}</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                void apiDelete(`/api/admin/finance/videos?id=${item.id}`).then(() => {
                  toast.success("Silindi");
                  void query.refetch();
                });
              }}
            >
              Sil
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="grid gap-1">
      <Label>{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
