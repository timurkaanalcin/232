import PageHeader from "@/components/PageHeader";
import { Mail, Phone, MessageCircle, Clock, MapPin, ArrowRight, HelpCircle, ChevronDown } from "lucide-react";
import { useState } from "react";

interface Props {
  onLaunchTerminal: () => void;
}

const FAQS = [
  { q: "How do I open an account with BROKERZ?", a: "Simply click 'Launch Platform' or 'Open Account', complete the registration form, upload your documents, and once approved, you can create your Live Trading account and make a deposit." },
  { q: "What is the minimum deposit?", a: "The minimum deposit for all account types is $100. You can fund your account via bank transfer, crypto payments, Visa/Mastercard, Skrill, Neteller, and more." },
  { q: "What platforms are available?", a: "BROKERZ offers MetaTrader 4, MetaTrader 5, TradingView, and our mobile-first BROKERZ Trader app. All platforms support full trading functionality." },
  { q: "What is the maximum leverage?", a: "The maximum leverage across all account types is 1:1000. This can be adjusted in your Client Area based on your risk preferences." },
  { q: "How fast is execution?", a: "Our average execution speed is 0.15 seconds with no rejections and no re-quotes. We use STP (straight-through processing) with no dealing desk intervention." },
  { q: "Can I use Expert Advisors (EAs)?", a: "Yes, Expert Advisors are fully supported on MT4 and MT5. We also offer free VPS hosting for your EAs so they can run 24/7 without interruption." },
  { q: "Is BROKERZ regulated?", a: "Yes, BROKERZ is regulated by the FCA (UK), CySEC (Cyprus), FSCA (South Africa), and FSA (Seychelles). We operate under strict regulatory standards across all jurisdictions." },
  { q: "How do deposits and withdrawals work?", a: "Deposits and withdrawals are processed quickly through multiple payment methods. Most deposits are instant, and withdrawals are typically processed within 1 business day." },
];

export default function SupportPage({ onLaunchTerminal }: Props) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div>
      <PageHeader
        title="Support"
        subtitle="We're here to help. Contact our multilingual support team, browse our FAQ, or access our help centre — available 24/5."
        breadcrumb="Home / Support"
      />

      {/* Contact methods */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="grid gap-6 md:grid-cols-3">
            <ContactCard icon={Mail} title="Email Us" value="support@brokerz.com" desc="We respond within 24 hours" />
            <ContactCard icon={Phone} title="Call Us" value="+44 20 7190 9935" desc="Mon–Fri, 24/5 support" />
            <ContactCard icon={MessageCircle} title="Live Chat" value="Start chatting" desc="Instant help from our team" />
          </div>
        </div>
      </section>

      {/* Office */}
      <section className="border-t border-white/5 bg-white/[0.01] py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <h2 className="mb-8 text-3xl font-bold">Our Offices</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { city: "London", country: "United Kingdom", address: "First Floor, The Bengal Wing, 9A Devonshire Square, London EC2M 4YN", regulator: "FCA" },
              { city: "Limassol", country: "Cyprus", address: "Kedron 9, Mesa Geitonia, 4004 Limassol, Cyprus", regulator: "CySEC" },
              { city: "Johannesburg", country: "South Africa", address: "FSP No. 49464, regulated by FSCA", regulator: "FSCA" },
              { city: "Singapore", country: "Singapore", address: "9 Raffles Place, #18-21 Republic Plaza, Singapore 048619", regulator: "DFSA" },
            ].map((office) => (
              <div key={office.city} className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6">
                <div className="mb-3 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-yellow-400" />
                  <h3 className="text-lg font-bold">{office.city}</h3>
                </div>
                <div className="text-sm text-white/50">{office.country}</div>
                <div className="mt-2 text-xs text-white/30">{office.address}</div>
                <div className="mt-3 inline-block rounded-full bg-yellow-500/10 px-2 py-0.5 text-[10px] font-semibold text-yellow-400">{office.regulator}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-white/5 py-16">
        <div className="mx-auto max-w-3xl px-4 lg:px-6">
          <div className="mb-8 flex items-center gap-3">
            <HelpCircle className="h-6 w-6 text-yellow-400" />
            <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-[#0a0a0a]">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left"
                >
                  <span className="text-sm font-semibold text-white/80">{faq.q}</span>
                  <ChevronDown className={`h-4 w-4 shrink-0 text-yellow-400 transition ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-white/50">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Support hours */}
      <section className="border-t border-white/5 bg-white/[0.01] py-16 text-center">
        <div className="mx-auto max-w-3xl px-4">
          <Clock className="mx-auto mb-4 h-12 w-12 text-yellow-400" />
          <h2 className="text-3xl font-bold">24/5 Multilingual Support</h2>
          <p className="mt-3 text-white/40">Our support team is available in 15+ languages, 24 hours a day, 5 days a week.</p>
          <button
            onClick={onLaunchTerminal}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-8 py-4 text-base font-bold text-black transition hover:bg-yellow-300"
          >
            Launch WebTrader <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </section>
    </div>
  );
}

function ContactCard({ icon: Icon, title, value, desc }: { icon: React.ComponentType<{ className?: string }>; title: string; value: string; desc: string }) {
  return (
    <div className="group rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center transition hover:border-yellow-500/20 hover:bg-yellow-500/5">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-400 transition group-hover:scale-110">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-lg font-bold">{title}</h3>
      <div className="mt-2 text-lg font-semibold text-yellow-400">{value}</div>
      <div className="mt-1 text-sm text-white/40">{desc}</div>
    </div>
  );
}
