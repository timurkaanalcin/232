"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { CheckIcon, Loader2Icon, XIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { GoogleButton } from "@/components/auth/google-button";
import { apiPost, ClientApiError } from "@/lib/client-api";
import { cn } from "@/lib/utils";

const RULES = [
  { test: (v: string) => v.length >= 10, label: "En az 10 karakter" },
  { test: (v: string) => /[a-z]/.test(v) && /[A-Z]/.test(v), label: "Büyük ve küçük harf" },
  { test: (v: string) => /[0-9]/.test(v), label: "En az bir rakam" },
];

export function RegisterForm({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const passwordValid = RULES.every((rule) => rule.test(password));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiPost("/api/auth/register", { name, email, password });
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        router.push("/login");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch (registerError) {
      setError(
        registerError instanceof ClientApiError ? registerError.message : "Kayıt başarısız. Tekrar deneyin.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-4">
      {googleEnabled && (
        <>
          <GoogleButton callbackUrl="/dashboard" />
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
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="grid gap-2">
          <Label htmlFor="name">Ad soyad</Label>
          <Input id="name" autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Şifre</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <ul className="mt-1 grid gap-1">
            {RULES.map((rule) => {
              const ok = rule.test(password);
              return (
                <li
                  key={rule.label}
                  className={cn("flex items-center gap-1.5 text-xs", ok ? "text-emerald-600" : "text-muted-foreground")}
                >
                  {ok ? <CheckIcon className="size-3" /> : <XIcon className="size-3" />} {rule.label}
                </li>
              );
            })}
          </ul>
        </div>
        <Button type="submit" disabled={loading || !passwordValid || !name || !email} className="w-full">
          {loading && <Loader2Icon className="animate-spin" />}
          Hesap oluştur
        </Button>
        <p className="text-xs text-muted-foreground">
          Hesap oluşturarak konumun yalnızca açık izninizle paylaşılacağını kabul edersiniz. Paylaşımı
          istediğiniz an durdurabilir veya verilerinizi silebilirsiniz.
        </p>
      </form>
    </div>
  );
}
