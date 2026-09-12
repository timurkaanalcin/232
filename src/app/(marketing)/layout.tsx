import { FinanceShell } from "@/modules/finance/finance-shell";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <FinanceShell>{children}</FinanceShell>;
}
