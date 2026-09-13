import type { Metadata } from "next";
import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Gizlilik",
  description: `${APP_NAME} konum ve hesap verilerini yalnızca açık rızanızla işler.`,
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <p className="hud-label mb-2">KVKK / GDPR</p>
      <h1 className="text-3xl font-semibold tracking-tight">Gizlilik bildirimi</h1>
      <p className="mt-3 text-sm text-muted-foreground">
          {APP_NAME} bir izin-öncelikli konum paylaşım ürünüdür. Gizli izleme, ekran kaydı, tuş kaydı veya
          yetkisiz uzaktan kontrol yoktur. İlk açılışta konum ve bildirimler tek tek, kapalı başlayarak sorulur.
        </p>

      <section className="mt-8 grid gap-6 text-sm leading-relaxed">
        <div>
          <h2 className="font-semibold">Ne toplanır</h2>
          <p className="mt-2 text-muted-foreground">
            Hesap bilgileri (ad, e-posta) ve sizin başlattığınız cihaz oturumları. Konum (koordinat,
            doğruluk, hız, yön) yalnızca açık onay kutusunu işaretleyip paylaşımı başlattığınız sürece
            kaydedilir. Uygulama içi konum iznini ilk açılış ekranından veya Ayarlar’dan kapatabilirsiniz;
            cihaz ayarlarından da geri alabilirsiniz.
          </p>
        </div>
        <div>
          <h2 className="font-semibold">Paylaşımı durdurma</h2>
          <p className="mt-2 text-muted-foreground">
            Komuta panelinden veya Ayarlar → Gizlilik üzerinden paylaşımı anında durdurabilirsiniz. İzin
            geri alınır, sunucu yayını kesilir ve işlem audit kaydına yazılır.
          </p>
        </div>
        <div>
          <h2 className="font-semibold">Haklarınız</h2>
          <p className="mt-2 text-muted-foreground">
            Verilerinizi dışa aktarabilir veya hesabınızı kalıcı silebilirsiniz (GDPR/KVKK).
          </p>
        </div>
      </section>

      <p className="mt-10 text-sm">
        <Link href="/" className="text-primary hover:underline">
          Ana sayfa
        </Link>
        {" · "}
        <Link href="/sartlar" className="text-primary hover:underline">
          Kullanım şartları
        </Link>
        {" · "}
        <Link href="/settings" className="text-primary hover:underline">
          Gizlilik ayarları
        </Link>
      </p>
    </main>
  );
}
