/**
 * Optional Telegram admin alerts — only for consent-based events (e.g. user
 * explicitly started a sharing session). Configure via secrets:
 *   TELEGRAM_BOT_TOKEN, TELEGRAM_ADMIN_CHAT_ID
 */

export async function sendTelegramMessage(env: CloudflareEnv, text: string): Promise<boolean> {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_ADMIN_CHAT_ID) {
    return false;
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: env.TELEGRAM_ADMIN_CHAT_ID,
          text,
          parse_mode: "HTML",
          disable_web_page_preview: false,
        }),
      },
    );
    return response.ok;
  } catch (error) {
    console.error(JSON.stringify({ msg: "telegram_send_failed", error: String(error) }));
    return false;
  }
}

export function googleMapsLink(lat: number, lng: number): string {
  return `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}`;
}

/** Notifies admins when a user knowingly starts location sharing. */
export async function notifyAdminsSessionStarted(
  env: CloudflareEnv,
  input: {
    userName: string;
    userEmail: string;
    sessionId: string;
    label?: string;
    lat?: number | null;
    lng?: number | null;
  },
): Promise<void> {
  const maps =
    input.lat != null && input.lng != null
      ? `\n📍 <a href="${googleMapsLink(input.lat, input.lng)}">View on Google Maps</a>`
      : "\n📍 Awaiting first GPS fix…";

  const text =
    `<b>LiveTrack — Session started</b>\n` +
    `User: ${escapeHtml(input.userName)} (${escapeHtml(input.userEmail)})\n` +
    `Session: <code>${input.sessionId.slice(0, 8)}</code>\n` +
    (input.label ? `Label: ${escapeHtml(input.label)}\n` : "") +
    `Consent: explicit ✓` +
    maps;

  await sendTelegramMessage(env, text);
}

function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
