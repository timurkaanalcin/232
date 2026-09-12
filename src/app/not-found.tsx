import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[#F6F3EE] p-6 text-center">
      <h1 className="text-3xl font-semibold">Sayfa bulunamadı</h1>
      <p className="max-w-sm text-sm text-slate-600">Aradığınız sayfa taşınmış veya hiç var olmamış olabilir.</p>
      <Button asChild className="bg-[#0B1F3A]">
        <Link href="/">Ana sayfaya dön</Link>
      </Button>
    </div>
  );
}
