const CSS_HREFS = [
  "/assets/css/bootstrap.min.css",
  "/assets/css/aos.css",
  "/assets/css/all.min.css",
  "/assets/css/swiper-bundle.min.css",
  "/assets/css/style.css",
  "/assets/css/brokerz-bridge.css",
];

const SCRIPT_SRCS = [
  "/assets/js/bootstrap.bundle.min.js",
  "/assets/js/aos.js",
  "/assets/js/swiper-bundle.min.js",
  "/assets/js/purecounter_vanilla.js",
];

const LINK_ATTR = "data-brokerz-template";
const SCRIPT_ATTR = "data-brokerz-template-js";

function loadCss(href: string): Promise<void> {
  return new Promise((resolve) => {
    if (document.querySelector(`link[${LINK_ATTR}="${href}"]`)) {
      resolve();
      return;
    }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.setAttribute(LINK_ATTR, href);
    link.onload = () => resolve();
    link.onerror = () => resolve();
    document.head.appendChild(link);
  });
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve) => {
    if (document.querySelector(`script[${SCRIPT_ATTR}="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    script.setAttribute(SCRIPT_ATTR, src);
    script.onload = () => resolve();
    script.onerror = () => resolve();
    document.body.appendChild(script);
  });
}

export async function enableTemplateAssets(theme: "light" | "dark" = "dark") {
  document.documentElement.setAttribute("data-bs-theme", theme);
  document.body.classList.add("brokerz-site");
  await Promise.all(CSS_HREFS.map(loadCss));
  for (const src of SCRIPT_SRCS) {
    await loadScript(src);
  }
}

export function disableTemplateAssets() {
  document.body.classList.remove("brokerz-site");
  document.documentElement.removeAttribute("data-bs-theme");
  document.querySelectorAll(`link[${LINK_ATTR}]`).forEach((el) => el.remove());
  document.querySelectorAll(`script[${SCRIPT_ATTR}]`).forEach((el) => el.remove());
}

declare global {
  interface Window {
    AOS?: { init: (opts?: Record<string, unknown>) => void; refresh: () => void };
    Swiper?: new (el: string | Element, opts?: Record<string, unknown>) => unknown;
    PureCounter?: new (opts?: Record<string, unknown>) => unknown;
  }
}

export function initTemplatePlugins() {
  try {
    window.AOS?.init({ duration: 800, once: true, offset: 80 });
  } catch {
    /* noop */
  }

  try {
    const el = document.querySelector(".partner__slider");
    if (el && window.Swiper && !(el as HTMLElement).dataset.swiperInit) {
      new window.Swiper(el, {
        slidesPerView: 2,
        spaceBetween: 24,
        loop: true,
        autoplay: { delay: 2500, disableOnInteraction: false },
        breakpoints: {
          576: { slidesPerView: 3 },
          768: { slidesPerView: 4 },
          992: { slidesPerView: 5 },
        },
      });
      (el as HTMLElement).dataset.swiperInit = "1";
    }
  } catch {
    /* noop */
  }

  try {
    if (window.PureCounter) {
      new window.PureCounter();
    }
  } catch {
    /* noop */
  }
}
