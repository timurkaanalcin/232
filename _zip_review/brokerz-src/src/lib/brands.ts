/**
 * Multi-tenant brand resolution — mirrors production on *.customer.org.tr
 * (see live bundle `Fx` / `Je` / `$e` host routing).
 */

export type BrandId = "ubs" | "7fx" | "brokerz";

export interface BrandHost {
  id: BrandId;
  host: string;
  origin: string;
  brandName: string;
  label: string;
}

export interface CrmHost {
  id: string;
  host: string;
  origin: string;
  brandId: BrandId;
  label: string;
}

export interface BrandTheme {
  id: BrandId;
  name: string;
  nameUpper: string;
  legalName: string;
  short: string;
  domain: string;
  origin: string;
  supportEmail: string;
  adminEmail: string;
  logo: string;
  logoAlt: string;
  accountPrefix: string;
  otpIssuer: string;
  themeColor: string;
  accent: string;
  accentHover: string;
  accentInk: string;
  accentSoft: string;
  ink: string;
  isCrm: boolean;
}

export const BRAND_HOSTS: BrandHost[] = [
  {
    id: "ubs",
    host: "ubs.customer.org.tr",
    origin: "https://ubs.customer.org.tr",
    brandName: "UBS",
    label: "UBS",
  },
  {
    id: "7fx",
    host: "7fx.customer.org.tr",
    origin: "https://7fx.customer.org.tr",
    brandName: "7FX",
    label: "7FX",
  },
  {
    id: "brokerz",
    host: "tickbase.customer.org.tr",
    origin: "https://tickbase.customer.org.tr",
    brandName: "Tickbase",
    label: "Tickbase",
  },
];

export const CRM_HOSTS: CrmHost[] = [
  {
    id: "crmubs",
    host: "crmubs.customer.org.tr",
    origin: "https://crmubs.customer.org.tr",
    brandId: "ubs",
    label: "UBS CRM",
  },
  {
    id: "crmbrokerz",
    host: "crmtickbase.customer.org.tr",
    origin: "https://crmtickbase.customer.org.tr",
    brandId: "brokerz",
    label: "Tickbase CRM",
  },
  {
    id: "crm7fx",
    host: "crm7fx.customer.org.tr",
    origin: "https://crm7fx.customer.org.tr",
    brandId: "7fx",
    label: "7FX CRM",
  },
];

/** Legacy host aliases → brand id */
const HOST_ALIASES: Record<string, BrandId> = {
  "brokerz.customer.org.tr": "brokerz",
  "crmbrokerz.customer.org.tr": "brokerz",
};

const ACCENT_GOLD = "#E8B923";
const ACCENT_GOLD_HOVER = "#C9A017";
const ACCENT_UBS = "#E60000";
const INK = "#0a0a0a";

/** Default brand when host cannot be resolved (matches production `Ka`) */
export const DEFAULT_BRAND: BrandHost =
  BRAND_HOSTS.find((b) => b.id === "brokerz") ?? BRAND_HOSTS[0];

function hexToRgba(hex: string, alpha: number): string {
  const n = hex.replace("#", "");
  const v = parseInt(n, 16);
  return `rgba(${(v >> 16) & 255}, ${(v >> 8) & 255}, ${v & 255}, ${alpha})`;
}

function logoFor(brand: BrandHost): string {
  if (brand.id === "brokerz") return "/tickbase-logo.svg";
  if (brand.id === "7fx") return "/7fx-logo.png";
  return "/ubs-logo.png";
}

/** Production `Fx(hostname)` — resolve customer brand host */
export function resolveBrandHost(hostname: string | null | undefined): BrandHost | null {
  const host = (hostname || "").toLowerCase().replace(/\.$/, "");
  if (!host) return null;
  const exact = BRAND_HOSTS.find((b) => b.host === host || host.endsWith(`.${b.host}`));
  if (exact) return exact;
  const alias = HOST_ALIASES[host];
  return alias ? BRAND_HOSTS.find((b) => b.id === alias) ?? null : null;
}

/** Production `oc(hostname)` — resolve CRM host */
export function resolveCrmHost(hostname: string | null | undefined): CrmHost | null {
  const host = (hostname || "").toLowerCase().replace(/\.$/, "");
  if (!host) return null;
  const exact = CRM_HOSTS.find((c) => c.host === host || host.endsWith(`.${c.host}`));
  if (exact) return exact;
  if (host === "crmbrokerz.customer.org.tr") {
    return CRM_HOSTS.find((c) => c.brandId === "brokerz") ?? null;
  }
  return null;
}

/** Localhost query overrides: `?brand=ubs` / `?crm=1` / `?crm=crmubs` */
export function readLocalBrandOverrides(): {
  brandId?: BrandId;
  crm?: boolean;
  crmId?: string;
} {
  if (typeof window === "undefined") return {};
  try {
    const params = new URLSearchParams(window.location.search);
    const raw = (params.get("brand") || "").toLowerCase();
    const brandId = BRAND_HOSTS.some((b) => b.id === raw) ? (raw as BrandId) : undefined;
    const crmRaw = (params.get("crm") || "").toLowerCase();
    if (crmRaw === "1" || crmRaw === "true" || crmRaw === "yes") {
      return { brandId, crm: true };
    }
    if (crmRaw) {
      const crm = CRM_HOSTS.find((c) => c.id === crmRaw || c.host.startsWith(crmRaw));
      if (crm) return { brandId: crm.brandId, crm: true, crmId: crm.id };
    }
    return { brandId };
  } catch {
    return {};
  }
}

export function resolveActiveBrandHost(): BrandHost {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname.toLowerCase();
    const crm = resolveCrmHost(hostname);
    if (crm) {
      return BRAND_HOSTS.find((b) => b.id === crm.brandId) ?? DEFAULT_BRAND;
    }
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      const overrides = readLocalBrandOverrides();
      if (overrides.brandId) {
        return BRAND_HOSTS.find((b) => b.id === overrides.brandId) ?? DEFAULT_BRAND;
      }
      // Local default: UBS (this package is the UBS customer app shell)
      return BRAND_HOSTS.find((b) => b.id === "ubs") ?? DEFAULT_BRAND;
    }
    const byHost = resolveBrandHost(hostname);
    if (byHost) return byHost;
  }
  return DEFAULT_BRAND;
}

export function resolveActiveCrmHost(): CrmHost | null {
  if (typeof window === "undefined") return null;
  const hostname = window.location.hostname.toLowerCase();
  const crm = resolveCrmHost(hostname);
  if (crm) return crm;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    const overrides = readLocalBrandOverrides();
    if (overrides.crm) {
      const brandId = overrides.brandId || resolveActiveBrandHost().id;
      if (overrides.crmId) {
        return CRM_HOSTS.find((c) => c.id === overrides.crmId) ?? null;
      }
      return CRM_HOSTS.find((c) => c.brandId === brandId) ?? null;
    }
  }
  return null;
}

export function isCrmMode(): boolean {
  if (typeof window === "undefined") return false;
  if (resolveCrmHost(window.location.hostname)) return true;
  return !!resolveActiveCrmHost();
}

export function shouldForceAdminView(): boolean {
  if (typeof window === "undefined") return false;
  if (resolveCrmHost(window.location.hostname)) return true;
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  if (path === "/admin" || path === "/crm") return true;
  const hash = window.location.hash.replace(/^#\/?/, "");
  return hash === "admin" || hash === "crm" || hash.startsWith("admin/") || hash.startsWith("crm/");
}

export function buildBrandTheme(brand: BrandHost, crmHost?: string | null): BrandTheme {
  const accent =
    brand.id === "7fx" ? "#6aff41" : brand.id === "brokerz" ? ACCENT_GOLD : ACCENT_UBS;
  return {
    id: brand.id,
    name: brand.brandName,
    nameUpper: brand.brandName.toUpperCase(),
    legalName: brand.id === "ubs" ? "UBS Group AG" : `${brand.brandName} Trading Ltd.`,
    short: brand.brandName,
    domain: crmHost || brand.host,
    origin: crmHost ? `https://${crmHost}` : brand.origin,
    supportEmail: `support@${brand.host}`,
    adminEmail:
      brand.id === "brokerz"
        ? "admin@tickbase.com"
        : brand.id === "ubs"
          ? "admin@ubs.com"
          : brand.id === "7fx"
            ? "admin@7fx.com"
            : `admin@${brand.id}.customer.org.tr`,
    logo: logoFor(brand),
    logoAlt: brand.brandName,
    accountPrefix: brand.id === "ubs" ? "UBS" : brand.id === "7fx" ? "7FX" : "TB",
    otpIssuer: brand.brandName,
    themeColor: accent,
    accent,
    accentHover:
      brand.id === "7fx" ? "#42e020" : brand.id === "brokerz" ? ACCENT_GOLD_HOVER : "#c40000",
    accentInk: brand.id === "ubs" ? "#ffffff" : INK,
    accentSoft: hexToRgba(accent, 0.18),
    ink: INK,
    isCrm: !!crmHost,
  };
}

export function getBrandTheme(): BrandTheme {
  const crm = resolveActiveCrmHost();
  const brand = resolveActiveBrandHost();
  return buildBrandTheme(brand, crm?.host);
}

/** Apply CSS variables used by customer shell / landing */
export function applyBrandTheme(root: HTMLElement = document.documentElement): BrandTheme {
  const theme = getBrandTheme();
  root.style.setProperty("--brand-accent", theme.accent);
  root.style.setProperty("--brand-accent-hover", theme.accentHover);
  root.style.setProperty("--brand-accent-ink", theme.accentInk);
  root.style.setProperty("--brand-accent-soft", theme.accentSoft);
  root.style.setProperty("--ot-accent", theme.accent);

  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) metaTheme.setAttribute("content", theme.themeColor);

  document.title = theme.name;
  const appTitle = document.querySelector('meta[name="apple-mobile-web-app-title"]');
  if (appTitle) appTitle.setAttribute("content", theme.name);

  root.dataset.brand = theme.id;
  return theme;
}

export function brandLandingTheme(brandId: BrandId = resolveActiveBrandHost().id): "olymp" | "ubs" {
  // 7FX uses the lime Olymp-style landing; UBS/Tickbase use the red/black UBS shell.
  return brandId === "7fx" ? "olymp" : "ubs";
}
