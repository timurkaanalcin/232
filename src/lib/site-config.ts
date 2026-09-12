/** Cloudflare Worker adı — workers.dev URL'sinin ilk parçası */
export const WORKER_NAME = "borsahatti";

/**
 * Hesap workers.dev alt alanı (Cloudflare dashboard).
 * Tam URL: https://{WORKER_NAME}.{WORKERS_SUBDOMAIN}.workers.dev
 */
export const WORKERS_SUBDOMAIN = "timurkaanalcin";

/** Natro üzerinde yönetilen kanonik üretim adresi */
export const CUSTOM_DOMAIN = "googlefinance.login.org.tr";

export const WORKERS_DEV_URL = `https://${WORKER_NAME}.${WORKERS_SUBDOMAIN}.workers.dev`;

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? `https://${CUSTOM_DOMAIN}`;
