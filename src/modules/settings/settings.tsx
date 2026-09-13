"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { signOut } from "next-auth/react";
import {
  BellIcon,
  ClockIcon,
  DownloadIcon,
  Globe2Icon,
  KeyRoundIcon,
  LaptopIcon,
  ScrollTextIcon,
  ShieldCheckIcon,
  SmartphoneIcon,
  Trash2Icon,
  UserIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { apiDelete, apiGet, apiPatch, apiPost, ClientApiError } from "@/lib/client-api";
import {
  FIRST_LAUNCH_CONSENT_EVENT,
  isLocationConsentAccepted,
  isNotificationConsentAccepted,
  readFirstLaunchConsent,
  writeFirstLaunchConsent,
} from "@/lib/first-launch-consent";
import { requestAcceptedRuntimePermissions } from "@/lib/runtime-permissions";
import { ACTION_LABELS } from "@/modules/admin/action-labels";
import { formatDateTime, formatRelative, getUserDateTimePreferences, type UserDateTimePreferences } from "@/lib/utils";
import type { AuditLogDTO, DeviceSessionDTO, Paginated, PrivacyPreferencesDTO, UserDTO } from "@/types";

export function SettingsModule() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <p className="hud-label mb-1">İstasyon</p>
      <h1 className="mb-1 text-xl font-semibold tracking-tight">Ayarlar</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Profil, güvenlik, cihazlar ve kişisel verilerinizi yönetin.
      </p>
      <Tabs defaultValue="profile">
        <TabsList className="mb-4 w-full justify-start overflow-x-auto sm:w-auto">
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="security">Güvenlik</TabsTrigger>
          <TabsTrigger value="devices">Cihazlar</TabsTrigger>
          <TabsTrigger value="notifications">Bildirimler</TabsTrigger>
          <TabsTrigger value="datetime">Tarih ve saat</TabsTrigger>
          <TabsTrigger value="privacy">Gizlilik</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <ProfileTab />
        </TabsContent>
        <TabsContent value="security">
          <SecurityTab />
        </TabsContent>
        <TabsContent value="devices">
          <DevicesTab />
        </TabsContent>
        <TabsContent value="notifications">
          <NotificationsTab />
        </TabsContent>
        <TabsContent value="datetime">
          <DateTimeTab />
        </TabsContent>
        <TabsContent value="privacy">
          <PrivacyTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DateTimeTab() {
  const [now, setNow] = useState(() => Date.now());
  const [preferences, setPreferences] = useState<UserDateTimePreferences | null>(null);

  useEffect(() => {
    setPreferences(getUserDateTimePreferences());
    const interval = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ClockIcon className="size-4" /> Tarih ve saat
        </CardTitle>
        <CardDescription>
          Tarih ve saatler tarayıcınızın bölgesine ve saat dilimine göre gösterilir.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Globe2Icon className="size-4 text-muted-foreground" />
              Bölge biçimi
            </div>
            <p className="mt-2 text-2xl font-semibold">{preferences?.locale ?? "Algılanıyor..."}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Örnek: Türkiye’de Türkçe tarih metni; Almanya’da Almanca tarih metni.
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <ClockIcon className="size-4 text-muted-foreground" />
              Saat dilimi
            </div>
            <p className="mt-2 text-2xl font-semibold">{preferences?.timeZone ?? "Algılanıyor..."}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Örnek: Türkiye Europe/Istanbul, Almanya Europe/Berlin kullanır.
            </p>
          </div>
        </div>
        <div className="rounded-lg border bg-accent/30 p-4">
          <p className="text-sm text-muted-foreground">Şu anki yerelleştirilmiş saat</p>
          <p className="mt-1 text-xl font-semibold">{preferences ? formatDateTime(now, preferences) : "Algılanıyor..."}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => apiGet<{ user: UserDTO }>("/api/profile"),
  });
}

function errorMessage(error: unknown): string {
  return error instanceof ClientApiError ? error.message : "Something went wrong";
}

function ProfileTab() {
  const profile = useProfile();
  const queryClient = useQueryClient();
  const [name, setName] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (newName: string) => apiPatch("/api/profile", { name: newName }),
    onSuccess: () => {
      toast.success("Profil güncellendi");
      void queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  if (profile.isLoading) return <Skeleton className="h-48" />;
  const user = profile.data?.user;
  if (!user) return null;
  const value = name ?? user.name;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <UserIcon className="size-4" /> Profil
        </CardTitle>
        <CardDescription>Hesap bilgileriniz.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="profile-email">Email</Label>
          <Input id="profile-email" value={user.email} disabled />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="profile-name">Görünen ad</Label>
          <Input id="profile-name" value={value} maxLength={100} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Button
            onClick={() => mutation.mutate(value)}
            disabled={mutation.isPending || value.trim().length === 0 || value === user.name}
          >
            {mutation.isPending ? "Kaydediliyor…" : "Değişiklikleri kaydet"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function SecurityTab() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const mutation = useMutation({
    mutationFn: () => apiPost("/api/auth/password/change", { currentPassword, newPassword }),
    onSuccess: () => {
      toast.success("Password changed", { description: "Other devices have been signed out." });
      setCurrentPassword("");
      setNewPassword("");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <KeyRoundIcon className="size-4" /> Change password
        </CardTitle>
        <CardDescription>
          Changing your password signs you out of every other device. At least 10 characters with upper and
          lower case letters and a digit.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="current-password">Current password</Label>
          <Input
            id="current-password"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="new-password">New password</Label>
          <Input
            id="new-password"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <div>
          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !currentPassword || newPassword.length < 10}
          >
            {mutation.isPending ? "Updating…" : "Update password"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function DevicesTab() {
  const queryClient = useQueryClient();
  const devices = useQuery({
    queryKey: ["devices"],
    queryFn: () => apiGet<{ devices: DeviceSessionDTO[] }>("/api/devices"),
  });

  const revoke = useMutation({
    mutationFn: (id: string) => apiDelete(`/api/devices/${id}`),
    onSuccess: () => {
      toast.success("Cihaz oturumu kapatıldı");
      void queryClient.invalidateQueries({ queryKey: ["devices"] });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const revokeOthers = useMutation({
    mutationFn: () => apiPost<{ ok: boolean; revoked: number }>("/api/devices/revoke-others"),
    onSuccess: (data) => {
      toast.success("Diğer cihazlar kapatıldı", {
        description: data.revoked > 0 ? `${data.revoked} oturum sonlandırıldı.` : "Başka aktif cihaz yoktu.",
      });
      void queryClient.invalidateQueries({ queryKey: ["devices"] });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const otherCount = devices.data?.devices.filter((device) => !device.current).length ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <LaptopIcon className="size-4" /> Aktif cihazlar
        </CardTitle>
        <CardDescription>
          Oturum açmış her cihaz. Tanımadığınız kaydı kapatın — işlem audit’e yazılır.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2">
        {devices.isLoading ? (
          <Skeleton className="h-32" />
        ) : (
          devices.data?.devices.map((device) => (
            <div key={device.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
              <div className="flex min-w-0 items-center gap-3">
                {/Android|iOS/.test(device.deviceName) ? (
                  <SmartphoneIcon className="size-4 shrink-0 text-muted-foreground" />
                ) : (
                  <LaptopIcon className="size-4 shrink-0 text-muted-foreground" />
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {device.deviceName}
                    {device.current && (
                      <Badge variant="success" className="ml-2">
                        Bu cihaz
                      </Badge>
                    )}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    Son aktif {formatRelative(device.lastSeenAt)}
                    {device.ip ? ` · ${device.ip}` : ""}
                  </p>
                </div>
              </div>
              {!device.current && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => revoke.mutate(device.id)}
                  disabled={revoke.isPending}
                >
                  Çıkış yaptır
                </Button>
              )}
            </div>
          ))
        )}
        {otherCount > 0 && (
          <Button
            variant="outline"
            className="mt-2"
            onClick={() => revokeOthers.mutate()}
            disabled={revokeOthers.isPending}
          >
            {revokeOthers.isPending ? "Kapatılıyor…" : "Diğer tüm cihazlardan çıkış yap"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function FirstLaunchPrefsCard() {
  const queryClient = useQueryClient();
  const [consent, setConsent] = useState(() =>
    typeof window === "undefined" ? null : readFirstLaunchConsent(),
  );
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const sync = () => setConsent(readFirstLaunchConsent());
    sync();
    window.addEventListener(FIRST_LAUNCH_CONSENT_EVENT, sync);
    return () => window.removeEventListener(FIRST_LAUNCH_CONSENT_EVENT, sync);
  }, []);

  const update = async (patch: { location?: boolean; notifications?: boolean }) => {
    const current = readFirstLaunchConsent();
    const next = {
      location: patch.location ?? current?.location ?? false,
      notifications: patch.notifications ?? current?.notifications ?? false,
    };
    setBusy(true);
    try {
      writeFirstLaunchConsent(next);
      if (patch.notifications !== undefined) {
        try {
          await apiPatch("/api/privacy/preferences", {
            notifySession: next.notifications,
            notifySecurity: next.notifications,
            notifyConsent: next.notifications,
            marketingOptIn: false,
          });
          void queryClient.invalidateQueries({ queryKey: ["privacy-prefs"] });
        } catch {
          /* guest */
        }
      }
      await requestAcceptedRuntimePermissions({
        location: patch.location === true,
        notifications: patch.notifications === true,
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldCheckIcon className="size-4" /> İlk açılış izinleri
        </CardTitle>
        <CardDescription>
          Konum ve bildirimler tek tek yönetilir. Sistem iznini geri almak için cihaz veya tarayıcı Ayarları’nı
          kullanın. Pazarlama bu listede yoktur.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <div className="flex items-start justify-between gap-4 rounded-lg border p-3">
          <div>
            <p className="text-sm font-medium">Konum (LiveTrack / CanlıSite)</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {isLocationConsentAccepted()
                ? "Uygulama içi konum izni açık. Paylaşım yine oturum onayı ister."
                : "Uygulama içi konum izni kapalı."}
            </p>
          </div>
          <Switch
            checked={consent?.location === true}
            disabled={busy}
            onCheckedChange={(location) => void update({ location })}
            aria-label="Konum iznini güncelle"
          />
        </div>
        <div className="flex items-start justify-between gap-4 rounded-lg border p-3">
          <div>
            <p className="text-sm font-medium">Bildirimler</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {isNotificationConsentAccepted()
                ? "Uygulama içi bildirim izni açık."
                : "Uygulama içi bildirim izni kapalı."}
            </p>
          </div>
          <Switch
            checked={consent?.notifications === true}
            disabled={busy}
            onCheckedChange={(notifications) => void update({ notifications })}
            aria-label="Bildirim iznini güncelle"
          />
        </div>
      </CardContent>
    </Card>
  );
}

function PrivacyTab() {
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);

  const sessions = useQuery({
    queryKey: ["location-sessions", "privacy"],
    queryFn: () => apiGet<{ active: { id: string } | null }>("/api/location/sessions?page=1&pageSize=1"),
  });

  const prefs = useQuery({
    queryKey: ["privacy-prefs"],
    queryFn: () => apiGet<{ preferences: PrivacyPreferencesDTO }>("/api/privacy/preferences"),
  });

  const consentLog = useQuery({
    queryKey: ["consent-log"],
    queryFn: () => apiGet<Paginated<AuditLogDTO>>("/api/privacy/consent-log?page=1&pageSize=12"),
  });

  const updateRetention = useMutation({
    mutationFn: (locationRetentionDays: PrivacyPreferencesDTO["locationRetentionDays"]) =>
      apiPatch("/api/privacy/preferences", { locationRetentionDays }),
    onSuccess: () => {
      toast.success("Saklama süresi güncellendi");
      void queryClient.invalidateQueries({ queryKey: ["privacy-prefs"] });
      void queryClient.invalidateQueries({ queryKey: ["consent-log"] });
      void queryClient.invalidateQueries({ queryKey: ["location-sessions"] });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const stopSharing = useMutation({
    mutationFn: (id: string) => apiPost(`/api/location/sessions/${id}/stop`),
    onSuccess: () => {
      toast.success("Paylaşım durduruldu", { description: "İzin geri alındı ve kayıt kesildi." });
      void queryClient.invalidateQueries({ queryKey: ["location-sessions"] });
      void queryClient.invalidateQueries({ queryKey: ["consent-log"] });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const deleteHistory = useMutation({
    mutationFn: () => apiPost("/api/privacy/location-history", { confirm: true }),
    onSuccess: () => {
      toast.success("Konum geçmişi silindi");
      setHistoryOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["location-sessions"] });
      void queryClient.invalidateQueries({ queryKey: ["consent-log"] });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const deleteAccount = useMutation({
    mutationFn: () => apiDelete("/api/profile"),
    onSuccess: () => {
      toast.success("Hesap silindi");
      void signOut({ callbackUrl: "/" });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const activeId = sessions.data?.active?.id ?? null;
  const retention = prefs.data?.preferences.locationRetentionDays ?? 0;

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheckIcon className="size-4" /> Konum izni
          </CardTitle>
          <CardDescription>
            CanlıSite konum toplamaz ta ki siz açıkça bir oturum başlatana kadar. Paylaşımı buradan da
            durdurabilirsiniz. Sistem konum iznini Ayarlar → Konum (veya tarayıcı site izinleri) üzerinden geri
            alabilirsiniz.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {activeId ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3">
              <p className="text-sm">Aktif paylaşım var. İzni istediğiniz an geri alabilirsiniz.</p>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => stopSharing.mutate(activeId)}
                disabled={stopSharing.isPending}
              >
                {stopSharing.isPending ? "Durduruluyor…" : "Paylaşımı durdur"}
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Şu anda aktif konum paylaşımı yok.</p>
          )}
        </CardContent>
      </Card>

      <FirstLaunchPrefsCard />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Konum geçmişi saklama</CardTitle>
          <CardDescription>
            Sona ermiş oturumlar seçilen süre sonra otomatik silinir. Aktif oturumlar asla otomatik silinmez.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Label htmlFor="retention">Saklama süresi</Label>
          <select
            id="retention"
            className="mt-2 h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
            value={retention}
            disabled={updateRetention.isPending || prefs.isLoading}
            onChange={(event) =>
              updateRetention.mutate(Number(event.target.value) as PrivacyPreferencesDTO["locationRetentionDays"])
            }
          >
            <option value={0}>Silene kadar sakla</option>
            <option value={30}>30 gün</option>
            <option value={90}>90 gün</option>
            <option value={365}>365 gün</option>
          </select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ScrollTextIcon className="size-4" /> İzin kaydı
          </CardTitle>
          <CardDescription>Kendi onay, durdurma, cihaz ve gizlilik işlemleriniz.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2">
          {consentLog.isLoading ? (
            <Skeleton className="h-24" />
          ) : consentLog.data && consentLog.data.items.length > 0 ? (
            consentLog.data.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm">
                <span>{ACTION_LABELS[item.action]?.label ?? item.action}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{formatRelative(item.createdAt)}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Henüz izin kaydı yok.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <DownloadIcon className="size-4" /> Verilerinizi dışa aktarın
          </CardTitle>
          <CardDescription>
            Profil, cihazlar, konum geçmişi, bildirimler ve audit kaydının JSON kopyası (KVKK/GDPR).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" asChild>
            <a href="/api/profile/export" download>
              <DownloadIcon /> Dışa aktar
            </a>
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-destructive">
            <Trash2Icon className="size-4" /> Konum geçmişini sil
          </CardTitle>
          <CardDescription>
            Bitmiş oturumlar silinir. Aktif paylaşım varsa önce durdurulmalıdır.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => setHistoryOpen(true)}>
            Konum geçmişini sil
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-destructive">
            <Trash2Icon className="size-4" /> Hesabı sil
          </CardTitle>
          <CardDescription>Hesap ve konum verileri kalıcı silinir (KVKK/GDPR silme hakkı).</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
            Hesabımı sil
          </Button>
        </CardContent>
      </Card>

      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konum geçmişi silinsin mi?</DialogTitle>
            <DialogDescription>
              Sona ermiş oturumlar ve noktalar silinir. Bu işlem geri alınamaz ve audit’e yazılır.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setHistoryOpen(false)}>
              Vazgeç
            </Button>
            <Button variant="destructive" disabled={deleteHistory.isPending} onClick={() => deleteHistory.mutate()}>
              {deleteHistory.isPending ? "Siliniyor…" : "Geçmişi sil"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hesap kalıcı silinsin mi?</DialogTitle>
            <DialogDescription>
              Profil, oturumlar ve konum geçmişi hemen silinir. Onaylamak için <strong>DELETE</strong> yazın.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
            aria-label="Onay için DELETE yazın"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Vazgeç
            </Button>
            <Button
              variant="destructive"
              disabled={confirmText !== "DELETE" || deleteAccount.isPending}
              onClick={() => deleteAccount.mutate()}
            >
              {deleteAccount.isPending ? "Siliniyor…" : "Kalıcı sil"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NotificationsTab() {
  const queryClient = useQueryClient();
  const prefs = useQuery({
    queryKey: ["privacy-prefs"],
    queryFn: () => apiGet<{ preferences: PrivacyPreferencesDTO }>("/api/privacy/preferences"),
  });

  const mutation = useMutation({
    mutationFn: (body: Partial<PrivacyPreferencesDTO>) => apiPatch("/api/privacy/preferences", body),
    onSuccess: () => {
      toast.success("Bildirim tercihleri kaydedildi");
      void queryClient.invalidateQueries({ queryKey: ["privacy-prefs"] });
      void queryClient.invalidateQueries({ queryKey: ["consent-log"] });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const value = prefs.data?.preferences;

  const row = (
    id: string,
    label: string,
    description: string,
    checked: boolean,
    key: "notifySession" | "notifySecurity" | "notifyConsent" | "marketingOptIn",
  ) => (
    <div className="flex items-start justify-between gap-4 rounded-lg border p-3">
      <div>
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch
        id={id}
        checked={checked}
        disabled={!value || mutation.isPending}
        onCheckedChange={(next) => mutation.mutate({ [key]: next })}
      />
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <BellIcon className="size-4" /> Bildirim tercihleri
        </CardTitle>
        <CardDescription>
          Uygulama içi uyarılar varsayılan açıktır. Pazarlama iletileri kapalı başlar — açık rıza gerekir.
          İlk açılışta bildirimleri reddettiyseniz sistem izni istenmez; buradan açabilirsiniz. Geri alma:
          cihaz Ayarları → Bildirimler.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {prefs.isLoading || !value ? (
          <Skeleton className="h-40" />
        ) : (
          <>
            {row(
              "notify-session",
              "Konum oturumları",
              "Paylaşım başladığında ve durduğunda bildirim.",
              value.notifySession,
              "notifySession",
            )}
            {row(
              "notify-consent",
              "İzin kayıtları",
              "Konum izni verildiğinde veya geri alındığında bildirim.",
              value.notifyConsent,
              "notifyConsent",
            )}
            {row(
              "notify-security",
              "Güvenlik",
              "Giriş, çıkış ve cihaz kapatma uyarıları.",
              value.notifySecurity,
              "notifySecurity",
            )}
            {row(
              "marketing-opt-in",
              "Ürün duyuruları (isteğe bağlı)",
              "Pazarlama iletisi yalnızca bu anahtarı siz açarsanız gönderilir.",
              value.marketingOptIn,
              "marketingOptIn",
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
