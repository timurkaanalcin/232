import { useEffect, useState } from "react";
import { ACCOUNT_TYPES, CATEGORY_META } from "@/data/instruments";
import { initTemplatePlugins } from "@/lib/templateAssets";

interface Props {
  onLaunchTerminal: () => void;
  onNavigate: (page: string) => void;
}

const BENEFITS = [
  {
    title: "Spreads from 0.0 pips",
    desc: "Institutional pricing on RAW accounts with deep liquidity and no dealing desk.",
    image: "/assets/images/feature/1.png",
    badge: "/assets/images/feature/5.png",
    stat: "0.0",
    statLabel: "pips from",
  },
  {
    title: "0.15s average execution",
    desc: "Lightning-fast fills with no rejections or re-quotes across major markets.",
    image: "/assets/images/feature/2.png",
    badge: "/assets/images/feature/6.png",
    stat: "0.15",
    statLabel: "sec fill",
  },
  {
    title: "Multi-regulated safety",
    desc: "Licensed by FCA, CySEC, FSA and FSCA — client funds segregated and protected.",
    image: "/assets/images/feature/1.png",
    badge: "/assets/images/feature/7.png",
    stat: "4",
    statLabel: "regulators",
  },
  {
    title: "880+ instruments",
    desc: "Forex, crypto, indices, stocks, commodities and bonds from one account.",
    image: "/assets/images/feature/2.png",
    badge: "/assets/images/feature/8.png",
    stat: "880",
    statLabel: "markets",
  },
];

const SERVICES = [
  { title: "Forex Trading", desc: "80+ currency pairs & metals with tight spreads.", img: 1, path: "instruments" },
  { title: "Crypto CFDs", desc: "60+ cryptocurrencies traded 24/7.", img: 2, path: "instruments" },
  { title: "Stock Indices", desc: "30+ global indices including BIST.", img: 3, path: "instruments" },
  { title: "WebTrader", desc: "Trade directly in browser with TradingView charts.", img: 4, path: "platforms" },
  { title: "Copy Trading", desc: "Follow top strategies and automate your edge.", img: 5, path: "copy-trading" },
  { title: "Education Hub", desc: "Webinars, courses and tools for every level.", img: 6, path: "education" },
];

const FAQS = [
  {
    q: "How do I open a BROKERZ account?",
    a: "Click WebTrader or Open Account, complete registration in minutes, and fund with bank transfer, card or crypto.",
  },
  {
    q: "What is the minimum deposit?",
    a: "Classic, RAW and TradingView RAW accounts start from $100. Demo accounts are free with $10,000 virtual funds.",
  },
  {
    q: "Is BROKERZ regulated?",
    a: "Yes. BROKERZ entities are regulated by FCA (UK), CySEC (Cyprus), FSA (Seychelles) and FSCA (South Africa).",
  },
  {
    q: "Which platforms can I use?",
    a: "MetaTrader 5, MetaTrader 4, TradingView and the BROKERZ WebTrader — all synced to your account.",
  },
];

export default function LandingPage({ onLaunchTerminal, onNavigate }: Props) {
  const [activeBenefit, setActiveBenefit] = useState(0);

  useEffect(() => {
    const t = window.setTimeout(() => initTemplatePlugins(), 150);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div>
      {/* Banner */}
      <section className="banner banner--style1">
        <div className="banner__bg">
          <div className="banner__bg-element">
            <img
              src="/assets/images/banner/home1/bg-dark.png"
              alt=""
              className="d-none d-lg-block"
            />
            <span className="bg-color d-lg-none" />
          </div>
        </div>
        <div className="container">
          <div className="banner__wrapper">
            <div className="row gy-5 gx-4">
              <div className="col-lg-6 col-md-7">
                <div className="banner__content" data-aos="fade-right" data-aos-duration="1000">
                  <div className="banner__content-coin">
                    <img src="/assets/images/banner/home1/3.png" alt="" />
                  </div>
                  <h1 className="banner__content-heading">
                    Trade Smart.
                    <br />
                    Trade <span>BROKERZ</span>
                  </h1>
                  <p className="banner__content-moto">
                    Access 880+ instruments across Forex, CFDs, Crypto, Indices and Stocks — with
                    institutional-grade execution and spreads from 0.0 pips.
                  </p>
                  <div className="banner__btn-group btn-group">
                    <button type="button" className="trk-btn trk-btn--primary trk-btn--arrow nav-cta" onClick={onLaunchTerminal}>
                      Launch Platform
                      <span>
                        <i className="fa-solid fa-arrow-right" />
                      </span>
                    </button>
                    <button
                      type="button"
                      className="trk-btn trk-btn--outline22 nav-cta"
                      onClick={() => onNavigate("accounts")}
                    >
                      <span className="style1">
                        <i className="fa-solid fa-play" />
                      </span>{" "}
                      View Accounts
                    </button>
                  </div>
                  <div className="banner__content-social">
                    <p>Follow Us</p>
                    <ul className="social">
                      {[
                        "fa-brands fa-facebook-f",
                        "fa-brands fa-linkedin-in",
                        "fa-brands fa-instagram",
                        "fa-brands fa-youtube",
                        "fa-brands fa-twitter",
                      ].map((icon, i) => (
                        <li className="social__item" key={icon}>
                          <a
                            href="#"
                            className={`social__link social__link--style1${i === 0 ? " active" : ""}`}
                            onClick={(e) => e.preventDefault()}
                          >
                            <i className={icon} />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              <div className="col-lg-6 col-md-5">
                <div className="banner__thumb" data-aos="fade-left" data-aos-duration="1000">
                  <img src="/assets/images/banner/home4/1.png" alt="BROKERZ trading" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="banner__shape">
          <span className="banner__shape-item banner__shape-item--1">
            <img src="/assets/images/banner/home1/4.png" alt="" />
          </span>
        </div>
      </section>

      {/* Partners — template ships placeholder PNGs; use demo thumbnails instead */}
      <div className="partner partner--gradient">
        <div className="container">
          <div className="partner__wrapper">
            <div className="partner__slider swiper">
              <div className="swiper-wrapper">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div className="swiper-slide" key={n}>
                    <div className="partner__item">
                      <div className="partner__item-inner">
                        <img
                          src={`/assets/images/demo/${n}.png`}
                          alt="market"
                          style={{ maxHeight: 48, width: "auto", objectFit: "contain", opacity: 0.75 }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About */}
      <section className="about about--style1">
        <div className="container">
          <div className="about__wrapper">
            <div className="row gx-5 gy-4 gy-sm-0 align-items-center">
              <div className="col-lg-6">
                <div className="about__thumb pe-lg-5" data-aos="fade-right" data-aos-duration="800">
                  <div className="about__thumb-inner">
                    <div className="about__thumb-image floating-content">
                      <img className="dark" src="/assets/images/about/1.png" alt="about" />
                      <div className="floating-content__top-left" data-aos="fade-right" data-aos-duration="1000">
                        <div className="floating-content__item">
                          <h3>
                            <span className="purecounter" data-purecounter-start="0" data-purecounter-end="830">
                              830
                            </span>
                            M+
                          </h3>
                          <p>Trades executed</p>
                        </div>
                      </div>
                      <div className="floating-content__bottom-right" data-aos="fade-right" data-aos-duration="1000">
                        <div className="floating-content__item">
                          <h3>
                            <span className="purecounter" data-purecounter-start="0" data-purecounter-end="180">
                              180
                            </span>
                            +
                          </h3>
                          <p>Countries served</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="about__content" data-aos="fade-left" data-aos-duration="800">
                  <div className="about__content-inner">
                    <h2>
                      Why traders choose <span>BROKERZ</span>
                    </h2>
                    <p className="mb-0">
                      Multi-regulated, award-winning execution and a single account for every major
                      market. From scalpers to long-term investors — BROKERZ is built for serious trading.
                    </p>
                    <button type="button" className="trk-btn trk-btn--border trk-btn--primary nav-cta" onClick={() => onNavigate("about")}>
                      Explore More
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits / feature */}
      <section className="feature feature--style1 padding-bottom padding-top bg-color">
        <div className="container">
          <div className="feature__wrapper">
            <div className="row g-5 align-items-center justify-content-between">
              <div className="col-md-6 col-lg-5">
                <div className="feature__content" data-aos="fade-right" data-aos-duration="800">
                  <div className="feature__content-inner">
                    <div className="section-header">
                      <h2 className="mb-10 mt-minus-5">
                        <span>Benefits</span> we offer
                      </h2>
                      <p className="mb-0">Institutional conditions designed for active traders.</p>
                    </div>
                    <div className="feature__nav">
                      <div className="nav nav--feature flex-column nav-pills" role="tablist">
                        {BENEFITS.map((b, i) => (
                          <button
                            type="button"
                            key={b.title}
                            className={`nav-link nav-cta${activeBenefit === i ? " active" : ""}`}
                            onClick={() => setActiveBenefit(i)}
                          >
                            <div className="feature__item">
                              <div className="feature__item-inner">
                                <div className="feature__item-content">
                                  <h6>{b.title}</h6>
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-6">
                <div className="feature__thumb pt-5 pt-md-0" data-aos="fade-left" data-aos-duration="800">
                  <div className="feature__thumb-inner">
                    <div className="feature__image floating-content">
                      <img src={BENEFITS[activeBenefit].image} alt="" />
                      <div className="floating-content__top-right floating-content__top-right--style2">
                        <div className="floating-content__item floating-content__item--style2 text-center">
                          <img src={BENEFITS[activeBenefit].badge} alt="" />
                          <p className="style2">{BENEFITS[activeBenefit].desc}</p>
                        </div>
                      </div>
                      <div className="floating-content__bottom-left floating-content__bottom-left--style2">
                        <div className="floating-content__item floating-content__item--style3 d-flex align-items-center">
                          <h3 className="style2">{BENEFITS[activeBenefit].stat}</h3>
                          <p className="ms-3 style2">{BENEFITS[activeBenefit].statLabel}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="feature__shape">
          <span className="feature__shape-item feature__shape-item--1">
            <img src="/assets/images/feature/shape/1.png" alt="" />
          </span>
          <span className="feature__shape-item feature__shape-item--2">
            <span />
          </span>
        </div>
      </section>

      {/* Services = markets */}
      <section className="service padding-top padding-bottom">
        <div className="section-header section-header--max50">
          <h2 className="mb-10 mt-minus-5">
            <span>Markets</span> we offer
          </h2>
          <p>One account. Every market. Explore the full BROKERZ instrument universe.</p>
        </div>
        <div className="container">
          <div className="service__wrapper">
            <div className="row g-4 align-items-center">
              {SERVICES.map((s, i) => (
                <div className="col-sm-6 col-lg-4" key={s.title}>
                  <div className="service__item service__item--style1" data-aos="fade-up" data-aos-duration={800 + i * 100}>
                    <div className="service__item-inner text-center">
                      <div className="service__item-thumb mb-30">
                        <img className="dark" src={`/assets/images/service/${s.img}.png`} alt="" />
                      </div>
                      <div className="service__item-content">
                        <h5>
                          <a
                            className="stretched-link"
                            href={`#${s.path}`}
                            onClick={(e) => {
                              e.preventDefault();
                              onNavigate(s.path);
                            }}
                          >
                            {s.title}
                          </a>
                        </h5>
                        <p className="mb-0">{s.desc}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Instrument categories strip */}
      <section className="padding-bottom">
        <div className="container">
          <div className="section-header section-header--max50">
            <h2 className="mb-10 mt-minus-5">
              Asset <span>classes</span>
            </h2>
            <p>880+ instruments across six asset classes.</p>
          </div>
          <div className="row g-4">
            {Object.entries(CATEGORY_META).map(([key, meta]) => (
              <div className="col-sm-6 col-lg-4" key={key}>
                <button
                  type="button"
                  className="service__item service__item--style1 nav-cta w-100 text-start"
                  onClick={() => onNavigate("instruments")}
                  style={{ cursor: "pointer" }}
                >
                  <div className="service__item-inner">
                    <div className="service__item-content">
                      <h5>{meta.label}</h5>
                      <p className="mb-0">{meta.desc}</p>
                    </div>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing = accounts */}
      <section className="pricing padding-top padding-bottom bg-color">
        <div className="section-header section-header--max50">
          <h2 className="mb-10 mt-minus-5">
            Account <span>types</span>
          </h2>
          <p>Exceptional conditions on all CFD trading accounts — start from $100.</p>
        </div>
        <div className="container">
          <div className="pricing__wrapper">
            <div className="row g-4 align-items-center">
              {ACCOUNT_TYPES.map((acc, i) => (
                <div className="col-md-6 col-lg-4" key={acc.id}>
                  <div
                    className="pricing__item"
                    data-aos={i === 1 ? "fade-up" : i === 0 ? "fade-right" : "fade-left"}
                    data-aos-duration="1000"
                  >
                    <div className={`pricing__item-inner${acc.highlight ? " active" : ""}`}>
                      <div className="pricing__item-content">
                        <div className="pricing__item-top">
                          <h6 className="mb-15">{acc.name}</h6>
                          <h3 className="mb-25">
                            ${acc.deposit}/<span>min deposit</span>
                          </h3>
                        </div>
                        <div className="pricing__item-middle">
                          <ul className="pricing__list">
                            <li className="pricing__list-item">
                              <span>
                                <img src="/assets/images/icon/check.svg" alt="" className="dark" />
                              </span>
                              Leverage {acc.leverage}
                            </li>
                            <li className="pricing__list-item">
                              <span>
                                <img src="/assets/images/icon/check.svg" alt="" className="dark" />
                              </span>
                              {acc.commission}
                            </li>
                            <li className="pricing__list-item">
                              <span>
                                <img src="/assets/images/icon/check.svg" alt="" className="dark" />
                              </span>
                              {acc.currencies.join(", ")}
                            </li>
                            <li className="pricing__list-item">
                              <span>
                                <img src="/assets/images/icon/check.svg" alt="" className="dark" />
                              </span>
                              Free demo available
                            </li>
                          </ul>
                        </div>
                        <div className="pricing__item-bottom">
                          <button type="button" className="trk-btn trk-btn--outline nav-cta" onClick={onLaunchTerminal}>
                            Open Account
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq padding-top padding-bottom">
        <div className="container">
          <div className="faq__wrapper">
            <div className="row g-5 align-items-center">
              <div className="col-lg-6">
                <div className="section-header">
                  <h2 className="mb-10 mt-minus-5">
                    Frequently <span>asked</span> questions
                  </h2>
                  <p>Everything you need to know before you start trading with BROKERZ.</p>
                </div>
                <div className="accordion accordion--style1" id="faqAccordion1">
                  {FAQS.map((f, i) => (
                    <div className="accordion__item accordion-item" key={f.q}>
                      <div className="accordion__header accordion-header" id={`faq${i}`}>
                        <button
                          className={`accordion-button${i === 0 ? "" : " collapsed"}`}
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target={`#faqCollapse${i}`}
                          aria-expanded={i === 0 ? "true" : "false"}
                          aria-controls={`faqCollapse${i}`}
                        >
                          <span className="accordion__button-content">{f.q}</span>
                        </button>
                      </div>
                      <div
                        id={`faqCollapse${i}`}
                        className={`accordion-collapse collapse${i === 0 ? " show" : ""}`}
                        aria-labelledby={`faq${i}`}
                        data-bs-parent="#faqAccordion1"
                      >
                        <div className="accordion__body accordion-body">
                          <p className="mb-0">{f.a}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-lg-6">
                <div className="faq__thumb faq__thumb--style1" data-aos="fade-left" data-aos-duration="1000">
                  <img className="dark" src="/assets/images/others/1.png" alt="" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="faq__shape faq__shape--style1">
          <span className="faq__shape-item faq__shape-item--1">
            <img src="/assets/images/others/2.png" alt="" />
          </span>
        </div>
      </section>

      {/* CTA */}
      <section className="cta padding-top padding-bottom bg-color">
        <div className="container">
          <div className="cta__wrapper">
            <div className="cta__newsletter justify-content-center">
              <div className="cta__newsletter-inner" data-aos="fade-up" data-aos-duration="1000">
                <div className="cta__thumb">
                  <img src="/assets/images/cta/3.png" alt="" />
                </div>
                <div className="cta__subscribe">
                  <h2>
                    Ready to <span>trade</span>?
                  </h2>
                  <p>Launch the BROKERZ WebTrader with a free demo — $10,000 virtual funds, no deposit required.</p>
                  <div className="cta-form cta-form--style2 form-subscribe">
                    <div className="cta-form__inner d-sm-flex align-items-center justify-content-center gap-3">
                      <button type="button" className="trk-btn trk-btn--large trk-btn--secondary2 nav-cta" onClick={onLaunchTerminal}>
                        Launch WebTrader
                      </button>
                      <button type="button" className="trk-btn trk-btn--large trk-btn--outline nav-cta" onClick={() => onNavigate("support")}>
                        Contact Support
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="cta__shape">
              <span className="cta__shape-item cta__shape-item--1">
                <img src="/assets/images/cta/2.png" alt="" />
              </span>
              <span className="cta__shape-item cta__shape-item--2">
                <img src="/assets/images/cta/4.png" alt="" />
              </span>
              <span className="cta__shape-item cta__shape-item--3">
                <img src="/assets/images/cta/5.png" alt="" />
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
