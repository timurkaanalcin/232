"use client";

import { useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArchiveIcon,
  ArrowLeftRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  HistoryIcon,
  LockIcon,
  PlusIcon,
  RotateCcwIcon,
  SearchIcon,
  UnlockIcon,
  WalletIcon,
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
import { apiGet, apiPost, ClientApiError } from "@/lib/client-api";
import { formatDateTime } from "@/lib/utils";
import type { Paginated, WalletDTO, WalletStatus, WalletTransactionDTO, WalletType } from "@/types";

type BadgeTone = "secondary" | "warning" | "destructive" | "success" | "outline";

interface WalletStats {
  total: number;
  active: number;
  frozen: number;
  archived: number;
  balancesByCurrency: { currency: string; balanceMinor: number }[];
}

const WALLET_TYPES: WalletType[] = ["main", "trading", "bonus", "credit", "crypto", "multi_currency"];

const STATUS_TONE: Record<WalletStatus, BadgeTone> = {
  active: "success",
  frozen: "warning",
  archived: "secondary",
};

function errorMessage(error: unknown): string {
  return error instanceof ClientApiError ? error.message : "Something went wrong";
}

function formatMinor(amount: number, currency: string): string {
  return `${(amount / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;
}

export function WalletCenter() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [type, setType] = useState<string>("all");
  const [currency, setCurrency] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<WalletDTO | null>(null);

  const statsQuery = useQuery({
    queryKey: ["admin", "wallet-stats"],
    queryFn: () => apiGet<{ stats: WalletStats }>("/api/admin/wallets/stats"),
    refetchInterval: 15_000,
  });

  const params = new URLSearchParams({ page: String(page), pageSize: "20" });
  if (query.trim()) params.set("q", query.trim());
  if (status !== "all") params.set("status", status);
  if (type !== "all") params.set("type", type);
  if (currency.trim()) params.set("currency", currency.trim().toUpperCase());

  const walletsQuery = useQuery({
    queryKey: ["admin", "wallets", params.toString()],
    queryFn: () => apiGet<Paginated<WalletDTO>>(`/api/admin/wallets?${params.toString()}`),
    placeholderData: keepPreviousData,
    refetchInterval: 15_000,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin", "wallets"] });
    void queryClient.invalidateQueries({ queryKey: ["admin", "wallet-stats"] });
    void queryClient.invalidateQueries({ queryKey: ["admin", "wallet-transactions"] });
  };

  const statusMutation = useMutation({
    mutationFn: ({ walletId, nextStatus }: { walletId: string; nextStatus: WalletStatus }) =>
      apiPost(`/api/admin/wallets/${walletId}/status`, { status: nextStatus }),
    onSuccess: () => {
      toast.success("Wallet status updated");
      invalidate();
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const totalPages = walletsQuery.data ? Math.max(1, Math.ceil(walletsQuery.data.total / 20)) : 1;
  const stats = statsQuery.data?.stats;

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-4 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <WalletIcon className="size-5 text-emerald-600" />
            <h1 className="text-xl font-semibold tracking-tight">Internal wallets</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Create, freeze, transfer, reverse and audit internal balances.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setTransferOpen(true)}>
            <ArrowLeftRightIcon /> Transfer
          </Button>
          <Button onClick={() => setCreateOpen(true)}>
            <PlusIcon /> New wallet
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total wallets" value={stats?.total} loading={statsQuery.isLoading} />
        <StatCard label="Active" value={stats?.active} loading={statsQuery.isLoading} success />
        <StatCard label="Frozen" value={stats?.frozen} loading={statsQuery.isLoading} warning />
        <StatCard label="Archived" value={stats?.archived} loading={statsQuery.isLoading} />
      </div>

      {stats && stats.balancesByCurrency.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Balances by currency</CardTitle>
            <CardDescription>Aggregated non-archived wallet balances.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {stats.balancesByCurrency.map((item) => (
              <Badge key={item.currency} variant="outline" className="px-3 py-1">
                {formatMinor(item.balanceMinor, item.currency)}
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="grid gap-3 p-4">
          <div className="grid gap-2 lg:grid-cols-[1fr_150px_170px_140px]">
            <div className="relative">
              <SearchIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                placeholder="Search wallet id, user email or name"
                className="pl-8"
              />
            </div>
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="frozen">Frozen</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={type}
              onValueChange={(value) => {
                setType(value);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Wallet type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {WALLET_TYPES.map((walletType) => (
                  <SelectItem key={walletType} value={walletType}>
                    {walletType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={currency}
              onChange={(event) => {
                setCurrency(event.target.value.toUpperCase());
                setPage(1);
              }}
              placeholder="Currency"
            />
          </div>

          <div className="grid gap-2">
            {walletsQuery.isLoading ? (
              Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-24" />)
            ) : walletsQuery.data && walletsQuery.data.items.length > 0 ? (
              walletsQuery.data.items.map((wallet) => (
                <WalletCard
                  key={wallet.id}
                  wallet={wallet}
                  selected={selectedWallet?.id === wallet.id}
                  onSelect={() => setSelectedWallet(wallet)}
                  onSetStatus={(nextStatus) => statusMutation.mutate({ walletId: wallet.id, nextStatus })}
                  actionPending={statusMutation.isPending}
                />
              ))
            ) : (
              <p className="py-10 text-center text-sm text-muted-foreground">No wallets match your filters.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{walletsQuery.data?.total ?? 0} wallets</p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>
            <ChevronLeftIcon /> Prev
          </Button>
          <span className="text-xs text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((value) => value + 1)}
          >
            Next <ChevronRightIcon />
          </Button>
        </div>
      </div>

      {selectedWallet && <WalletHistory wallet={selectedWallet} onChanged={invalidate} />}

      <CreateWalletDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={() => {
          setCreateOpen(false);
          invalidate();
        }}
      />
      <TransferDialog
        open={transferOpen}
        onOpenChange={setTransferOpen}
        onCreated={() => {
          setTransferOpen(false);
          invalidate();
        }}
      />
    </div>
  );
}

function WalletCard({
  wallet,
  selected,
  actionPending,
  onSelect,
  onSetStatus,
}: {
  wallet: WalletDTO;
  selected: boolean;
  actionPending: boolean;
  onSelect: () => void;
  onSetStatus: (status: WalletStatus) => void;
}) {
  return (
    <div className={`grid gap-3 rounded-lg border p-4 ${selected ? "border-primary/60 bg-primary/5" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={STATUS_TONE[wallet.status]}>{wallet.status}</Badge>
            <Badge variant="outline">{wallet.walletType}</Badge>
            <span className="font-medium tabular-nums">{formatMinor(wallet.balanceMinor, wallet.currency)}</span>
          </div>
          <p className="mt-1 truncate text-sm text-muted-foreground">
            {wallet.userEmail || wallet.userId} · {wallet.id}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={onSelect}>
            <HistoryIcon /> History
          </Button>
          {wallet.status === "active" && (
            <Button variant="secondary" size="sm" disabled={actionPending} onClick={() => onSetStatus("frozen")}>
              <LockIcon /> Freeze
            </Button>
          )}
          {wallet.status === "frozen" && (
            <Button variant="secondary" size="sm" disabled={actionPending} onClick={() => onSetStatus("active")}>
              <UnlockIcon /> Unfreeze
            </Button>
          )}
          {wallet.status !== "archived" && (
            <Button variant="outline" size="sm" disabled={actionPending} onClick={() => onSetStatus("archived")}>
              <ArchiveIcon /> Archive
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function WalletHistory({ wallet, onChanged }: { wallet: WalletDTO; onChanged: () => void }) {
  const queryClient = useQueryClient();
  const transactionsQuery = useQuery({
    queryKey: ["admin", "wallet-transactions", wallet.id],
    queryFn: () =>
      apiGet<Paginated<WalletTransactionDTO>>(`/api/admin/wallets/transactions?walletId=${wallet.id}&page=1&pageSize=20`),
    placeholderData: keepPreviousData,
    refetchInterval: 15_000,
  });

  const reverse = useMutation({
    mutationFn: (transferId: string) => apiPost(`/api/admin/wallets/transfers/${transferId}/reverse`, {}),
    onSuccess: () => {
      toast.success("Transfer reversed");
      void queryClient.invalidateQueries({ queryKey: ["admin", "wallet-transactions"] });
      onChanged();
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Transaction history</CardTitle>
        <CardDescription>
          {wallet.walletType} wallet for {wallet.userEmail || wallet.userId}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2">
        {transactionsQuery.isLoading ? (
          Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-16" />)
        ) : transactionsQuery.data && transactionsQuery.data.items.length > 0 ? (
          transactionsQuery.data.items.map((transaction) => (
            <div key={transaction.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={transaction.direction === "credit" ? "success" : transaction.direction === "debit" ? "warning" : "secondary"}>
                    {transaction.direction}
                  </Badge>
                  <span className="text-sm font-medium">{transaction.transactionType}</span>
                  <span className="text-sm tabular-nums">{formatMinor(transaction.amountMinor, transaction.currency)}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Balance after {formatMinor(transaction.balanceAfterMinor, transaction.currency)} ·{" "}
                  {formatDateTime(transaction.createdAt)}
                </p>
              </div>
              {transaction.transferId && transaction.transactionType === "transfer" && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={reverse.isPending}
                  onClick={() => reverse.mutate(transaction.transferId!)}
                >
                  <RotateCcwIcon /> Reverse
                </Button>
              )}
            </div>
          ))
        ) : (
          <p className="py-6 text-center text-sm text-muted-foreground">No transactions yet.</p>
        )}
      </CardContent>
    </Card>
  );
}

function CreateWalletDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}) {
  const [userId, setUserId] = useState("");
  const [walletType, setWalletType] = useState<WalletType>("main");
  const [currency, setCurrency] = useState("USD");

  const create = useMutation({
    mutationFn: () => apiPost("/api/admin/wallets", { userId, walletType, currency }),
    onSuccess: () => {
      toast.success("Wallet created");
      setUserId("");
      setWalletType("main");
      setCurrency("USD");
      onCreated();
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create wallet</DialogTitle>
          <DialogDescription>Create one internal wallet for an existing user and currency.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-2">
            <Label htmlFor="wallet-user-id">User ID</Label>
            <Input id="wallet-user-id" value={userId} onChange={(event) => setUserId(event.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Wallet type</Label>
            <Select value={walletType} onValueChange={(value) => setWalletType(value as WalletType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WALLET_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="wallet-currency">Currency</Label>
            <Input
              id="wallet-currency"
              value={currency}
              onChange={(event) => setCurrency(event.target.value.toUpperCase())}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={create.isPending || !userId || !currency} onClick={() => create.mutate()}>
            {create.isPending ? "Creating..." : "Create wallet"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TransferDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}) {
  const [fromWalletId, setFromWalletId] = useState("");
  const [toWalletId, setToWalletId] = useState("");
  const [amountMinor, setAmountMinor] = useState("");
  const [memo, setMemo] = useState("");

  const transfer = useMutation({
    mutationFn: () =>
      apiPost("/api/admin/wallets/transfer", {
        fromWalletId,
        toWalletId,
        amountMinor: Number(amountMinor),
        memo,
      }),
    onSuccess: () => {
      toast.success("Transfer posted");
      setFromWalletId("");
      setToWalletId("");
      setAmountMinor("");
      setMemo("");
      onCreated();
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Wallet transfer</DialogTitle>
          <DialogDescription>Move minor-unit balance between active wallets in the same currency.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-2">
            <Label htmlFor="from-wallet-id">From wallet ID</Label>
            <Input id="from-wallet-id" value={fromWalletId} onChange={(event) => setFromWalletId(event.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="to-wallet-id">To wallet ID</Label>
            <Input id="to-wallet-id" value={toWalletId} onChange={(event) => setToWalletId(event.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="amount-minor">Amount minor units</Label>
            <Input
              id="amount-minor"
              inputMode="numeric"
              value={amountMinor}
              onChange={(event) => setAmountMinor(event.target.value.replace(/\D/g, ""))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="transfer-memo">Memo</Label>
            <Input id="transfer-memo" value={memo} onChange={(event) => setMemo(event.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={transfer.isPending || !fromWalletId || !toWalletId || Number(amountMinor) <= 0}
            onClick={() => transfer.mutate()}
          >
            {transfer.isPending ? "Posting..." : "Post transfer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StatCard({
  label,
  value,
  loading,
  success,
  warning,
}: {
  label: string;
  value: number | undefined;
  loading: boolean;
  success?: boolean;
  warning?: boolean;
}) {
  return (
    <Card className={success ? "border-emerald-500/30" : warning ? "border-amber-500/30" : undefined}>
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        {loading ? (
          <Skeleton className="mt-2 h-8 w-12" />
        ) : (
          <p className={`mt-1 text-3xl font-semibold tabular-nums ${success ? "text-emerald-600" : ""}`}>
            {value ?? 0}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
