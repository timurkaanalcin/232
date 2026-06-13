"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeftIcon,
  BadgeDollarSignIcon,
  BriefcaseBusinessIcon,
  ClipboardListIcon,
  CopyIcon,
  CreditCardIcon,
  FileTextIcon,
  MailIcon,
  MessageSquareIcon,
  PhoneIcon,
  PlusIcon,
  SaveIcon,
  SendIcon,
  TrendingUpIcon,
  UploadIcon,
  UserIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiGet, apiPatch, apiPost, ClientApiError } from "@/lib/client-api";
import { CRM_STATUS_LABELS, ROLE_LABELS, requiresStatusSchedule } from "@/lib/constants";
import { formatRelative } from "@/lib/utils";
import type { ClientDetailDTO, CrmStatus, RetentionStatus } from "@/types";

const CRM_STATUSES: CrmStatus[] = [
  "new",
  "no_answer",
  "call_back",
  "not_interested",
  "low_potential",
  "potential",
  "recovery",
  "active",
  "wrong_number",
  "wrong_person",
  "referral",
  "test",
  "renew",
  "depositor",
  "trash",
  "never_answer",
];

const NO_MANAGER_VALUE = "__none__";

function errorMessage(error: unknown): string {
  return error instanceof ClientApiError ? error.message : "İşlem tamamlanamadı";
}

function toDateTimeInputValue(value: number | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function fromDateTimeInputValue(value: string): number | null {
  if (!value) return null;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : time;
}

function money(value: number, currency = "$"): string {
  return `${currency}${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function ClientDetail({ clientId }: { clientId: string }) {
  const queryClient = useQueryClient();
  const [extraInfo, setExtraInfo] = useState("");
  const [comment, setComment] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [managerId, setManagerId] = useState(NO_MANAGER_VALUE);
  const [saleStatus, setSaleStatus] = useState<CrmStatus>("new");
  const [saleScheduledAt, setSaleScheduledAt] = useState("");
  const [retentionStatus, setRetentionStatus] = useState<RetentionStatus>("new");
  const [retentionScheduledAt, setRetentionScheduledAt] = useState("");
  const [adSource, setAdSource] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountType, setAccountType] = useState<"live" | "demo">("live");
  const [accountCurrency, setAccountCurrency] = useState("USD");
  const [txType, setTxType] = useState("deposit");
  const [txAmount, setTxAmount] = useState("1000");
  const [txCurrency, setTxCurrency] = useState("USD");
  const [txMethod, setTxMethod] = useState("Banka Havalesi");
  const [txStatus, setTxStatus] = useState("pending");
  const [txReference, setTxReference] = useState("TXN-001");
  const [txNote, setTxNote] = useState("");
  const [documentTitle, setDocumentTitle] = useState("KYC");
  const [documentType, setDocumentType] = useState("verification");
  const [documentUrl, setDocumentUrl] = useState("");

  const detailQuery = useQuery({
    queryKey: ["admin", "client-detail", clientId],
    queryFn: () => apiGet<{ detail: ClientDetailDTO }>(`/api/admin/clients/${clientId}`),
  });

  const detail = detailQuery.data?.detail;
  const client = detail?.user;

  useEffect(() => {
    if (!detail) return;
    setName(detail.user.name);
    setPhone(detail.user.phone);
    setAddress(detail.user.address);
    setDateOfBirth(detail.user.dateOfBirth);
    setExtraInfo(detail.extraInfo);
    setManagerId(detail.user.managerId ?? NO_MANAGER_VALUE);
    setSaleStatus(detail.user.saleStatus);
    setSaleScheduledAt(toDateTimeInputValue(detail.user.saleStatusScheduledAt));
    setRetentionStatus(detail.user.retentionStatus);
    setRetentionScheduledAt(toDateTimeInputValue(detail.user.retentionStatusScheduledAt));
    setAdSource(detail.user.adSource);
  }, [detail]);

  const saveDetail = useMutation({
    mutationFn: () =>
      apiPatch(`/api/admin/clients/${clientId}`, {
        extraInfo,
        name,
        phone,
        address,
        dateOfBirth,
        managerId: managerId === NO_MANAGER_VALUE ? null : managerId,
        saleStatus,
        saleStatusScheduledAt: fromDateTimeInputValue(saleScheduledAt),
        retentionStatus,
        retentionStatusScheduledAt: fromDateTimeInputValue(retentionScheduledAt),
        adSource,
      }),
    onSuccess: () => {
      toast.success("Client güncellendi");
      void queryClient.invalidateQueries({ queryKey: ["admin", "client-detail", clientId] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "crm", "overview"] });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const addComment = useMutation({
    mutationFn: () => apiPost(`/api/admin/clients/${clientId}`, { body: comment }),
    onSuccess: () => {
      toast.success("Yorum eklendi");
      setComment("");
      void queryClient.invalidateQueries({ queryKey: ["admin", "client-detail", clientId] });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const sendSupportMessage = useMutation({
    mutationFn: () => apiPost(`/api/admin/clients/${clientId}?action=support`, { body: supportMessage }),
    onSuccess: () => {
      toast.success("Destek mesajı gönderildi");
      setSupportMessage("");
      void queryClient.invalidateQueries({ queryKey: ["admin", "client-detail", clientId] });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const addTradeAccount = useMutation({
    mutationFn: () =>
      apiPost(`/api/admin/clients/${clientId}?action=trade-account`, {
        accountNo,
        name: accountName,
        accountType,
        currency: accountCurrency,
      }),
    onSuccess: () => {
      toast.success("Ticaret hesabı eklendi");
      setAccountNo("");
      setAccountName("");
      void queryClient.invalidateQueries({ queryKey: ["admin", "client-detail", clientId] });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const addMoneyTransaction = useMutation({
    mutationFn: () =>
      apiPost(`/api/admin/clients/${clientId}?action=money`, {
        txType,
        amount: Number(txAmount),
        currency: txCurrency,
        method: txMethod,
        txStatus,
        referenceNo: txReference,
        note: txNote,
      }),
    onSuccess: () => {
      toast.success("Para işlemi eklendi");
      setTxNote("");
      void queryClient.invalidateQueries({ queryKey: ["admin", "client-detail", clientId] });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const addDocument = useMutation({
    mutationFn: () =>
      apiPost(`/api/admin/clients/${clientId}?action=document`, {
        title: documentTitle,
        documentType,
        fileUrl: documentUrl,
      }),
    onSuccess: () => {
      toast.success("Belge kaydı eklendi");
      setDocumentTitle("KYC");
      setDocumentUrl("");
      void queryClient.invalidateQueries({ queryKey: ["admin", "client-detail", clientId] });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const saleScheduleMissing = requiresStatusSchedule(saleStatus) && !saleScheduledAt;
  const retentionScheduleMissing = requiresStatusSchedule(retentionStatus) && !retentionScheduledAt;

  if (detailQuery.isLoading) {
    return (
      <div className="min-h-dvh bg-muted/30 p-4">
        <div className="mx-auto grid max-w-7xl gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!client || !detail) {
    return (
      <div className="grid min-h-dvh place-items-center bg-muted/30 p-6">
        <Card className="max-w-md">
          <CardContent className="grid gap-4 p-6 text-center">
            <p className="font-semibold">Client bulunamadı</p>
            <Button asChild>
              <Link href="/admin/users">CRM paneline dön</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-muted/30 p-3 sm:p-4">
      <div className="mx-auto grid max-w-7xl gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/users">
              <ArrowLeftIcon /> Client listesi
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/trading?clientId=${client.id}`}>
              <TrendingUpIcon /> Trading terminal
            </Link>
          </Button>
        </div>

        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-6 p-5">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{client.name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                <span className="font-medium text-red-500">ID #{client.clientNumericId || "-"}</span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  {CRM_STATUS_LABELS[client.saleStatus]}
                </Badge>
                <Badge variant="secondary">{client.adSource || "Kaynak yok"}</Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
              <HeaderMetric label="Kayıt tarihi" value={new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium" }).format(new Date(client.createdAt))} />
              <HeaderMetric label="Son işlem" value={client.tradingSummary.lastTradeAt ? formatRelative(client.tradingSummary.lastTradeAt) : "-"} />
              <HeaderMetric label="Bakiye" value={money(client.tradingSummary.totalNotional)} positive />
              <HeaderMetric label="Pozisyon" value={String(client.tradingSummary.openPositions)} />
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="overflow-x-auto">
          <TabsList className="bg-background">
            <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
            <TabsTrigger value="contact">İletişim</TabsTrigger>
            <TabsTrigger value="personal">Kişisel Bilgiler</TabsTrigger>
            <TabsTrigger value="trading">Ticaret Hesapları</TabsTrigger>
            <TabsTrigger value="positions">Pozisyonlar</TabsTrigger>
            <TabsTrigger value="money">Para İşlemleri</TabsTrigger>
            <TabsTrigger value="docs">Belgeler</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <PhoneIcon className="size-4 text-muted-foreground" /> İletişim Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <InfoBlock label="Telefon numarası" value={client.phone || "-"} />
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <PhoneIcon /> Çağrı
              </Button>
              <InfoBlock label="E-posta adresi" value={client.email} />
              <Button variant="outline">
                <MailIcon /> Gönder
              </Button>
              <InfoBlock label="Şifre" value="••••••••" icon={<CopyIcon className="size-3.5 text-muted-foreground" />} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ClipboardListIcon className="size-4 text-muted-foreground" /> Durum Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label>Reklam Kaynağı</Label>
                <Input value={adSource} onChange={(event) => setAdSource(event.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Sale Statüsü</Label>
                <Select value={saleStatus} onValueChange={(value) => setSaleStatus(value as CrmStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CRM_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {CRM_STATUS_LABELS[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {requiresStatusSchedule(saleStatus) ? (
                <div className="grid gap-2">
                  <Label>Sale tarih ve saat</Label>
                  <Input type="datetime-local" value={saleScheduledAt} onChange={(event) => setSaleScheduledAt(event.target.value)} />
                </div>
              ) : null}
              <div className="rounded-lg border p-3 text-sm">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    {CRM_STATUS_LABELS[client.saleStatus]}
                  </Badge>
                  <span className="text-xs text-muted-foreground">Değiştir ↗</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <UserIcon className="size-4 text-muted-foreground" /> Yönetim
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label>Yönetici</Label>
                <Select value={managerId} onValueChange={setManagerId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_MANAGER_VALUE}>Yönetici yok</SelectItem>
                    {detail.managers.map((manager) => (
                      <SelectItem key={manager.id} value={manager.id}>
                        {manager.name} - {ROLE_LABELS[manager.role]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Doğrulama</Label>
                <Select defaultValue="pending">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Beklemede</SelectItem>
                    <SelectItem value="verified">Doğrulandı</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Retention Statüsü</Label>
                <Select value={retentionStatus} onValueChange={(value) => setRetentionStatus(value as RetentionStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CRM_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {CRM_STATUS_LABELS[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {requiresStatusSchedule(retentionStatus) ? (
                <div className="grid gap-2">
                  <Label>Retention tarih ve saat</Label>
                  <Input
                    type="datetime-local"
                    value={retentionScheduledAt}
                    onChange={(event) => setRetentionScheduledAt(event.target.value)}
                  />
                </div>
              ) : null}
              <Button
                className="bg-amber-500 hover:bg-amber-600"
                onClick={() => saveDetail.mutate()}
                disabled={saveDetail.isPending || saleScheduleMissing || retentionScheduleMissing}
              >
                <SaveIcon /> Kaydet
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-[0.9fr_2fr]">
          <Card>
            <CardHeader>
              <CardTitle className="border-l-4 border-amber-500 pl-3 text-base">Ek Bilgi</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <textarea
                value={extraInfo}
                onChange={(event) => setExtraInfo(event.target.value)}
                className="min-h-44 rounded-lg border bg-background p-3 text-sm outline-none ring-ring focus:ring-2"
                placeholder="Client hakkında ek bilgiler..."
              />
              <Button className="w-fit bg-amber-500 hover:bg-amber-600" onClick={() => saveDetail.mutate()} disabled={saveDetail.isPending}>
                Güncelle
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="border-l-4 border-amber-500 pl-3 text-base">İletişim</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                className="min-h-20 rounded-lg border bg-background p-3 text-sm outline-none ring-ring focus:ring-2"
                placeholder="Yorumu buraya girin..."
              />
              <Button
                className="w-fit bg-amber-300 text-amber-950 hover:bg-amber-400"
                disabled={addComment.isPending || !comment.trim()}
                onClick={() => addComment.mutate()}
              >
                <SendIcon /> Yeni yorum ekle
              </Button>
              {detail.comments.length > 0 ? (
                <div className="grid gap-3">
                  {detail.comments.map((item) => (
                    <div key={item.id} className="rounded-lg border bg-muted/30 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-medium">{item.authorName || item.authorEmail}</p>
                        <span className="text-xs text-muted-foreground">{formatRelative(item.createdAt)}</span>
                      </div>
                      <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{item.body}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid place-items-center gap-2 py-10 text-center text-sm text-muted-foreground">
                  <MessageSquareIcon className="size-8" />
                  <p>Henüz iletişim kaydı yok</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <SmallModule icon={BriefcaseBusinessIcon} title="Ticaret Hesapları" value={`${client.tradingSummary.orderCount} emir`} />
          <SmallModule icon={TrendingUpIcon} title="Pozisyonlar" value={`${client.tradingSummary.openPositions} açık`} />
          <SmallModule icon={BadgeDollarSignIcon} title="Para İşlemleri" value={money(client.tradingSummary.totalNotional)} />
          <SmallModule icon={FileTextIcon} title="Belgeler" value={`${detail.documents.length} belge`} />
        </div>

        {activeTab === "personal" ? (
          <Card>
            <CardHeader>
              <CardTitle className="border-l-4 border-amber-500 pl-3 text-base">Kişisel Bilgiler</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5 md:grid-cols-3">
              <div className="grid gap-2">
                <Label>Ad Soyad</Label>
                <Input value={name} onChange={(event) => setName(event.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>E-posta</Label>
                <Input value={client.email} disabled />
              </div>
              <div className="grid gap-2">
                <Label>Telefon</Label>
                <Input value={phone} onChange={(event) => setPhone(event.target.value)} />
              </div>
              <div className="grid gap-2 md:col-span-2">
                <Label>Adres</Label>
                <Input value={address} onChange={(event) => setAddress(event.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Doğum Tarihi</Label>
                <Input type="date" value={dateOfBirth} onChange={(event) => setDateOfBirth(event.target.value)} />
              </div>
              <div className="md:col-span-3">
                <Button className="bg-amber-500 hover:bg-amber-600" onClick={() => saveDetail.mutate()} disabled={saveDetail.isPending}>
                  <SaveIcon /> Güncelle
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {activeTab === "trading" ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="border-l-4 border-amber-500 pl-3 text-base">Ticaret Hesapları</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="grid gap-5">
              <div className="grid gap-3 md:grid-cols-4">
                <Input placeholder="Hesap Numarası *" value={accountNo} onChange={(event) => setAccountNo(event.target.value)} />
                <Input placeholder="Hesap Adı" value={accountName} onChange={(event) => setAccountName(event.target.value)} />
                <Select value={accountType} onValueChange={(value) => setAccountType(value as "live" | "demo")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="live">Live</SelectItem>
                    <SelectItem value="demo">Demo</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={accountCurrency} onValueChange={setAccountCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="TRY">TRY</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="w-fit" disabled={addTradeAccount.isPending || !accountNo.trim()} onClick={() => addTradeAccount.mutate()}>
                  <PlusIcon /> Yeni hesap aç
                </Button>
              </div>
              <ModuleTable
                empty="Henüz ticaret hesabı yok"
                headers={["Hesap", "İsim", "Tip", "Bakiye", "Kredi", "Durum"]}
                rows={detail.tradeAccounts.map((account) => [
                  account.accountNo,
                  account.name || "-",
                  account.accountType === "live" ? "Live" : "Demo",
                  `${money(account.balance, "")} ${account.currency}`,
                  `${money(account.credit, "")} ${account.currency}`,
                  account.status === "active" ? "Aktif" : "Pasif",
                ])}
              />
            </CardContent>
          </Card>
        ) : null}

        {activeTab === "positions" ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="border-l-4 border-amber-500 pl-3 text-base">Pozisyonlar</CardTitle>
                <Button asChild className="bg-amber-500 hover:bg-amber-600">
                  <Link href={`/admin/trading?clientId=${client.id}`}>
                    <PlusIcon /> Yeni Pozisyon
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6 flex flex-wrap gap-5 text-sm">
                <span>Açık: <b className="text-emerald-600">{money(client.tradingSummary.totalNotional)}</b></span>
                <span>Kapalı: <b className="text-emerald-600">$0.00</b></span>
                <span>Toplam: {client.tradingSummary.openPositions} pozisyon</span>
              </div>
              <div className="grid place-items-center py-12 text-sm text-muted-foreground">
                Pozisyon detayları trading terminalde canlı hesaplanır.
              </div>
            </CardContent>
          </Card>
        ) : null}

        {activeTab === "money" ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="border-l-4 border-amber-500 pl-3 text-base">Para İşlemleri</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="grid gap-5">
              <div className="grid gap-3 md:grid-cols-3">
                <Select value={txType} onValueChange={setTxType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deposit">Yatırım</SelectItem>
                    <SelectItem value="withdrawal">Çekim</SelectItem>
                    <SelectItem value="bonus">Bonus</SelectItem>
                    <SelectItem value="commission">Komisyon</SelectItem>
                    <SelectItem value="swap">Swap</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                  </SelectContent>
                </Select>
                <Input type="number" value={txAmount} onChange={(event) => setTxAmount(event.target.value)} placeholder="Miktar" />
                <Select value={txCurrency} onValueChange={setTxCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="TRY">TRY</SelectItem>
                  </SelectContent>
                </Select>
                <Input value={txMethod} onChange={(event) => setTxMethod(event.target.value)} placeholder="Yöntem" />
                <Select value={txStatus} onValueChange={setTxStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Beklemede</SelectItem>
                    <SelectItem value="approved">Onaylandı</SelectItem>
                    <SelectItem value="rejected">Reddedildi</SelectItem>
                  </SelectContent>
                </Select>
                <Input value={txReference} onChange={(event) => setTxReference(event.target.value)} placeholder="Referans No" />
                <Input className="md:col-span-2" value={txNote} onChange={(event) => setTxNote(event.target.value)} placeholder="Not" />
                <Button className="w-fit" disabled={addMoneyTransaction.isPending} onClick={() => addMoneyTransaction.mutate()}>
                  <PlusIcon /> Yeni İşlem
                </Button>
              </div>
              <ModuleTable
                empty="Henüz para işlemi yok"
                headers={["Tür", "Miktar", "Para Birimi", "Yöntem", "Durum", "Referans"]}
                rows={detail.moneyTransactions.map((tx) => [
                  tx.txType,
                  money(tx.amount, ""),
                  tx.currency,
                  tx.method || "-",
                  tx.txStatus,
                  tx.referenceNo || "-",
                ])}
              />
            </CardContent>
          </Card>
        ) : null}

        {activeTab === "docs" ? (
          <Card>
            <CardHeader>
              <CardTitle className="border-l-4 border-amber-500 pl-3 text-base">Belgeler</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5">
              <div className="grid gap-3 md:grid-cols-4">
                <Input value={documentTitle} onChange={(event) => setDocumentTitle(event.target.value)} placeholder="Başlık" />
                <Select value={documentType} onValueChange={setDocumentType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="verification">Doğrulama Belgesi</SelectItem>
                    <SelectItem value="identity">Kimlik</SelectItem>
                    <SelectItem value="address">Adres Kanıtı</SelectItem>
                    <SelectItem value="other">Diğer</SelectItem>
                  </SelectContent>
                </Select>
                <Input className="md:col-span-2" value={documentUrl} onChange={(event) => setDocumentUrl(event.target.value)} placeholder="Dosya URL (opsiyonel)" />
                <Button className="w-fit" disabled={addDocument.isPending || !documentTitle.trim()} onClick={() => addDocument.mutate()}>
                  <UploadIcon /> Belge Yükle
                </Button>
              </div>
              <ModuleTable
                empty="Henüz belge yok"
                headers={["Başlık", "Tür", "Durum", "Tarih"]}
                rows={detail.documents.map((doc) => [
                  doc.title,
                  doc.documentType,
                  doc.docStatus,
                  new Intl.DateTimeFormat("tr-TR", { dateStyle: "short" }).format(new Date(doc.createdAt)),
                ])}
              />
            </CardContent>
          </Card>
        ) : null}

        {activeTab === "contact" ? (
          <Card>
            <CardHeader>
              <CardTitle className="border-l-4 border-amber-500 pl-3 text-base">Canlı Destek Mesajları</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <textarea
                value={supportMessage}
                onChange={(event) => setSupportMessage(event.target.value)}
                className="min-h-20 rounded-lg border bg-background p-3 text-sm outline-none ring-ring focus:ring-2"
                placeholder="Client ile canlı destek mesajı..."
              />
              <Button className="w-fit" disabled={sendSupportMessage.isPending || !supportMessage.trim()} onClick={() => sendSupportMessage.mutate()}>
                <SendIcon /> Destek mesajı gönder
              </Button>
              <div className="grid gap-3">
                {detail.supportMessages.length > 0 ? (
                  detail.supportMessages.map((message) => (
                    <div key={message.id} className={`rounded-lg border p-3 ${message.mine ? "bg-primary/10" : "bg-muted/30"}`}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-medium">{message.senderName || message.senderEmail}</p>
                        <span className="text-xs text-muted-foreground">{formatRelative(message.createdAt)}</span>
                      </div>
                      <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{message.body}</p>
                    </div>
                  ))
                ) : (
                  <p className="py-8 text-center text-sm text-muted-foreground">Henüz canlı destek mesajı yok.</p>
                )}
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}

function HeaderMetric({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="border-l pl-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={positive ? "font-semibold text-emerald-600" : "font-semibold"}>{value}</p>
    </div>
  );
}

function InfoBlock({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 flex items-center gap-2 font-semibold">
        {value}
        {icon}
      </p>
    </div>
  );
}

function SmallModule({ icon: Icon, title, value }: { icon: typeof FileTextIcon; title: string; value: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <Icon className="size-4" />
        </div>
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ModuleTable({ headers, rows, empty }: { headers: string[]; rows: string[][]; empty: string }) {
  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-4 py-3 text-left font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-t">
                {row.map((cell, cellIndex) => (
                  <td key={`${rowIndex}-${cellIndex}`} className="px-4 py-3">
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={headers.length} className="px-4 py-12 text-center text-muted-foreground">
                {empty}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
