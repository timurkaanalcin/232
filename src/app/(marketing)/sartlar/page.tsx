import type { Metadata } from "next";
import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Kullanım şartları",
  description: `${APP_NAME} kullanım koşulları — izin temelli konum paylaşımı.`,
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <p className="hud-label mb-2">Hesap</p>
      <h1 className="text-3xl font-semibold tracking-tight">Kullanım şartları</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {APP_NAME} yalnızca meşru, rızaya dayalı konum paylaşımı ve operasyon araçları sunar. Ürünü başka
        birinin bilgisi veya onayı olmadan izlemek için kullanmak yasaktır.
      </p>

      <section className="mt-8 grid gap-6 text-sm leading-relaxed">
        <div>
          <h2 className="font-semibold">Açık rıza</h2>
          <p className="mt-2 text-muted-foreground">
            Konum oturumu, tarayıcı izni ve uygulama içi onay olmadan başlatılamaz. Operatörler yalnızca bu
            oturumları görebilir; her görüntüleme ve durdurma kayda geçer.
          </p>
        </div>
        <div>
          <h2 className="font-semibold">Hesap güvenliği</h2>
          <p className="mt-2 text-muted-foreground">
            Cihaz oturumlarınızı yönetmek, tanımadığınız cihazları kapatmak ve şifrenizi değiştirmek sizin
            sorumluluğunuzdadır.
          </p>
        </div>
      </section>

      <p className="mt-10 text-sm">
        <Link href="/" className="text-primary hover:underline">
          Ana sayfa
        </Link>
        {" · "}
        <Link href="/gizlilik" className="text-primary hover:underline">
          Gizlilik
        </Link>
      </p>
    </main>
  );
}
