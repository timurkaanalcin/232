import Link from "next/link";
import { PistaLogo } from "@/components/store/logo";
import { BRAND, TRUST } from "@/lib/brand";

const COLUMNS = [
  {
    title: "Keşfet",
    links: [
      { href: "/araclar", label: "Satılık araçlar" },
      { href: "/sat", label: "Aracını sat" },
      { href: "/finansman", label: "Finansman" },
      { href: "/garanti", label: "Garanti ve iade" },
    ],
  },
  {
    title: "Şirket",
    links: [
      { href: "/hakkimizda", label: "Hakkımızda" },
      { href: "/merkezler", label: "Müşteri merkezleri" },
      { href: "/nasil-calisir", label: "Nasıl çalışır" },
      { href: "/iletisim", label: "İletişim" },
    ],
  },
  {
    title: "Destek",
    links: [
      { href: "/sss", label: "Sıkça sorulanlar" },
      { href: "/yasal/kullanim-kosullari", label: "Kullanım koşulları" },
      { href: "/yasal/kvkk", label: "KVKK" },
      { href: "/yasal/cerezler", label: "Çerezler" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-16 bg-[#0B1F3A] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4">
        <div>
          <PistaLogo light />
          <p className="mt-4 max-w-xs text-sm text-white/70">{BRAND.description}</p>
          <p className="mt-4 text-sm text-amber-300">
            {TRUST.inspectionPoints} puan · {TRUST.returnDays} gün iade · {TRUST.warrantyMonths} ay garanti
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/50">{col.title}</h3>
            <ul className="mt-4 grid gap-2 text-sm">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/80 hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-white/50 sm:flex-row sm:justify-between">
          <p>
            © {new Date().getFullYear()} {BRAND.legalName}. Tüm hakları saklıdır.
          </p>
          <p>
            {BRAND.email} · {BRAND.phone}
          </p>
        </div>
      </div>
    </footer>
  );
}
