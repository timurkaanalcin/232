"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { signOut } from "next-auth/react";
import {
  DownloadIcon,
  KeyRoundIcon,
  LaptopIcon,
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
import { apiDelete, apiGet, apiPatch, apiPost, ClientApiError } from "@/lib/client-api";
import { formatRelative } from "@/lib/utils";
import type { DeviceSessionDTO, UserDTO } from "@/types";

export function SettingsModule() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <h1 className="mb-1 text-xl font-semibold tracking-tight">Settings</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Manage your profile, security, devices and personal data.
      </p>
      <Tabs defaultValue="profile">
        <TabsList className="mb-4 w-full justify-start overflow-x-auto sm:w-auto">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="privacy">Privacy &amp; data</TabsTrigger>
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
        <TabsContent value="privacy">
          <PrivacyTab />
        </TabsContent>
      </Tabs>
    </div>
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
      toast.success("Profile updated");
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
          <UserIcon className="size-4" /> Profile
        </CardTitle>
        <CardDescription>Your account information.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="profile-email">Email</Label>
          <Input id="profile-email" value={user.email} disabled />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="profile-name">Display name</Label>
          <Input id="profile-name" value={value} maxLength={100} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Button
            onClick={() => mutation.mutate(value)}
            disabled={mutation.isPending || value.trim().length === 0 || value === user.name}
          >
            {mutation.isPending ? "Saving…" : "Save changes"}
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
      toast.success("Device signed out");
      void queryClient.invalidateQueries({ queryKey: ["devices"] });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <LaptopIcon className="size-4" /> Active devices
        </CardTitle>
        <CardDescription>
          Every signed-in device with an active session. Revoke anything you do not recognize.
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
                        This device
                      </Badge>
                    )}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    Last active {formatRelative(device.lastSeenAt)}
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
                  Sign out
                </Button>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function PrivacyTab() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const deleteAccount = useMutation({
    mutationFn: () => apiDelete("/api/profile"),
    onSuccess: () => {
      toast.success("Account deleted");
      void signOut({ callbackUrl: "/" });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <DownloadIcon className="size-4" /> Export your data
          </CardTitle>
          <CardDescription>
            Download a complete JSON export of your profile, sessions, location history and audit trail
            (GDPR/KVKK right of access).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" asChild>
            <a href="/api/profile/export" download>
              <DownloadIcon /> Download export
            </a>
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-destructive">
            <Trash2Icon className="size-4" /> Delete account
          </CardTitle>
          <CardDescription>
            Permanently deletes your account, every location session and all recorded coordinates. This
            cannot be undone (GDPR/KVKK right to erasure).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
            Delete my account
          </Button>
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete account permanently?</DialogTitle>
            <DialogDescription>
              All of your data — profile, sessions, and location history — will be erased immediately. Type{" "}
              <strong>DELETE</strong> to confirm.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
            aria-label="Type DELETE to confirm"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={confirmText !== "DELETE" || deleteAccount.isPending}
              onClick={() => deleteAccount.mutate()}
            >
              {deleteAccount.isPending ? "Deleting…" : "Delete forever"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
