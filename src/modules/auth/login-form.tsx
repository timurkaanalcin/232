"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { ArrowRightIcon, Loader2Icon, LockKeyholeIcon, MailIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { GoogleButton } from "@/components/auth/google-button";

export function LoginForm({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/admin/users";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <div className="grid gap-4">
      {googleEnabled && (
        <>
          <GoogleButton callbackUrl={callbackUrl} />
          <div className="relative">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
              veya
            </span>
          </div>
        </>
      )}

      <form onSubmit={handleSubmit} className="grid gap-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>Bilgiler kontrol edilemedi. E-posta veya şifre hatalı olabilir.</AlertDescription>
          </Alert>
        )}
        <div className="grid gap-2">
          <Label htmlFor="email" className="text-zinc-300">
            E-posta
          </Label>
          <div className="relative">
            <MailIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ornek@alsyatirim.com"
            className="h-12 border-white/10 bg-black/30 pl-10 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-400"
          />
          </div>
        </div>
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-zinc-300">
              Şifre
            </Label>
            <Link href="/forgot-password" className="text-xs text-emerald-300 hover:underline">
              Şifremi unuttum
            </Link>
          </div>
          <div className="relative">
            <LockKeyholeIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="h-12 border-white/10 bg-black/30 pl-10 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-400"
          />
          </div>
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="h-12 w-full bg-emerald-500 font-semibold text-emerald-950 hover:bg-emerald-400"
        >
          {loading && <Loader2Icon className="animate-spin" />}
          Güvenli giriş yap
          {!loading && <ArrowRightIcon />}
        </Button>
        <p className="text-center text-xs leading-5 text-zinc-500">
          Yetkisiz erişim denemeleri kayıt altına alınır. Devam ederek kurum güvenlik politikalarını kabul etmiş olursunuz.
        </p>
      </form>
    </div>
  );
}
