import { issueEmailOtp, type EmailOtpRecord } from "@/lib/profileOtp";

export async function deliverEmail(input: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<{ ok: boolean; via: "api" | "local"; error?: string }> {
  try {
    const res = await fetch("/api/send-mail.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const json = (await res.json()) as { ok?: boolean; error?: string };
    if (res.ok && json.ok) return { ok: true, via: "api" };
    return { ok: false, via: "api", error: json.error || `HTTP ${res.status}` };
  } catch (e) {
    return {
      ok: false,
      via: "local",
      error: e instanceof Error ? e.message : "network",
    };
  }
}

/** Issue OTP + attempt real email delivery; always keeps local inbox mirror */
export async function sendLoginOtp(email: string, purpose: EmailOtpRecord["purpose"] = "login") {
  const record = issueEmailOtp(email, purpose);
  const text = `UBS doğrulama kodunuz: ${record.code}\n\n5 dakika geçerlidir.\nBu mesaj SMS yerine e-posta olarak gönderilmiştir.`;
  const html = `<div style="font-family:sans-serif;padding:24px"><h2 style="color:#E60000">UBS</h2><p>Doğrulama kodunuz:</p><p style="font-size:28px;font-weight:bold;letter-spacing:6px">${record.code}</p><p style="color:#666">5 dakika geçerlidir.</p></div>`;
  const sent = await deliverEmail({
    to: email,
    subject: "UBS güvenlik kodu (OTP)",
    text,
    html,
  });
  return { record, sent };
}

export async function sendPasswordResetOtp(email: string) {
  return sendLoginOtp(email, "login");
}
