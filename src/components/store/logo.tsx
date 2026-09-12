import Link from "next/link";
import { cn } from "@/lib/utils";

export function PistaMark({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 font-semibold tracking-tight", className)}>
      <span
        className={cn(
          "relative flex size-8 items-center justify-center rounded-lg",
          light ? "bg-amber-400 text-[#0B1F3A]" : "bg-[#0B1F3A] text-amber-400",
        )}
      >
        <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden>
          <path
            d="M4 16c2.2-1.4 4.4-4.8 8-4.8S17.8 14.6 20 16"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path d="M5 16.5h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="8" cy="17.2" r="1.15" fill="currentColor" />
          <circle cx="16" cy="17.2" r="1.15" fill="currentColor" />
        </svg>
      </span>
      <span className={light ? "text-white" : "text-foreground"}>
        Pista
        <span className={light ? "text-amber-300" : "text-amber-600"}>.</span>
      </span>
    </span>
  );
}

export function PistaLogo({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center">
      <PistaMark className={className} light={light} />
    </Link>
  );
}
