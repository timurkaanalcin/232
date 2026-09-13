import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-semibold tracking-tight", className)}>
      <span className="relative flex size-7 items-center justify-center rounded-sm border border-primary/40 bg-primary/15 text-primary">
        <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden>
          <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
          <path d="M12 3.5v3M12 17.5v3M3.5 12h3M17.5 12h3" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
        </svg>
        <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-emerald-400 ring-2 ring-background" />
      </span>
      <span className="font-mono text-[13px] uppercase tracking-[0.18em]">
        Canlı<span className="text-primary">Site</span>
      </span>
    </span>
  );
}
