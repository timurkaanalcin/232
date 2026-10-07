import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X, Bot, UserRound } from "lucide-react";
import { createSupportTicket } from "@/lib/adminOps";
import { getCustomerSession } from "@/lib/customerAuth";
import { getBrandTheme } from "@/lib/brands";

type Msg = { id: string; role: "user" | "bot"; text: string };

function aiReply(input: string): string {
  const brand = getBrandTheme().name;
  const q = input.toLowerCase();
  if (/temsilci|agent|insan|operatör|operator/.test(q)) return "HAND_OFF";
  if (/para yat|deposit|yatır/.test(q))
    return "Para yatırmak için İşlem üstündeki Yatır butonunu kullanın. Kart veya havale. Min $10.";
  if (/çek|withdraw|iban/.test(q))
    return "Hesap sekmesinden çekim yapın (IBAN + OTP). Admin onayı gerekir.";
  if (/kyc|kimlik/.test(q)) return "KYC sekmesinden belge yükleyin; admin onaylar.";
  if (/pin|otp|2fa|giriş/.test(q)) return "Giriş: e-posta OTP + PIN (+ 2FA). Biyometrik açılabilir.";
  if (/merhaba|selam|hello|hi\b/.test(q))
    return `Merhaba! ${brand} AI destek. İnsan agent için 'temsilci' yazın.`;
  return "Para yatırma, çekme, KYC veya 'temsilci' yazabilirsiniz.";
}

export default function AiSupportChat() {
  const brandName = getBrandTheme().name;
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      id: "welcome",
      role: "bot",
      text: `Merhaba — ${brandName} AI. 'temsilci' ile insan agent'a aktarın.`,
    },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, open]);

  const handOff = (message: string) => {
    const session = getCustomerSession();
    const t = createSupportTicket({
      customerId: session?.id,
      email: session?.email,
      name: session?.name,
      subject: "Canlı destek talebi",
      message,
    });
    setTicketId(t.id);
    setMsgs((m) => [
      ...m,
      {
        id: `b_${Date.now()}`,
        role: "bot",
        text: `Ticket #${t.id.slice(-6)} açıldı. Temsilci admin panelinden yanıtlayacak.`,
      },
    ]);
  };

  const send = () => {
    const value = text.trim();
    if (!value) return;
    setMsgs((m) => [...m, { id: `u_${Date.now()}`, role: "user", text: value }]);
    setText("");
    window.setTimeout(() => {
      const reply = aiReply(value);
      if (reply === "HAND_OFF" || ticketId) {
        handOff(value);
        return;
      }
      setMsgs((m) => [...m, { id: `b_${Date.now()}`, role: "bot", text: reply }]);
    }, 350);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-20 end-4 z-[65] flex h-14 w-14 items-center justify-center rounded-full bg-[#E60000] text-white shadow-xl sm:bottom-6"
        aria-label="Canlı destek"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {open && (
        <div className="fixed inset-x-3 bottom-24 z-[70] mx-auto flex max-h-[70dvh] w-auto max-w-md flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl sm:inset-x-auto sm:end-4 sm:bottom-24">
          <div className="flex items-center justify-between bg-[#E60000] px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              <div>
                <div className="text-[13px] font-bold">Canlı destek · AI</div>
                <div className="text-[10px] text-white/80">
                  {ticketId ? `Ticket #${ticketId.slice(-6)}` : "temsilciye aktarılabilir"}
                </div>
              </div>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="rounded-full p-1 hover:bg-white/15">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto bg-[#f7f7f8] px-3 py-3">
            {msgs.map((m) => (
              <div
                key={m.id}
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-[13px] ${
                  m.role === "user" ? "ml-auto bg-[#E60000] text-white" : "mr-auto bg-white shadow-sm"
                }`}
              >
                {m.text}
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <div className="flex gap-2 border-t border-black/8 p-2">
            <button
              type="button"
              onClick={() => {
                setMsgs((m) => [...m, { id: `u_${Date.now()}`, role: "user", text: "temsilci istiyorum" }]);
                handOff("temsilci istiyorum");
              }}
              className="rounded-xl border border-black/10 px-2"
              title="Temsilci"
            >
              <UserRound className="h-4 w-4" />
            </button>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Mesaj…"
              className="min-w-0 flex-1 rounded-xl border border-black/10 px-3 py-2 text-[13px] outline-none"
            />
            <button type="button" onClick={send} className="rounded-xl bg-black px-3 text-white">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
