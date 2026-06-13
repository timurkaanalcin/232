"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CrownIcon,
  FileTextIcon,
  HeadphonesIcon,
  PlusIcon,
  SearchIcon,
  ShieldIcon,
  UserRoundIcon,
  UsersIcon,
  type LucideIcon,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiGet, apiPatch, apiPost, ClientApiError } from "@/lib/client-api";
import {
  CRM_DEPARTMENT_LABELS,
  CRM_STATUS_LABELS,
  ROLE_LABELS,
  ROLE_PERMISSIONS,
  requiresStatusSchedule,
} from "@/lib/constants";
import { formatRelative, initials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { CrmDepartment, CrmStatus, Paginated, Permission, RetentionStatus, RoleId, UserDTO, UserStatus } from "@/types";

const ROLES: RoleId[] = ["super_admin", "shift", "admin", "operator", "viewer", "retention", "sale", "user"];
const DEPARTMENTS: CrmDepartment[] = ["management", "retention", "sale", "client"];
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

const PERMISSION_AREAS: { permission: Permission; label: string }[] = [
  { permission: "customers.manage", label: "Müşteri Yönetimi" },
  { permission: "tickets.manage", label: "Bilet Yönetimi" },
  { permission: "documents.manage", label: "Belge Yönetimi" },
  { permission: "reports.view", label: "Raporlar" },
  { permission: "settings.manage", label: "Ayarlar" },
  { permission: "admin.panel", label: "Admin Paneli" },
];

const ROLE_CARDS: {
  role: RoleId;
  title: string;
  description: string;
  tone: string;
  icon: LucideIcon;
}[] = [
  {
    role: "super_admin",
    title: "Admin",
    description: "Tam yetki - tüm modüllere erişim ve site ayarları",
    tone: "border-red-200 bg-red-50 text-red-700",
    icon: CrownIcon,
  },
  {
    role: "shift",
    title: "Shift",
    description: "Admin yetkisi; Head ve altını yönetir, site ayarlarını değiştiremez",
    tone: "border-amber-200 bg-amber-50 text-amber-700",
    icon: ShieldIcon,
  },
  {
    role: "admin",
    title: "Head",
    description: "Sale ve Retention ekiplerini, Team Leader'ları yönetir",
    tone: "border-purple-200 bg-purple-50 text-purple-700",
    icon: ShieldIcon,
  },
  {
    role: "operator",
    title: "Retention TL",
    description: "Retention çalışanlarını yönetir ve takip eder",
    tone: "border-blue-200 bg-blue-50 text-blue-700",
    icon: HeadphonesIcon,
  },
  {
    role: "viewer",
    title: "Sale TL",
    description: "Sale çalışanlarını ve müşteri iletişimini yönetir",
    tone: "border-emerald-200 bg-emerald-50 text-emerald-700",
    icon: UsersIcon,
  },
  {
    role: "retention",
    title: "Retention",
    description: "Müşteri tutma ve bilet süreçlerinde çalışır",
    tone: "border-sky-200 bg-sky-50 text-sky-700",
    icon: HeadphonesIcon,
  },
  {
    role: "sale",
    title: "Sale",
    description: "Satış ve müşteri iletişimi süreçlerinde çalışır",
    tone: "border-green-200 bg-green-50 text-green-700",
    icon: UserRoundIcon,
  },
  {
    role: "user",
    title: "Client",
    description: "Sadece okuma yetkisi",
    tone: "border-slate-200 bg-slate-50 text-slate-700",
    icon: FileTextIcon,
  },
];

function errorMessage(error: unknown): string {
  return error instanceof ClientApiError ? error.message : "Something went wrong";
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

function isScheduleMissingForClient(role: RoleId, status: CrmStatus, scheduledAt: string): boolean {
  return role === "user" && requiresStatusSchedule(status) && !scheduledAt;
}

function RolePermissionCards() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Yetki Seviyeleri</CardTitle>
        <CardDescription>CRM platformu için Admin, Head, Team Leader, Sale, Retention ve Client alanları.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {ROLE_CARDS.map((card) => {
          const permissions = new Set(ROLE_PERMISSIONS[card.role] ?? []);
          const Icon = card.icon;
          return (
            <div key={card.role} className={`rounded-xl border p-4 ${card.tone}`}>
              <div className="mb-3 flex items-center gap-2">
                <Icon className="size-4" />
                <h3 className="font-semibold">{card.title}</h3>
              </div>
              <p className="min-h-10 text-xs opacity-75">{card.description}</p>
              <div className="mt-4 grid gap-1 text-sm text-foreground">
                {PERMISSION_AREAS.map((area) => {
                  const enabled = permissions.has(area.permission);
                  return (
                    <div
                      key={area.permission}
                      className={enabled ? "font-medium" : "text-muted-foreground line-through opacity-45"}
                    >
                      {area.label}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export function UserManagement() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserDTO | null>(null);

  const params = new URLSearchParams({ page: String(page), pageSize: "15" });
  if (query.trim()) params.set("q", query.trim());
  if (roleFilter !== "all") params.set("role", roleFilter);
  if (statusFilter !== "all") params.set("status", statusFilter);

  const usersQuery = useQuery({
    queryKey: ["admin", "users", params.toString()],
    queryFn: () => apiGet<Paginated<UserDTO>>(`/api/admin/users?${params.toString()}`),
  });

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ["admin", "users"] });

  const updateUser = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      apiPatch(`/api/admin/users/${id}`, body),
    onSuccess: () => {
      toast.success("User updated");
      invalidate();
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const totalPages = usersQuery.data ? Math.max(1, Math.ceil(usersQuery.data.total / 15)) : 1;

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">CRM Admin Paneli</h1>
          <p className="text-sm text-muted-foreground">
            Çalışanları oluşturun, yönetici atayın ve Sale/Retention yetkilerini yönetin.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <PlusIcon /> Yeni kullanıcı
        </Button>
      </div>

      <RolePermissionCards />

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Ad, e-posta, telefon veya Client ID ara"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                className="pl-8"
              />
            </div>
            <Select
              value={roleFilter}
              onValueChange={(value) => {
                setRoleFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm roller</SelectItem>
                {ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {ROLE_LABELS[role]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm durumlar</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="disabled">Pasif</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {usersQuery.isLoading ? (
            <div className="grid gap-2 p-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kullanıcı</TableHead>
                  <TableHead className="hidden md:table-cell">Telefon</TableHead>
                  <TableHead className="hidden lg:table-cell">CRM</TableHead>
                  <TableHead className="hidden sm:table-cell">Rol</TableHead>
                  <TableHead className="hidden md:table-cell">Durum</TableHead>
                  <TableHead className="hidden xl:table-cell">Son giriş</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersQuery.data?.items.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          {user.image ? <AvatarImage src={user.image} alt={user.name} /> : null}
                          <AvatarFallback>{initials(user.name)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{user.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                          {user.clientNumericId ? (
                            <p className="truncate text-xs font-medium text-primary">Client ID: {user.clientNumericId}</p>
                          ) : null}
                          {user.address ? (
                            <p className="truncate text-xs text-muted-foreground">{user.address}</p>
                          ) : null}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {user.phone || "—"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="grid gap-1 text-xs">
                        <span className="font-medium">{CRM_DEPARTMENT_LABELS[user.department]}</span>
                        <span className="text-muted-foreground">Client ID: {user.clientNumericId || "—"}</span>
                        <span className="text-muted-foreground">Reklam Kaynağı: {user.adSource || "—"}</span>
                        <span className="text-muted-foreground">Sale Statüsü: {CRM_STATUS_LABELS[user.saleStatus]}</span>
                        <span className="text-muted-foreground">
                          Sale Tarih/Saat: {user.saleStatusScheduledAt ? formatRelative(user.saleStatusScheduledAt) : "—"}
                        </span>
                        <span className="text-muted-foreground">Retention Statüsü: {CRM_STATUS_LABELS[user.retentionStatus]}</span>
                        <span className="text-muted-foreground">
                          Retention Tarih/Saat: {user.retentionStatusScheduledAt ? formatRelative(user.retentionStatusScheduledAt) : "—"}
                        </span>
                        <span className="text-muted-foreground">Yönetici: {user.managerName || "—"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Select
                        value={user.role}
                        onValueChange={(role) => updateUser.mutate({ id: user.id, body: { role } })}
                      >
                        <SelectTrigger className="h-8 w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLES.map((role) => (
                            <SelectItem key={role} value={role}>
                              {ROLE_LABELS[role]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {user.status === "active" ? (
                        <Badge variant="success">Aktif</Badge>
                      ) : (
                        <Badge variant="destructive">Pasif</Badge>
                      )}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell text-sm text-muted-foreground">
                      {user.lastLoginAt ? formatRelative(user.lastLoginAt) : "Hiç"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => setEditingUser(user)}>
                          Düzenle
                        </Button>
                        <Button
                          variant={user.status === "active" ? "outline" : "default"}
                          size="sm"
                          disabled={updateUser.isPending}
                          onClick={() =>
                            updateUser.mutate({
                              id: user.id,
                              body: { status: (user.status === "active" ? "disabled" : "active") as UserStatus },
                            })
                          }
                        >
                          {user.status === "active" ? "Pasifleştir" : "Aktifleştir"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {usersQuery.data && usersQuery.data.items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                      Filtrelerle eşleşen kullanıcı bulunamadı.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{usersQuery.data?.total ?? 0} kullanıcı</p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((v) => v - 1)}>
            <ChevronLeftIcon /> Önceki
          </Button>
          <span className="text-xs text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((v) => v + 1)}
          >
            Sonraki <ChevronRightIcon />
          </Button>
        </div>
      </div>

      <CreateUserDialog
        open={createOpen}
        users={usersQuery.data?.items ?? []}
        onOpenChange={setCreateOpen}
        onCreated={() => {
          setCreateOpen(false);
          invalidate();
        }}
      />
      <EditUserDialog
        user={editingUser}
        users={usersQuery.data?.items ?? []}
        onOpenChange={(open) => {
          if (!open) setEditingUser(null);
        }}
        onSaved={() => {
          setEditingUser(null);
          invalidate();
        }}
      />
    </div>
  );
}

function CreateUserDialog({
  open,
  users,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  users: UserDTO[];
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [image, setImage] = useState("");
  const [role, setRole] = useState<RoleId>("user");
  const [department, setDepartment] = useState<CrmDepartment>("client");
  const [saleStatus, setSaleStatus] = useState<CrmStatus>("new");
  const [saleStatusScheduledAt, setSaleStatusScheduledAt] = useState("");
  const [retentionStatus, setRetentionStatus] = useState<RetentionStatus>("new");
  const [retentionStatusScheduledAt, setRetentionStatusScheduledAt] = useState("");
  const [adSource, setAdSource] = useState("");
  const [managerId, setManagerId] = useState<string>(NO_MANAGER_VALUE);
  const saleScheduleMissing = isScheduleMissingForClient(role, saleStatus, saleStatusScheduledAt);
  const retentionScheduleMissing = isScheduleMissingForClient(role, retentionStatus, retentionStatusScheduledAt);

  const create = useMutation({
    mutationFn: () =>
      apiPost("/api/admin/users", {
        name,
        phone,
        email,
        password,
        address,
        dateOfBirth,
        image,
        role,
        department,
        saleStatus,
        saleStatusScheduledAt: fromDateTimeInputValue(saleStatusScheduledAt),
        retentionStatus,
        retentionStatusScheduledAt: fromDateTimeInputValue(retentionStatusScheduledAt),
        adSource,
        managerId: managerId === NO_MANAGER_VALUE ? null : managerId,
      }),
    onSuccess: () => {
      toast.success("Kullanıcı oluşturuldu");
      setName("");
      setPhone("");
      setEmail("");
      setPassword("");
      setAddress("");
      setDateOfBirth("");
      setImage("");
      setRole("user");
      setDepartment("client");
      setSaleStatus("new");
      setSaleStatusScheduledAt("");
      setRetentionStatus("new");
      setRetentionStatusScheduledAt("");
      setAdSource("");
      setManagerId(NO_MANAGER_VALUE);
      onCreated();
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Yeni CRM kullanıcısı</DialogTitle>
          <DialogDescription>
            Admin panelindeki örneğe göre çalışan veya client hesabı oluşturun.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="new-user-name">Adı Soyadı</Label>
            <Input id="new-user-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="new-user-phone">Telefon numarası</Label>
            <Input id="new-user-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="new-user-email">E posta adresi</Label>
            <Input id="new-user-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="new-user-password">Şifre</Label>
            <Input
              id="new-user-password"
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 10 karakter, büyük/küçük harf ve rakam"
            />
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="new-user-address">Adres</Label>
            <Input id="new-user-address" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="new-user-birthdate">Doğum Tarihi</Label>
            <Input
              id="new-user-birthdate"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="new-user-image">Fotoğraf URL</Label>
            <Input id="new-user-image" value={image} onChange={(e) => setImage(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Rol</Label>
            <Select value={role} onValueChange={(value) => setRole(value as RoleId)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {role === "user" ? (
              <p className="text-xs text-muted-foreground">
                Client ID otomatik atanır ve yalnızca rakamlardan oluşur.
              </p>
            ) : null}
          </div>
          <div className="grid gap-2">
            <Label>Departman</Label>
            <Select value={department} onValueChange={(value) => setDepartment(value as CrmDepartment)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((item) => (
                  <SelectItem key={item} value={item}>
                    {CRM_DEPARTMENT_LABELS[item]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="new-user-ad-source">Reklam Kaynağı</Label>
            <Input
              id="new-user-ad-source"
              value={adSource}
              onChange={(event) => setAdSource(event.target.value)}
              placeholder="Örn. Facebook, Google, Shift"
            />
          </div>
          <div className="grid gap-2">
            <Label>Yönetici</Label>
            <Select value={managerId} onValueChange={setManagerId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_MANAGER_VALUE}>Yönetici yok</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} - {ROLE_LABELS[user.role]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              <Label htmlFor="new-user-sale-scheduled-at">Sale Tarih ve Saat</Label>
              <Input
                id="new-user-sale-scheduled-at"
                type="datetime-local"
                value={saleStatusScheduledAt}
                onChange={(event) => setSaleStatusScheduledAt(event.target.value)}
                required={role === "user"}
              />
            </div>
          ) : null}
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
              <Label htmlFor="new-user-retention-scheduled-at">Retention Tarih ve Saat</Label>
              <Input
                id="new-user-retention-scheduled-at"
                type="datetime-local"
                value={retentionStatusScheduledAt}
                onChange={(event) => setRetentionStatusScheduledAt(event.target.value)}
                required={role === "user"}
              />
            </div>
          ) : null}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            İptal
          </Button>
          <Button
            onClick={() => create.mutate()}
            disabled={
              create.isPending ||
              !name ||
              !email ||
              password.length < 10 ||
              saleScheduleMissing ||
              retentionScheduleMissing
            }
          >
            {create.isPending ? "Oluşturuluyor..." : "Kaydet"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditUserDialog({
  user,
  users,
  onOpenChange,
  onSaved,
}: {
  user: UserDTO | null;
  users: UserDTO[];
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [address, setAddress] = useState(user?.address ?? "");
  const [dateOfBirth, setDateOfBirth] = useState(user?.dateOfBirth ?? "");
  const [image, setImage] = useState(user?.image ?? "");
  const [role, setRole] = useState<RoleId>(user?.role ?? "user");
  const [department, setDepartment] = useState<CrmDepartment>(user?.department ?? "client");
  const [saleStatus, setSaleStatus] = useState<CrmStatus>(user?.saleStatus ?? "new");
  const [saleStatusScheduledAt, setSaleStatusScheduledAt] = useState(toDateTimeInputValue(user?.saleStatusScheduledAt));
  const [retentionStatus, setRetentionStatus] = useState<RetentionStatus>(user?.retentionStatus ?? "new");
  const [retentionStatusScheduledAt, setRetentionStatusScheduledAt] = useState(
    toDateTimeInputValue(user?.retentionStatusScheduledAt),
  );
  const [adSource, setAdSource] = useState(user?.adSource ?? "");
  const [managerId, setManagerId] = useState<string>(user?.managerId ?? NO_MANAGER_VALUE);
  const saleScheduleMissing = isScheduleMissingForClient(role, saleStatus, saleStatusScheduledAt);
  const retentionScheduleMissing = isScheduleMissingForClient(role, retentionStatus, retentionStatusScheduledAt);

  useEffect(() => {
    if (!user) return;
    // The dialog stays mounted between row selections; sync local form state when the selected row changes.
    setName(user.name);
    setPhone(user.phone);
    setAddress(user.address);
    setDateOfBirth(user.dateOfBirth);
    setImage(user.image ?? "");
    setRole(user.role);
    setDepartment(user.department);
    setSaleStatus(user.saleStatus);
    setSaleStatusScheduledAt(toDateTimeInputValue(user.saleStatusScheduledAt));
    setRetentionStatus(user.retentionStatus);
    setRetentionStatusScheduledAt(toDateTimeInputValue(user.retentionStatusScheduledAt));
    setAdSource(user.adSource);
    setManagerId(user.managerId ?? NO_MANAGER_VALUE);
  }, [user]);

  const save = useMutation({
    mutationFn: () =>
      apiPatch(`/api/admin/users/${user?.id}`, {
        name,
        phone,
        address,
        dateOfBirth,
        image,
        role,
        department,
        saleStatus,
        saleStatusScheduledAt: fromDateTimeInputValue(saleStatusScheduledAt),
        retentionStatus,
        retentionStatusScheduledAt: fromDateTimeInputValue(retentionStatusScheduledAt),
        adSource,
        managerId: managerId === NO_MANAGER_VALUE ? null : managerId,
      }),
    onSuccess: () => {
      toast.success("Kullanıcı güncellendi");
      onSaved();
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  return (
    <Dialog open={Boolean(user)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>CRM kullanıcısını düzenle</DialogTitle>
          <DialogDescription>İletişim, yönetim ve Retention Durum bilgilerini güncelleyin.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="edit-user-name">Adı Soyadı</Label>
            <Input id="edit-user-name" value={name} onChange={(event) => setName(event.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-user-phone">Telefon numarası</Label>
            <Input id="edit-user-phone" value={phone} onChange={(event) => setPhone(event.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-user-email">E posta adresi</Label>
            <Input id="edit-user-email" type="email" value={user?.email ?? ""} disabled />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-user-client-id">Client ID</Label>
            <Input
              id="edit-user-client-id"
              value={user?.clientNumericId || "Client rolünde otomatik atanır"}
              disabled
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-user-birthdate">Doğum Tarihi</Label>
            <Input
              id="edit-user-birthdate"
              type="date"
              value={dateOfBirth}
              onChange={(event) => setDateOfBirth(event.target.value)}
            />
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="edit-user-address">Adres</Label>
            <Input id="edit-user-address" value={address} onChange={(event) => setAddress(event.target.value)} />
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="edit-user-image">Fotoğraf URL</Label>
            <Input id="edit-user-image" value={image} onChange={(event) => setImage(event.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Rol</Label>
            <Select value={role} onValueChange={(value) => setRole(value as RoleId)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {ROLE_LABELS[item]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Departman</Label>
            <Select value={department} onValueChange={(value) => setDepartment(value as CrmDepartment)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((item) => (
                  <SelectItem key={item} value={item}>
                    {CRM_DEPARTMENT_LABELS[item]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-user-ad-source">Reklam Kaynağı</Label>
            <Input
              id="edit-user-ad-source"
              value={adSource}
              onChange={(event) => setAdSource(event.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Yönetici</Label>
            <Select value={managerId} onValueChange={setManagerId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_MANAGER_VALUE}>Yönetici yok</SelectItem>
                {users
                  .filter((item) => item.id !== user?.id)
                  .map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} - {ROLE_LABELS[item.role]}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
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
              <Label htmlFor="edit-user-sale-scheduled-at">Sale Tarih ve Saat</Label>
              <Input
                id="edit-user-sale-scheduled-at"
                type="datetime-local"
                value={saleStatusScheduledAt}
                onChange={(event) => setSaleStatusScheduledAt(event.target.value)}
                required={role === "user"}
              />
            </div>
          ) : null}
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
              <Label htmlFor="edit-user-retention-scheduled-at">Retention Tarih ve Saat</Label>
              <Input
                id="edit-user-retention-scheduled-at"
                type="datetime-local"
                value={retentionStatusScheduledAt}
                onChange={(event) => setRetentionStatusScheduledAt(event.target.value)}
                required={role === "user"}
              />
            </div>
          ) : null}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            İptal
          </Button>
          <Button
            onClick={() => save.mutate()}
            disabled={save.isPending || !name || saleScheduleMissing || retentionScheduleMissing}
          >
            {save.isPending ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
