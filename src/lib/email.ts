/**
 * Transactional email via the Resend HTTP API (free tier compatible).
 * If RESEND_API_KEY is not configured, emails are skipped and the caller is
 * informed via the return value so it can be surfaced in server logs.
 */

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendEmail(env: CloudflareEnv, input: SendEmailInput): Promise<boolean> {
  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) {
    console.error(JSON.stringify({ msg: "email_not_configured", subject: input.subject }));
    return false;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
    }),
  });

  if (!response.ok) {
    console.error(
      JSON.stringify({ msg: "email_send_failed", status: response.status, body: await response.text() }),
    );
    return false;
  }
  return true;
}

export function passwordResetEmail(resetUrl: string): Pick<SendEmailInput, "subject" | "html" | "text"> {
  return {
    subject: "Reset your LiveTrack password",
    text: `We received a request to reset your LiveTrack password.\n\nReset it here (link expires in 30 minutes):\n${resetUrl}\n\nIf you did not request this, you can safely ignore this email.`,
    html: `<!doctype html><html><body style="font-family:system-ui,sans-serif;color:#0a0a0a;background:#fafafa;padding:32px">
<div style="max-width:480px;margin:0 auto;background:#ffffff;border:1px solid #e5e5e5;border-radius:12px;padding:32px">
<h1 style="font-size:18px;margin:0 0 16px">Reset your password</h1>
<p style="font-size:14px;line-height:1.6;color:#404040">We received a request to reset your LiveTrack password. This link expires in 30&nbsp;minutes.</p>
<p style="margin:24px 0"><a href="${resetUrl}" style="background:#0a0a0a;color:#ffffff;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:14px">Reset password</a></p>
<p style="font-size:12px;color:#737373">If you did not request this, you can safely ignore this email. Your password will not change.</p>
</div></body></html>`,
  };
}
