import { SITE_NAME } from "@/modules/marketing/news-articles";
import { cn } from "@/lib/utils";

export function FinanceLogo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-semibold tracking-tight", className)}>
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden>
          <path
            d="M4 16l4-5 3 3 5-7 4 4"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="text-[17px]">{SITE_NAME}</span>
    </span>
  );
}
