"use client";

import { useState } from "react";
import { Loader2Icon, MailCheckIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiPost } from "@/lib/client-api";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await apiPost("/api/auth/password/forgot", { email });
    } catch {
      // Intentionally ignored - the endpoint always succeeds to avoid leaking accounts.
    } finally {
      setLoading(false);
      setSent(true);
    }
  };

  if (sent) {
    return (
      <Alert variant="success">
        <MailCheckIcon />
        <AlertDescription>
          If an account exists for <strong>{email}</strong>, a password reset link is on its way. The link
          expires in 30 minutes.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
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
      <Button type="submit" disabled={loading} className="w-full">
        {loading && <Loader2Icon className="animate-spin" />}
        Send reset link
      </Button>
    </form>
  );
}
