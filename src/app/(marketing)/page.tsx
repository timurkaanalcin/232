import Link from "next/link";
import type { Metadata } from "next";
import {
  ActivityIcon,
  ArrowRightIcon,
  BellIcon,
  DownloadIcon,
  FileCheck2Icon,
  FingerprintIcon,
  GaugeIcon,
  LockIcon,
  MapPinIcon,
  RadioIcon,
  ScrollTextIcon,
  ShieldCheckIcon,
  Trash2Icon,
  UsersIcon,
} from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "LiveTrack — Consent-first real-time location sharing",
  description:
    "Enterprise-grade real-time location sharing with explicit consent, full audit trails, live maps and GDPR/KVKK-compliant data handling.",
};

const FEATURES = [
  {
    icon: RadioIcon,
    title: "Consent-first sharing",
    text: "Nothing is transmitted until a user grants browser permission and accepts an explicit consent screen.",
  },
  {
    icon: MapPinIcon,
    title: "Live maps on OpenStreetMap",
    text: "Real-time markers with accuracy radius, route history and session playback — no proprietary map lock-in.",
  },
  {
    icon: ActivityIcon,
    title: "Realtime command center",
    text: "Durable-Object-powered WebSockets stream positions to an admin live map with sub-second latency.",
  },
  {
    icon: UsersIcon,
    title: "Role-based access",
    text: "Super Admin, Admin, Operator and Viewer roles with granular permissions enforced end to end.",
  },
  {
    icon: ScrollTextIcon,
    title: "Full audit trail",
    text: "Every login, consent, session and admin view is recorded in an append-only audit log.",
  },
  {
    icon: BellIcon,
    title: "Session lifecycle",
    text: "Start, stop, auto-timeout and admin termination — with device, browser and IP context on every session.",
  },
];

const SECURITY = [
  { icon: LockIcon, label: "JWT sessions with server-side revocation" },
  { icon: FingerprintIcon, label: "PBKDF2 password hashing (Web Crypto)" },
  { icon: ShieldCheckIcon, label: "CSRF, XSS & strict Content-Security-Policy" },
  { icon: GaugeIcon, label: "Distributed rate limiting at the edge" },
];

const COMPLIANCE = [
  {
    icon: FileCheck2Icon,
    title: "Lawful basis by design",
    text: "Consent is captured with a timestamp and stored against each session. No legitimate-interest loopholes.",
  },
  {
    icon: DownloadIcon,
    title: "Right of access",
    text: "Users export every byte of their personal data — profile, sessions, points and audit trail — as JSON.",
  },
  {
    icon: Trash2Icon,
    title: "Right to erasure",
    text: "One action permanently deletes the account and cascades to all location history and sessions.",
  },
];

const FAQ = [
  {
    q: "Can someone be tracked without knowing?",
    a: "No. Sharing requires both an OS/browser permission prompt and an explicit in-app consent step. There is no silent or background tracking, and sessions stop the instant a user presses Stop.",
  },
  {
    q: "Where is location data stored?",
    a: "In Cloudflare D1 at the edge. Coordinates are only written while a session is active, and they are deleted when the user deletes their account.",
  },
  {
    q: "Is it really GDPR / KVKK compliant?",
    a: "The architecture is built around consent, data minimization, full auditability, data export and erasure. You remain the data controller and configure retention to your policy.",
  },
  {
    q: "Does it run on free infrastructure?",
    a: "Yes. It deploys to Cloudflare's free tier — Workers, D1 and Durable Objects — and uses OpenStreetMap tiles, so there are no map licensing fees.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#security" className="hover:text-foreground">Security</a>
            <a href="#compliance" className="hover:text-foreground">Compliance</a>
            <a href="#faq" className="hover:text-foreground">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-accent/40 to-background" />
          <div className="absolute inset-0 -z-10 opacity-[0.04] [background-image:radial-gradient(circle_at_1px_1px,currentColor_1px,transparent_0)] [background-size:32px_32px]" />
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
            <div className="mx-auto max-w-3xl text-center">
              <Badge variant="secondary" className="mb-5">
                <ShieldCheckIcon className="size-3.5" /> GDPR &amp; KVKK compliant
              </Badge>
              <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
                Real-time location sharing, <span className="text-primary">built on consent</span>
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg text-muted-foreground">
                LiveTrack is an enterprise platform for sharing live location with full transparency — explicit
                consent, complete audit trails, and the right to stop and erase at any moment.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button size="lg" asChild>
                  <Link href="/register">
                    Start sharing securely <ArrowRightIcon />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/login">Sign in</Link>
                </Button>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                No credit card · Runs on Cloudflare free tier · Open map data
              </p>
            </div>

            {/* Product preview */}
            <div className="mx-auto mt-16 max-w-5xl">
              <div className="overflow-hidden rounded-xl border bg-card shadow-2xl shadow-primary/5">
                <div className="flex items-center gap-1.5 border-b bg-muted/50 px-4 py-3">
                  <span className="size-3 rounded-full bg-destructive/60" />
                  <span className="size-3 rounded-full bg-amber-400/60" />
                  <span className="size-3 rounded-full bg-emerald-400/60" />
                  <span className="ml-3 text-xs text-muted-foreground">livetrack · command center</span>
                </div>
                <div className="grid gap-px bg-border sm:grid-cols-3">
                  {[
                    { label: "Active sessions", value: "128" },
                    { label: "Online users", value: "342" },
                    { label: "Avg. latency", value: "180 ms" },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-card p-5">
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                      <p className="mt-1 text-3xl font-semibold tabular-nums">{stat.value}</p>
                    </div>
                  ))}
                </div>
                <div className="relative h-56 bg-gradient-to-br from-primary/10 via-accent/30 to-background">
                  <div className="absolute inset-0 [background-image:radial-gradient(circle_at_1px_1px,currentColor_1px,transparent_0)] opacity-[0.06] [background-size:24px_24px]" />
                  {[
                    "left-[20%] top-[40%]",
                    "left-[55%] top-[30%]",
                    "left-[70%] top-[60%]",
                    "left-[38%] top-[68%]",
                  ].map((pos) => (
                    <span key={pos} className={`absolute ${pos}`}>
                      <span className="relative flex size-3">
                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" />
                        <span className="relative inline-flex size-3 rounded-full bg-primary ring-2 ring-background" />
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
          <SectionHeading
            eyebrow="Features"
            title="Everything you need to share location responsibly"
            subtitle="A complete platform — from the consent screen to the admin command center."
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <Card key={feature.title}>
                <CardContent className="p-6">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-accent text-primary">
                    <feature.icon className="size-5" />
                  </div>
                  <h3 className="mt-4 font-semibold">{feature.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{feature.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Security */}
        <section id="security" className="scroll-mt-20 border-y bg-muted/30">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center">
            <div>
              <SectionHeading
                align="left"
                eyebrow="Security"
                title="Hardened from the edge inward"
                subtitle="Defense-in-depth across authentication, transport and data access."
              />
              <ul className="mt-8 grid gap-3">
                {SECURITY.map((item) => (
                  <li key={item.label} className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-lg bg-card text-primary shadow-sm">
                      <item.icon className="size-4" />
                    </span>
                    <span className="text-sm font-medium">{item.label}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Card className="bg-card/80">
              <CardContent className="grid gap-4 p-6">
                {[
                  { label: "Transport", value: "HTTPS-only · HSTS preload · secure cookies" },
                  { label: "Headers", value: "CSP · X-Frame-Options · no sniff · Referrer-Policy" },
                  { label: "Sessions", value: "JWT + server-side device revocation" },
                  { label: "Abuse", value: "Per-IP & per-user rate limits at the edge" },
                ].map((row) => (
                  <div key={row.label} className="flex items-start justify-between gap-4 border-b pb-3 last:border-0 last:pb-0">
                    <span className="text-sm font-medium">{row.label}</span>
                    <span className="text-right text-sm text-muted-foreground">{row.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Compliance */}
        <section id="compliance" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
          <SectionHeading
            eyebrow="Compliance"
            title="Privacy is the default, not a setting"
            subtitle="Designed around the GDPR and KVKK principles of consent, minimization and user control."
          />
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {COMPLIANCE.map((item) => (
              <Card key={item.title}>
                <CardContent className="p-6">
                  <item.icon className="size-6 text-primary" />
                  <h3 className="mt-4 font-semibold">{item.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{item.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-20 border-t bg-muted/30">
          <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
            <SectionHeading eyebrow="FAQ" title="Questions, answered" />
            <div className="mt-10 grid gap-3">
              {FAQ.map((item) => (
                <details key={item.q} className="group rounded-lg border bg-card p-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
                    {item.q}
                    <ArrowRightIcon className="size-4 transition-transform group-open:rotate-90" />
                  </summary>
                  <p className="mt-2 text-sm text-muted-foreground">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Contact / CTA */}
        <section id="contact" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
          <Card className="overflow-hidden border-primary/30 bg-gradient-to-br from-primary/10 to-accent/30">
            <CardContent className="flex flex-col items-center gap-5 p-10 text-center sm:p-14">
              <h2 className="text-balance text-3xl font-semibold tracking-tight">
                Ready to deploy consent-first location sharing?
              </h2>
              <p className="max-w-xl text-muted-foreground">
                Spin up your own instance on Cloudflare in minutes, or reach out to talk through an enterprise
                rollout.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button size="lg" asChild>
                  <Link href="/register">Create your account</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="mailto:hello@livetrack.example">Contact us</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <Logo />
          <p>© {new Date().getFullYear()} LiveTrack. Consent-first location sharing.</p>
          <div className="flex gap-4">
            <Link href="/login" className="hover:text-foreground">Sign in</Link>
            <Link href="/register" className="hover:text-foreground">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-xl"}>
      <p className="text-sm font-semibold uppercase tracking-wider text-primary">{eyebrow}</p>
      <h2 className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-3 text-pretty text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
