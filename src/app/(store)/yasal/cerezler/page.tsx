import type { Metadata } from "next";

export const metadata: Metadata = { title: "Çerez politikası" };

export default function CookiesPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold">Çerez politikası</h1>
      <p className="mt-6 text-slate-700">
        Oturum, tercih (favoriler) ve güvenlik çerezleri kullanılır. Zorunlu çerezler dışında tercihlerinizi tarayıcı
        ayarlarından yönetebilirsiniz.
      </p>
    </article>
  );
}
