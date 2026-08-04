import { useEffect, useState } from "react";

export const NAV_SECTIONS = [
  {
    title: "Instruments",
    path: "instruments",
    children: [
      { label: "Forex", path: "instruments" },
      { label: "Commodities", path: "instruments" },
      { label: "Cryptocurrencies", path: "instruments" },
      { label: "Stock Indices", path: "instruments" },
      { label: "Stocks and ETFs", path: "instruments" },
      { label: "Bonds", path: "instruments" },
    ],
  },
  {
    title: "Accounts",
    path: "accounts",
    children: [
      { label: "Classic Account", path: "accounts" },
      { label: "RAW Account", path: "accounts" },
      { label: "TradingView RAW", path: "accounts" },
      { label: "Islamic Account", path: "accounts" },
    ],
  },
  {
    title: "Platforms",
    path: "platforms",
    children: [
      { label: "MetaTrader 5", path: "platforms" },
      { label: "MetaTrader 4", path: "platforms" },
      { label: "TradingView", path: "platforms" },
      { label: "BROKERZ Trader", path: "platforms" },
    ],
  },
  {
    title: "Education",
    path: "education",
    children: [
      { label: "Webinars", path: "education" },
      { label: "Video Tutorials", path: "education" },
      { label: "Forex Course", path: "education" },
    ],
  },
  { title: "Tools", path: "tools" },
  {
    title: "About",
    path: "about",
    children: [
      { label: "Why BROKERZ", path: "about" },
      { label: "Regulations", path: "about" },
      { label: "Conditions", path: "conditions" },
      { label: "Partnership", path: "partnership" },
    ],
  },
  { title: "Copy Trading", path: "copy-trading" },
  { title: "Promotions", path: "promotions" },
  { title: "Support", path: "support" },
];

interface Props {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLaunchTerminal: () => void;
  onLaunchAdmin: () => void;
}

export default function Layout({
  children,
  currentPage,
  onNavigate,
  onLaunchTerminal,
  onLaunchAdmin,
}: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    return (localStorage.getItem("theme") as "light" | "dark") || "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-bs-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const preloader = document.querySelector<HTMLElement>(".preloader");
    if (!preloader) return;
    preloader.style.transition = "opacity 0.35s ease";
    const hide = window.setTimeout(() => {
      preloader.style.opacity = "0";
      window.setTimeout(() => {
        preloader.style.display = "none";
      }, 350);
    }, 200);
    return () => window.clearTimeout(hide);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenMenu(null);
  }, [currentPage]);

  const go = (path: string) => {
    onNavigate(path);
    setMobileOpen(false);
  };

  const toggleTheme = () => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  };

  return (
    <>
      <div className="preloader">
        <img src="/assets/images/logo/preloader.png" alt="preloader" />
      </div>

      <div className="lightdark-switch">
        <span className={`switch-btn${theme === "dark" ? " dark-switcher" : ""}`} id="btnSwitch" onClick={toggleTheme} role="button" tabIndex={0}>
          <img
            src={theme === "dark" ? "/assets/images/icon/sun.svg" : "/assets/images/icon/moon.svg"}
            alt="theme"
            className="swtich-icon"
          />
        </span>
      </div>

      <header className="header-section header-section--style2">
        <div className="header-bottom">
          <div className="container">
            <div className="header-wrapper">
              <div className="logo">
                <button type="button" className="nav-cta" onClick={() => go("home")} aria-label="BROKERZ home">
                  <img className="dark" src="/brokerz-logo.webp" alt="BROKERZ" style={{ height: 40, width: "auto" }} />
                </button>
              </div>

              <div className={`menu-area${mobileOpen ? " menu-open" : ""}`}>
                <ul className="menu menu--style1">
                  {NAV_SECTIONS.map((section) => (
                    <li
                      key={section.title}
                      className={openMenu === section.title ? "is-open" : ""}
                      onMouseEnter={() => section.children && setOpenMenu(section.title)}
                      onMouseLeave={() => setOpenMenu(null)}
                    >
                      <a
                        href={`#${section.path}`}
                        onClick={(e) => {
                          e.preventDefault();
                          if (section.children && window.innerWidth < 992) {
                            setOpenMenu(openMenu === section.title ? null : section.title);
                            return;
                          }
                          go(section.path);
                        }}
                        className={currentPage === section.path ? "active" : undefined}
                      >
                        {section.title}
                      </a>
                      {section.children && (
                        <ul className="submenu">
                          {section.children.map((child) => (
                            <li key={child.label}>
                              <a
                                href={`#${child.path}`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  go(child.path);
                                }}
                              >
                                {child.label}
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="header-action">
                <div className="menu-area">
                  <div className="header-btn d-none d-sm-block">
                    <button type="button" className="trk-btn trk-btn--border trk-btn--primary nav-cta" onClick={onLaunchAdmin}>
                      <span>Admin</span>
                    </button>
                  </div>
                  <div className="header-btn ms-2">
                    <button type="button" className="trk-btn trk-btn--primary nav-cta" onClick={onLaunchTerminal}>
                      <span>WebTrader</span>
                    </button>
                  </div>
                  <div
                    className={`header-bar d-lg-none header-bar--style1${mobileOpen ? " active" : ""}`}
                    onClick={() => setMobileOpen((v) => !v)}
                    role="button"
                    tabIndex={0}
                    aria-label="Toggle menu"
                  >
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <Footer onNavigate={go} />

      <a
        href="#top"
        className="scrollToTop scrollToTop--style1"
        onClick={(e) => {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      >
        <i className="fa-solid fa-arrow-up-from-bracket" />
      </a>
    </>
  );
}

function Footer({ onNavigate }: { onNavigate: (page: string) => void }) {
  const link = (path: string, label: string) => (
    <li className="footer__linklist-item" key={label}>
      <a
        href={`#${path}`}
        onClick={(e) => {
          e.preventDefault();
          onNavigate(path);
        }}
      >
        {label}
      </a>
    </li>
  );

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__wrapper">
          <div className="footer__top footer__top--style1">
            <div className="row gy-5 gx-4">
              <div className="col-md-6">
                <div className="footer__about">
                  <button type="button" className="footer__about-logo nav-cta" onClick={() => onNavigate("home")}>
                    <img src="/brokerz-logo.webp" alt="BROKERZ" style={{ height: 36, width: "auto" }} />
                  </button>
                  <p className="footer__about-moto">
                    Trade Smart. Trade BROKERZ. Access 880+ instruments with institutional-grade execution,
                    spreads from 0.0 pips, and multi-regulated protection.
                  </p>
                  <div className="footer__app">
                    <div className="footer__app-item footer__app-item--apple">
                      <div className="footer__app-inner">
                        <div className="footer__app-thumb">
                          <a href="https://www.apple.com/app-store/" target="_blank" rel="noreferrer" className="stretched-link">
                            <img src="/assets/images/footer/apple.png" alt="apple" />
                          </a>
                        </div>
                        <div className="footer__app-content">
                          <span>Download on the</span>
                          <p className="mb-0">App Store</p>
                        </div>
                      </div>
                    </div>
                    <div className="footer__app-item footer__app-item--playstore">
                      <div className="footer__app-inner">
                        <div className="footer__app-thumb">
                          <a href="https://play.google.com/store" target="_blank" rel="noreferrer" className="stretched-link">
                            <img src="/assets/images/footer/play.png" alt="playstore" />
                          </a>
                        </div>
                        <div className="footer__app-content">
                          <span>GET IT ON</span>
                          <p className="mb-0">Google Play</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-2 col-sm-4 col-6">
                <div className="footer__links">
                  <div className="footer__links-tittle">
                    <h6>Trading</h6>
                  </div>
                  <div className="footer__links-content">
                    <ul className="footer__linklist">
                      {link("instruments", "Instruments")}
                      {link("accounts", "Accounts")}
                      {link("platforms", "Platforms")}
                      {link("copy-trading", "Copy Trading")}
                    </ul>
                  </div>
                </div>
              </div>
              <div className="col-md-2 col-sm-4 col-6">
                <div className="footer__links">
                  <div className="footer__links-tittle">
                    <h6>Support</h6>
                  </div>
                  <div className="footer__links-content">
                    <ul className="footer__linklist">
                      {link("support", "Help Centre")}
                      {link("conditions", "Conditions")}
                      {link("education", "Education")}
                      {link("tools", "Tools")}
                    </ul>
                  </div>
                </div>
              </div>
              <div className="col-md-2 col-sm-4">
                <div className="footer__links">
                  <div className="footer__links-tittle">
                    <h6>Company</h6>
                  </div>
                  <div className="footer__links-content">
                    <ul className="footer__linklist">
                      {link("about", "About BROKERZ")}
                      {link("partnership", "Partnership")}
                      {link("promotions", "Promotions")}
                      {link("support", "Contact")}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="footer__bottom">
            <div className="footer__end">
              <div className="footer__end-copyright">
                <p className="mb-0">
                  © {new Date().getFullYear()} All Rights Reserved By <strong>BROKERZ</strong>
                </p>
              </div>
              <div>
                <ul className="social">
                  {[
                    "fa-brands fa-facebook-f",
                    "fa-brands fa-instagram",
                    "fa-brands fa-linkedin-in",
                    "fa-brands fa-youtube",
                    "fa-brands fa-twitter",
                  ].map((icon) => (
                    <li className="social__item" key={icon}>
                      <a href="#" className="social__link social__link--style22" onClick={(e) => e.preventDefault()}>
                        <i className={icon} />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="mt-4 mb-0" style={{ fontSize: 12, opacity: 0.65 }}>
              Risk Warning: Trading financial products on margin carries a high degree of risk and is not suitable for
              all investors. Losses can exceed the initial investment.
            </p>
          </div>
        </div>
      </div>
      <div className="footer__shape">
        <span className="footer__shape-item footer__shape-item--1">
          <img src="/assets/images/footer/1.png" alt="" />
        </span>
        <span className="footer__shape-item footer__shape-item--2">
          <span />
        </span>
      </div>
    </footer>
  );
}
