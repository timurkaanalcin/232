"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckIcon, Loader2Icon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiPost, ClientApiError } from "@/lib/client-api";
import { cn } from "@/lib/utils";

const RULES = [
  { test: (v: string) => v.length >= 10, label: "En az 10 karakter" },
  { test: (v: string) => /[a-z]/.test(v) && /[A-Z]/.test(v), label: "Büyük ve küçük harf" },
  { test: (v: string) => /[0-9]/.test(v), label: "En az bir rakam" },
];

export function ResetPasswordForm({ token }: { token: string | null }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const valid = RULES.every((rule) => rule.test(password));

  if (!token) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Bu sıfırlama bağlantısında jeton yok.{" "}
          <Link href="/forgot-password" className="underline">
            Şifremi unuttum
          </Link>{" "}
          sayfasından yeni bir bağlantı isteyin.
        </AlertDescription>
      </Alert>
    );
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiPost("/api/auth/password/reset", { token, password });
      toast.success("Şifre güncellendi", { description: "Yeni şifrenizle giriş yapabilirsiniz." });
      router.push("/login");
    } catch (resetError) {
      setError(resetError instanceof ClientApiError ? resetError.message : "Şifre sıfırlanamadı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="grid gap-2">
        <Label htmlFor="password">Yeni şifre</Label>
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
      <Button type="submit" disabled={loading || !valid} className="w-full">
        {loading && <Loader2Icon className="animate-spin" />}
        Şifreyi sıfırla
      </Button>
    </form>
  );
}
