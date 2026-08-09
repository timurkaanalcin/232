/** Cloudflare Worker adı — workers.dev URL'sinin ilk parçası */
export const WORKER_NAME = "als-yatirim";

/**
 * Hesap workers.dev alt alanı (Cloudflare dashboard).
 * Tam URL: https://{WORKER_NAME}.{WORKERS_SUBDOMAIN}.workers.dev
 */
export const WORKERS_SUBDOMAIN = "timurkaanalcin";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  `https://${WORKER_NAME}.${WORKERS_SUBDOMAIN}.workers.dev`;
