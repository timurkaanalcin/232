import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-semibold tracking-tight", className)}>
      <span className="relative flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden>
          <path
            d="M4 7.5h16M7 4.5h10a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-9a3 3 0 0 1 3-3Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M8 12h3M8 15h6M15 12h1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-emerald-400 ring-2 ring-background" />
      </span>
      <span>
        CRM<span className="text-primary">Nexus</span>
      </span>
    </span>
  );
}
