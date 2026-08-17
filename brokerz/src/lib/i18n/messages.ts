import type { Locale } from "./types";

export type Messages = {
  header: {
    login: string;
    register: string;
    home: string;
    menu: string;
    language: string;
  };
  nav: {
    trade: string;
    account: string;
    download: string;
    about: string;
    help: string;
  };
  navItems: Record<string, [string, string][]>;
  hero: {
    line1: string;
    trust: string;
    line2: string;
    startTrading: string;
    startInvesting: string;
    learnMore: string;
  };
  pills: string[];
  years: {
    title: string;
    accent: string;
    body: string;
    news: string;
  };
  platform: {
    eyebrow: string;
    title: string;
    subtitle: string;
  };
  care: { title: string; desc: string }[];
  toolsTitle: string;
  risk: { title: string; desc: string }[];
  journeyTitle: string;
  journey: { title: string; desc: string }[];
  smooth: { value: string; label: string }[];
  install: {
    title: string;
    subtitle: string;
    cta: string;
    iosHelp: string;
    desktopHelp: string;
    gotIt: string;
  };
  app: {
    hello: string;
    balance: string;
    account: string;
    kycNeeded: string;
    kycNeededSub: string;
    tradeCta: string;
    tradeSub: string;
    kyc: string;
    home: string;
    trade: string;
    accountTab: string;
    status: string;
    active: string;
    verification: string;
    open: string;
    myAccount: string;
    name: string;
    email: string;
    accountNo: string;
    logout: string;
  };
  auth: {
    mobileLogin: string;
    enterEmail: string;
    emailHint: string;
    email: string;
    continue: string;
    wait: string;
    noAccount: string;
    register: string;
    securityPin: string;
    enterPin: string;
    back: string;
    createAccount: string;
    fullName: string;
    setPin: string;
    haveAccount: string;
    login: string;
  };
  kyc: {
    title: string;
    subtitle: string;
    status: string;
    start: string;
    identity: string;
    identityHint: string;
    address: string;
    addressHint: string;
    documents: string;
    documentsHint: string;
    review: string;
    reviewHint: string;
    continue: string;
    submit: string;
    fullName: string;
    nationalId: string;
    birthDate: string;
    nationality: string;
    phone: string;
    addressField: string;
    city: string;
    country: string;
    idFront: string;
    idBack: string;
    selfie: string;
    pickFile: string;
    consent: string;
    labels: {
      none: string;
      draft: string;
      pending: string;
      approved: string;
      rejected: string;
    };
  };
  common: {
    detecting: string;
  };
};

const en: Messages = {
  header: {
    login: "Log in",
    register: "Register",
    home: "Home",
    menu: "Menu",
    language: "Language",
  },
  nav: {
    trade: "Trade",
    account: "Account",
    download: "Download app",
    about: "About",
    help: "Help",
  },
  navItems: {
    trade: [
      ["Flex", "Explore flexible trading mechanics"],
      ["Fixed Time", "Trades from $1 across defined timeframes"],
      ["Forex", "Classic mode for short and long-term trades"],
      ["Stocks", "Blue-chip trades with zero commission"],
      ["How to trade", "Simple steps to start trading"],
    ],
    account: [
      ["Islamic Account", "Halal trading on a swap-free account"],
      ["Live account", "Trade with a funded real account"],
      ["Withdrawals", "Options, fees and processing times"],
    ],
    download: [
      ["Desktop", "190+ assets across three trading modes"],
      ["Web app", "Trade from any device in your browser"],
      ["Android", "Mobile application"],
    ],
    about: [
      ["Awards", "11 years of excellence"],
      ["News", "Latest announcements"],
      ["Reviews", "User experiences"],
    ],
    help: [
      ["Support", "24/7 assistance"],
      ["FAQ", "Frequently asked questions"],
      ["Learning Center", "Guide to trading on our platform"],
    ],
  },
  hero: {
    line1: "Build",
    trust: "trust",
    line2: "with every trade",
    startTrading: "Start trading",
    startInvesting: "Start investing",
    learnMore: "Learn more",
  },
  pills: [
    "Modern platform",
    "Useful features",
    "Easy start",
    "Learning center",
    "Fast withdrawals",
    "Trusted broker",
  ],
  years: {
    title: "Empowering investors for 11 years",
    accent: "and this is only the beginning.",
    body: "Meet the renewed and improved {brand}. Feel the care built into every detail.",
    news: "Read the news",
  },
  platform: {
    eyebrow: "Modern trading platform",
    title: "Your financial future is in your hands",
    subtitle: "Discover the perfect blend of care, reliability and usability",
  },
  care: [
    { title: "Care", desc: "We focus on the user experience in every detail." },
    { title: "Reliability", desc: "Licensed infrastructure and transparent trading conditions." },
    { title: "Usability", desc: "An intuitive interface — trading made simple." },
  ],
  toolsTitle: "Discover trading with professional tools",
  risk: [
    { title: "Live trading account", desc: "Open a real account and trade with your own capital." },
    { title: "Professional trade tools", desc: "Trade with confidence using institutional-grade tools." },
    { title: "Stop loss / Take profit", desc: "Close trades automatically under your chosen conditions." },
    { title: "Deposits are protected", desc: "Your funds are held under protective safeguards." },
    { title: "Negative balance protection", desc: "You only risk the amount you allocate to a trade." },
    { title: "You choose amount and duration", desc: "Trades from $1 — open with durations as short as 5 seconds." },
  ],
  journeyTitle: "Everything you need for a confident start",
  journey: [
    { title: "24/7 support in your language", desc: "14 languages — we are always online." },
    { title: "Trading signals", desc: "Help spot profitable trends as they form." },
    { title: "Ready-made strategies", desc: "Start your trading journey with prepared approaches." },
    { title: "In-app education", desc: "Materials and YouTube tutorials for every level." },
  ],
  smooth: [
    { value: "$10", label: "Deposit just $10 to get started" },
    { value: "24/7", label: "Local assets available" },
    { value: "Up to 93%", label: "Higher payout rate" },
    { value: "Expert", label: "Personal trading advice" },
  ],
  install: {
    title: "Install the UBS app",
    subtitle: "Add to home screen / desktop — open like a native app",
    cta: "Install",
    iosHelp: "In Safari tap Share → Add to Home Screen",
    desktopHelp: "Use browser menu Install app, or the install icon in the address bar.",
    gotIt: "Got it",
  },
  app: {
    hello: "Hello,",
    balance: "Available balance",
    account: "Account",
    kycNeeded: "Identity verification required",
    kycNeededSub: "Complete it step by step, just like in a bank app",
    tradeCta: "Trade",
    tradeSub: "WebTrader",
    kyc: "KYC",
    home: "Home",
    trade: "Trade",
    accountTab: "Account",
    status: "Account status",
    active: "Active",
    verification: "Verification",
    open: "Open",
    myAccount: "My account",
    name: "Name",
    email: "E-mail",
    accountNo: "Account no.",
    logout: "Log out",
  },
  auth: {
    mobileLogin: "Mobile banking login",
    enterEmail: "Enter your e-mail",
    emailHint: "Then confirm with your 6-digit mobile banking PIN.",
    email: "E-mail",
    continue: "Continue",
    wait: "Please wait…",
    noAccount: "Don't have an account?",
    register: "Register",
    securityPin: "Security PIN",
    enterPin: "Enter your PIN",
    back: "Back",
    createAccount: "Create account",
    fullName: "Full name",
    setPin: "Set a 6-digit PIN",
    haveAccount: "Already have an account?",
    login: "Log in",
  },
  kyc: {
    title: "Identity verification (KYC)",
    subtitle: "Bank-style mobile flow",
    status: "Status",
    start: "Start verification",
    identity: "Identity details",
    identityHint: "Name, national ID, date of birth",
    address: "Contact & address",
    addressHint: "Phone and residence",
    documents: "Document upload",
    documentsHint: "ID and selfie",
    review: "Review & submit",
    reviewHint: "Double-check",
    continue: "Continue",
    submit: "Submit verification",
    fullName: "Full name",
    nationalId: "National ID",
    birthDate: "Date of birth",
    nationality: "Nationality",
    phone: "Mobile phone",
    addressField: "Address",
    city: "City",
    country: "Country",
    idFront: "ID front",
    idBack: "ID back",
    selfie: "Selfie (face check)",
    pickFile: "Choose file / take photo",
    consent: "By submitting you accept processing of personal data for identity verification.",
    labels: {
      none: "Not started",
      draft: "Draft",
      pending: "Under review",
      approved: "Verified",
      rejected: "Rejected",
    },
  },
  common: { detecting: "Detecting language…" },
};

const tr: Messages = {
  ...en,
  header: { login: "Giriş", register: "Kayıt ol", home: "Ana sayfa", menu: "Menü", language: "Dil" },
  nav: { trade: "İşlem", account: "Hesap", download: "Uygulamayı indir", about: "Hakkımızda", help: "Yardım" },
  navItems: {
    trade: [
      ["Flex", "Esnek işlem mekaniklerini keşfedin"],
      ["Sabit süre", "$1’den başlayan zaman dilimli işlemler"],
      ["Forex", "Kısa ve uzun vadeli klasik işlem"],
      ["Hisse", "Komisyonsuz blue-chip işlemler"],
      ["Nasıl işlem yapılır", "Başlamak için basit adımlar"],
    ],
    account: [
      ["İslami hesap", "Swap’sız helal işlem"],
      ["Canlı hesap", "Fonlanmış gerçek hesapla işlem"],
      ["Para çekme", "Seçenekler, ücretler ve süreler"],
    ],
    download: [
      ["Masaüstü", "Üç modda 190+ varlık"],
      ["Web uygulaması", "Tarayıcıdan her cihazdan işlem"],
      ["Android", "Mobil uygulama"],
    ],
    about: [
      ["Ödüller", "11 yıllık mükemmellik"],
      ["Haberler", "Son duyurular"],
      ["Yorumlar", "Kullanıcı deneyimleri"],
    ],
    help: [
      ["Destek", "7/24 yardım"],
      ["SSS", "Sık sorulan sorular"],
      ["Eğitim merkezi", "Platformda işlem rehberi"],
    ],
  },
  hero: {
    line1: "Her işlemde",
    trust: "güven",
    line2: "inşa edin",
    startTrading: "İşleme başla",
    startInvesting: "Yatırıma başla",
    learnMore: "Daha fazla",
  },
  pills: ["Modern platform", "Faydalı özellikler", "Kolay başlangıç", "Eğitim merkezi", "Hızlı çekim", "Güvenilir broker"],
  years: {
    title: "11 yıldır yatırımcıları güçlendiriyoruz",
    accent: "ve bu daha başlangıç.",
    body: "Yenilenen {brand} ile tanışın. Her detaya işlenmiş özeni hissedin.",
    news: "Haberleri oku",
  },
  platform: {
    eyebrow: "Modern işlem platformu",
    title: "Finansal geleceğiniz sizin elinizde",
    subtitle: "Özen, güvenilirlik ve kullanım kolaylığının mükemmel dengesi",
  },
  care: [
    { title: "Özen", desc: "Her detayda kullanıcı deneyimine odaklanırız." },
    { title: "Güvenilirlik", desc: "Lisanslı altyapı ve şeffaf işlem koşulları." },
    { title: "Kullanım kolaylığı", desc: "Sezgisel arayüz — işlem yapmak kolay." },
  ],
  toolsTitle: "Profesyonel araçlarla işlemeyi keşfedin",
  risk: [
    { title: "Canlı işlem hesabı", desc: "Gerçek hesap açın, kendi sermayenizle işlem yapın." },
    { title: "Profesyonel araçlar", desc: "Kurumsal seviye araçlarla güvenle işlem yapın." },
    { title: "Stop loss / Take profit", desc: "Seçtiğiniz koşullarda işlemleri otomatik kapatın." },
    { title: "Mevduatlar korunur", desc: "Fonlarınız koruyucu önlemler altında tutulur." },
    { title: "Negatif bakiye koruması", desc: "Yalnızca işleme ayırdığınız tutarı riske atarsınız." },
    { title: "Tutar ve süreyi siz seçin", desc: "$1’den başlayan işlemler — 5 saniyeye kadar kısa süreler." },
  ],
  journeyTitle: "Güvenli başlangıç için ihtiyacınız olan her şey",
  journey: [
    { title: "Dilinizde 7/24 destek", desc: "14 dil — her zaman çevrimiçiyiz." },
    { title: "İşlem sinyalleri", desc: "Kârlı trendleri oluşurken fark edin." },
    { title: "Hazır stratejiler", desc: "Hazır yaklaşımlarla yolculuğunuza başlayın." },
    { title: "Uygulama içi eğitim", desc: "Her seviye için materyal ve videolar." },
  ],
  smooth: [
    { value: "$10", label: "Başlamak için sadece $10 yatırın" },
    { value: "24/7", label: "Yerel varlıklar mevcut" },
    { value: "93%’e kadar", label: "Daha yüksek ödeme oranı" },
    { value: "Uzman", label: "Kişisel işlem tavsiyesi" },
  ],
  install: {
    title: "UBS uygulamasını yükle",
    subtitle: "Ana ekrana / masaüstüne ekle — uygulama gibi aç",
    cta: "Yükle",
    iosHelp: "Safari’de Paylaş → Ana Ekrana Ekle",
    desktopHelp: "Tarayıcı menüsünden Uygulamayı yükle veya adres çubuğundaki yükle ikonunu kullanın.",
    gotIt: "Anladım",
  },
  app: {
    hello: "Merhaba,",
    balance: "Kullanılabilir bakiye",
    account: "Hesap",
    kycNeeded: "Kimlik doğrulaması gerekli",
    kycNeededSub: "Banka mobilindeki gibi adım adım tamamlayın",
    tradeCta: "İşlem yap",
    tradeSub: "WebTrader",
    kyc: "KYC",
    home: "Ana sayfa",
    trade: "İşlem",
    accountTab: "Hesap",
    status: "Hesap durumu",
    active: "Aktif",
    verification: "Doğrulama",
    open: "Aç",
    myAccount: "Hesabım",
    name: "Ad",
    email: "E-posta",
    accountNo: "Hesap no",
    logout: "Çıkış yap",
  },
  auth: {
    mobileLogin: "Mobil bankacılık girişi",
    enterEmail: "E-postanızı girin",
    emailHint: "Ardından 6 haneli mobil bankacılık PIN’inizle onaylayın.",
    email: "E-posta",
    continue: "Devam",
    wait: "Lütfen bekleyin…",
    noAccount: "Hesabınız yok mu?",
    register: "Kayıt ol",
    securityPin: "Güvenlik PIN’i",
    enterPin: "PIN’inizi girin",
    back: "Geri",
    createAccount: "Hesap oluştur",
    fullName: "Ad soyad",
    setPin: "6 haneli PIN belirleyin",
    haveAccount: "Zaten hesabınız var mı?",
    login: "Giriş yap",
  },
  kyc: {
    title: "Kimlik doğrulama (KYC)",
    subtitle: "Banka mobil uygulaması akışı",
    status: "Durum",
    start: "Doğrulamaya başla",
    identity: "Kimlik bilgileri",
    identityHint: "Ad, TCKN, doğum tarihi",
    address: "İletişim & adres",
    addressHint: "Telefon ve ikamet",
    documents: "Belge yükleme",
    documentsHint: "Kimlik ve selfie",
    review: "Onayla & gönder",
    reviewHint: "Kontrol edin",
    continue: "Devam",
    submit: "Doğrulamayı gönder",
    fullName: "Ad Soyad",
    nationalId: "T.C. Kimlik No",
    birthDate: "Doğum tarihi",
    nationality: "Uyruk",
    phone: "Cep telefonu",
    addressField: "Adres",
    city: "Şehir",
    country: "Ülke",
    idFront: "Kimlik ön yüz",
    idBack: "Kimlik arka yüz",
    selfie: "Selfie (yüz doğrulama)",
    pickFile: "Dosya seç / fotoğraf çek",
    consent: "Göndererek kişisel verilerinizin kimlik doğrulama amacıyla işlenmesini kabul edersiniz.",
    labels: {
      none: "Başlanmadı",
      draft: "Taslak",
      pending: "İnceleniyor",
      approved: "Doğrulandı",
      rejected: "Reddedildi",
    },
  },
  common: { detecting: "Dil algılanıyor…" },
};

/** Compact overlays: fall back to English for missing deep keys via merge */
function overlay(base: Messages, patch: DeepPartial<Messages>): Messages {
  return deepMerge(base, patch);
}

type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };

function deepMerge<T extends Record<string, unknown>>(base: T, patch: DeepPartial<T>): T {
  const out: Record<string, unknown> = { ...base };
  for (const [k, v] of Object.entries(patch)) {
    if (v && typeof v === "object" && !Array.isArray(v) && typeof base[k] === "object" && !Array.isArray(base[k])) {
      out[k] = deepMerge(base[k] as Record<string, unknown>, v as DeepPartial<Record<string, unknown>>);
    } else if (v !== undefined) {
      out[k] = v;
    }
  }
  return out as T;
}

const de = overlay(en, {
  header: { login: "Anmelden", register: "Registrieren", home: "Start", menu: "Menü", language: "Sprache" },
  nav: { trade: "Handel", account: "Konto", download: "App laden", about: "Über uns", help: "Hilfe" },
  hero: {
    line1: "Bauen Sie",
    trust: "Vertrauen",
    line2: "mit jedem Trade",
    startTrading: "Trading starten",
    startInvesting: "Investieren",
    learnMore: "Mehr erfahren",
  },
  install: {
    title: "UBS-App installieren",
    subtitle: "Zum Home-Bildschirm / Desktop hinzufügen",
    cta: "Installieren",
    iosHelp: "In Safari: Teilen → Zum Home-Bildschirm",
    desktopHelp: "Browser-Menü „App installieren“ oder Install-Symbol in der Adressleiste.",
    gotIt: "Verstanden",
  },
  app: {
    hello: "Hallo,",
    balance: "Verfügbares Guthaben",
    account: "Konto",
    kycNeeded: "Identitätsprüfung erforderlich",
    kycNeededSub: "Schritt für Schritt wie in der Banking-App",
    tradeCta: "Handeln",
    tradeSub: "WebTrader",
    kyc: "KYC",
    home: "Start",
    trade: "Handel",
    accountTab: "Konto",
    status: "Kontostatus",
    active: "Aktiv",
    verification: "Verifizierung",
    open: "Öffnen",
    myAccount: "Mein Konto",
    name: "Name",
    email: "E-Mail",
    accountNo: "Kontonr.",
    logout: "Abmelden",
  },
  auth: {
    mobileLogin: "Mobile-Banking-Login",
    enterEmail: "E-Mail eingeben",
    emailHint: "Bestätigen Sie mit Ihrer 6-stelligen PIN.",
    email: "E-Mail",
    continue: "Weiter",
    wait: "Bitte warten…",
    noAccount: "Noch kein Konto?",
    register: "Registrieren",
    securityPin: "Sicherheits-PIN",
    enterPin: "PIN eingeben",
    back: "Zurück",
    createAccount: "Konto erstellen",
    fullName: "Vollständiger Name",
    setPin: "6-stellige PIN festlegen",
    haveAccount: "Bereits ein Konto?",
    login: "Anmelden",
  },
  kyc: {
    ...en.kyc,
    title: "Identitätsprüfung (KYC)",
    subtitle: "Bank-App-Ablauf",
    start: "Prüfung starten",
    continue: "Weiter",
    submit: "Prüfung senden",
    labels: {
      none: "Nicht gestartet",
      draft: "Entwurf",
      pending: "In Prüfung",
      approved: "Verifiziert",
      rejected: "Abgelehnt",
    },
  },
});

const fr = overlay(en, {
  header: { login: "Connexion", register: "S’inscrire", home: "Accueil", menu: "Menu", language: "Langue" },
  nav: { trade: "Trading", account: "Compte", download: "Télécharger", about: "À propos", help: "Aide" },
  hero: {
    line1: "Bâtissez la",
    trust: "confiance",
    line2: "à chaque trade",
    startTrading: "Commencer à trader",
    startInvesting: "Investir",
    learnMore: "En savoir plus",
  },
  install: {
    title: "Installer l’app UBS",
    subtitle: "Ajouter à l’écran d’accueil / bureau",
    cta: "Installer",
    iosHelp: "Safari : Partager → Sur l’écran d’accueil",
    desktopHelp: "Menu du navigateur « Installer l’application ».",
    gotIt: "Compris",
  },
  app: {
    hello: "Bonjour,",
    balance: "Solde disponible",
    account: "Compte",
    kycNeeded: "Vérification d’identité requise",
    kycNeededSub: "Comme dans une app bancaire",
    tradeCta: "Trader",
    tradeSub: "WebTrader",
    kyc: "KYC",
    home: "Accueil",
    trade: "Trading",
    accountTab: "Compte",
    status: "Statut du compte",
    active: "Actif",
    verification: "Vérification",
    open: "Ouvrir",
    myAccount: "Mon compte",
    name: "Nom",
    email: "E-mail",
    accountNo: "N° de compte",
    logout: "Déconnexion",
  },
  auth: {
    mobileLogin: "Connexion mobile banking",
    enterEmail: "Entrez votre e-mail",
    emailHint: "Confirmez avec votre PIN à 6 chiffres.",
    email: "E-mail",
    continue: "Continuer",
    wait: "Veuillez patienter…",
    noAccount: "Pas de compte ?",
    register: "S’inscrire",
    securityPin: "PIN de sécurité",
    enterPin: "Entrez votre PIN",
    back: "Retour",
    createAccount: "Créer un compte",
    fullName: "Nom complet",
    setPin: "Définir un PIN à 6 chiffres",
    haveAccount: "Déjà un compte ?",
    login: "Connexion",
  },
  kyc: {
    ...en.kyc,
    title: "Vérification d’identité (KYC)",
    start: "Commencer",
    continue: "Continuer",
    submit: "Envoyer",
    labels: {
      none: "Non commencé",
      draft: "Brouillon",
      pending: "En revue",
      approved: "Vérifié",
      rejected: "Refusé",
    },
  },
});

const es = overlay(en, {
  header: { login: "Entrar", register: "Registrarse", home: "Inicio", menu: "Menú", language: "Idioma" },
  nav: { trade: "Operar", account: "Cuenta", download: "Descargar app", about: "Acerca de", help: "Ayuda" },
  hero: {
    line1: "Construye",
    trust: "confianza",
    line2: "con cada operación",
    startTrading: "Empezar a operar",
    startInvesting: "Invertir",
    learnMore: "Más información",
  },
  install: {
    title: "Instalar la app UBS",
    subtitle: "Añadir a inicio / escritorio",
    cta: "Instalar",
    iosHelp: "En Safari: Compartir → Añadir a pantalla de inicio",
    desktopHelp: "Menú del navegador «Instalar aplicación».",
    gotIt: "Entendido",
  },
  app: {
    hello: "Hola,",
    balance: "Saldo disponible",
    account: "Cuenta",
    kycNeeded: "Verificación de identidad requerida",
    kycNeededSub: "Como en una app bancaria",
    tradeCta: "Operar",
    tradeSub: "WebTrader",
    kyc: "KYC",
    home: "Inicio",
    trade: "Operar",
    accountTab: "Cuenta",
    status: "Estado de la cuenta",
    active: "Activa",
    verification: "Verificación",
    open: "Abrir",
    myAccount: "Mi cuenta",
    name: "Nombre",
    email: "Correo",
    accountNo: "N.º de cuenta",
    logout: "Cerrar sesión",
  },
  auth: {
    mobileLogin: "Acceso banca móvil",
    enterEmail: "Introduce tu correo",
    emailHint: "Confirma con tu PIN de 6 dígitos.",
    email: "Correo",
    continue: "Continuar",
    wait: "Espere…",
    noAccount: "¿No tienes cuenta?",
    register: "Registrarse",
    securityPin: "PIN de seguridad",
    enterPin: "Introduce tu PIN",
    back: "Atrás",
    createAccount: "Crear cuenta",
    fullName: "Nombre completo",
    setPin: "Define un PIN de 6 dígitos",
    haveAccount: "¿Ya tienes cuenta?",
    login: "Entrar",
  },
  kyc: {
    ...en.kyc,
    title: "Verificación de identidad (KYC)",
    start: "Empezar verificación",
    continue: "Continuar",
    submit: "Enviar",
    labels: {
      none: "No iniciado",
      draft: "Borrador",
      pending: "En revisión",
      approved: "Verificado",
      rejected: "Rechazado",
    },
  },
});

const ar = overlay(en, {
  header: { login: "تسجيل الدخول", register: "إنشاء حساب", home: "الرئيسية", menu: "القائمة", language: "اللغة" },
  nav: { trade: "تداول", account: "الحساب", download: "تحميل التطبيق", about: "من نحن", help: "مساعدة" },
  hero: {
    line1: "ابنِ",
    trust: "الثقة",
    line2: "مع كل صفقة",
    startTrading: "ابدأ التداول",
    startInvesting: "ابدأ الاستثمار",
    learnMore: "اعرف المزيد",
  },
  install: {
    title: "ثبّت تطبيق UBS",
    subtitle: "أضفه إلى الشاشة الرئيسية / سطح المكتب",
    cta: "تثبيت",
    iosHelp: "في Safari: مشاركة ← إضافة إلى الشاشة الرئيسية",
    desktopHelp: "من قائمة المتصفح: تثبيت التطبيق",
    gotIt: "حسناً",
  },
  app: {
    hello: "مرحباً،",
    balance: "الرصيد المتاح",
    account: "الحساب",
    kycNeeded: "التحقق من الهوية مطلوب",
    kycNeededSub: "كما في تطبيق البنك خطوة بخطوة",
    tradeCta: "تداول",
    tradeSub: "WebTrader",
    kyc: "KYC",
    home: "الرئيسية",
    trade: "تداول",
    accountTab: "الحساب",
    status: "حالة الحساب",
    active: "نشط",
    verification: "التحقق",
    open: "فتح",
    myAccount: "حسابي",
    name: "الاسم",
    email: "البريد",
    accountNo: "رقم الحساب",
    logout: "تسجيل الخروج",
  },
  auth: {
    mobileLogin: "دخول الخدمات المصرفية عبر الجوال",
    enterEmail: "أدخل بريدك الإلكتروني",
    emailHint: "ثم أكّد برمز PIN المكوّن من 6 أرقام.",
    email: "البريد",
    continue: "متابعة",
    wait: "يرجى الانتظار…",
    noAccount: "ليس لديك حساب؟",
    register: "إنشاء حساب",
    securityPin: "رمز الأمان",
    enterPin: "أدخل رمز PIN",
    back: "رجوع",
    createAccount: "إنشاء حساب",
    fullName: "الاسم الكامل",
    setPin: "عيّن رمزاً من 6 أرقام",
    haveAccount: "لديك حساب؟",
    login: "تسجيل الدخول",
  },
  kyc: {
    ...en.kyc,
    title: "التحقق من الهوية (KYC)",
    start: "بدء التحقق",
    continue: "متابعة",
    submit: "إرسال",
    labels: {
      none: "لم يبدأ",
      draft: "مسودة",
      pending: "قيد المراجعة",
      approved: "تم التحقق",
      rejected: "مرفوض",
    },
  },
});

const ru = overlay(en, {
  header: { login: "Вход", register: "Регистрация", home: "Главная", menu: "Меню", language: "Язык" },
  nav: { trade: "Торговля", account: "Счёт", download: "Скачать", about: "О нас", help: "Помощь" },
  hero: {
    line1: "Стройте",
    trust: "доверие",
    line2: "с каждой сделкой",
    startTrading: "Начать торговлю",
    startInvesting: "Инвестировать",
    learnMore: "Подробнее",
  },
  install: {
    title: "Установить приложение UBS",
    subtitle: "Добавить на экран / рабочий стол",
    cta: "Установить",
    iosHelp: "В Safari: Поделиться → На экран «Домой»",
    desktopHelp: "Меню браузера «Установить приложение».",
    gotIt: "Понятно",
  },
  app: {
    hello: "Здравствуйте,",
    balance: "Доступный баланс",
    account: "Счёт",
    kycNeeded: "Требуется проверка личности",
    kycNeededSub: "Как в банковском приложении",
    tradeCta: "Торговать",
    tradeSub: "WebTrader",
    kyc: "KYC",
    home: "Главная",
    trade: "Торговля",
    accountTab: "Счёт",
    status: "Статус счёта",
    active: "Активен",
    verification: "Верификация",
    open: "Открыть",
    myAccount: "Мой счёт",
    name: "Имя",
    email: "Эл. почта",
    accountNo: "№ счёта",
    logout: "Выйти",
  },
  auth: {
    mobileLogin: "Вход в мобильный банкинг",
    enterEmail: "Введите e-mail",
    emailHint: "Подтвердите 6-значным PIN.",
    email: "E-mail",
    continue: "Продолжить",
    wait: "Подождите…",
    noAccount: "Нет аккаунта?",
    register: "Регистрация",
    securityPin: "PIN-код",
    enterPin: "Введите PIN",
    back: "Назад",
    createAccount: "Создать аккаунт",
    fullName: "ФИО",
    setPin: "Задайте 6-значный PIN",
    haveAccount: "Уже есть аккаунт?",
    login: "Вход",
  },
  kyc: {
    ...en.kyc,
    title: "Проверка личности (KYC)",
    start: "Начать проверку",
    continue: "Далее",
    submit: "Отправить",
    labels: {
      none: "Не начато",
      draft: "Черновик",
      pending: "На проверке",
      approved: "Подтверждено",
      rejected: "Отклонено",
    },
  },
});

const pt = overlay(en, {
  header: { login: "Entrar", register: "Registrar", home: "Início", menu: "Menu", language: "Idioma" },
  nav: { trade: "Negociar", account: "Conta", download: "Baixar app", about: "Sobre", help: "Ajuda" },
  hero: {
    line1: "Construa",
    trust: "confiança",
    line2: "em cada operação",
    startTrading: "Começar a negociar",
    startInvesting: "Investir",
    learnMore: "Saiba mais",
  },
  install: {
    title: "Instalar o app UBS",
    subtitle: "Adicionar à tela inicial / área de trabalho",
    cta: "Instalar",
    iosHelp: "No Safari: Compartilhar → Adicionar à Tela de Início",
    desktopHelp: "Menu do navegador «Instalar aplicativo».",
    gotIt: "Entendi",
  },
  app: {
    hello: "Olá,",
    balance: "Saldo disponível",
    account: "Conta",
    kycNeeded: "Verificação de identidade necessária",
    kycNeededSub: "Como no app do banco",
    tradeCta: "Negociar",
    tradeSub: "WebTrader",
    kyc: "KYC",
    home: "Início",
    trade: "Negociar",
    accountTab: "Conta",
    status: "Status da conta",
    active: "Ativa",
    verification: "Verificação",
    open: "Abrir",
    myAccount: "Minha conta",
    name: "Nome",
    email: "E-mail",
    accountNo: "Nº da conta",
    logout: "Sair",
  },
  auth: {
    mobileLogin: "Login do banco móvel",
    enterEmail: "Digite seu e-mail",
    emailHint: "Confirme com seu PIN de 6 dígitos.",
    email: "E-mail",
    continue: "Continuar",
    wait: "Aguarde…",
    noAccount: "Não tem conta?",
    register: "Registrar",
    securityPin: "PIN de segurança",
    enterPin: "Digite seu PIN",
    back: "Voltar",
    createAccount: "Criar conta",
    fullName: "Nome completo",
    setPin: "Defina um PIN de 6 dígitos",
    haveAccount: "Já tem conta?",
    login: "Entrar",
  },
  kyc: {
    ...en.kyc,
    title: "Verificação de identidade (KYC)",
    start: "Iniciar verificação",
    continue: "Continuar",
    submit: "Enviar",
    labels: {
      none: "Não iniciado",
      draft: "Rascunho",
      pending: "Em análise",
      approved: "Verificado",
      rejected: "Recusado",
    },
  },
});

const it = overlay(en, {
  header: { login: "Accedi", register: "Registrati", home: "Home", menu: "Menu", language: "Lingua" },
  nav: { trade: "Trading", account: "Conto", download: "Scarica app", about: "Chi siamo", help: "Aiuto" },
  hero: {
    line1: "Costruisci",
    trust: "fiducia",
    line2: "con ogni trade",
    startTrading: "Inizia a fare trading",
    startInvesting: "Investi",
    learnMore: "Scopri di più",
  },
  install: {
    title: "Installa l’app UBS",
    subtitle: "Aggiungi alla home / desktop",
    cta: "Installa",
    iosHelp: "In Safari: Condividi → Aggiungi a Home",
    desktopHelp: "Menu del browser «Installa app».",
    gotIt: "Ok",
  },
  app: {
    hello: "Ciao,",
    balance: "Saldo disponibile",
    account: "Conto",
    kycNeeded: "Verifica identità richiesta",
    kycNeededSub: "Come nell’app della banca",
    tradeCta: "Fai trading",
    tradeSub: "WebTrader",
    kyc: "KYC",
    home: "Home",
    trade: "Trading",
    accountTab: "Conto",
    status: "Stato conto",
    active: "Attivo",
    verification: "Verifica",
    open: "Apri",
    myAccount: "Il mio conto",
    name: "Nome",
    email: "E-mail",
    accountNo: "N. conto",
    logout: "Esci",
  },
  auth: {
    mobileLogin: "Login mobile banking",
    enterEmail: "Inserisci e-mail",
    emailHint: "Conferma con il PIN a 6 cifre.",
    email: "E-mail",
    continue: "Continua",
    wait: "Attendere…",
    noAccount: "Non hai un account?",
    register: "Registrati",
    securityPin: "PIN di sicurezza",
    enterPin: "Inserisci il PIN",
    back: "Indietro",
    createAccount: "Crea account",
    fullName: "Nome completo",
    setPin: "Imposta un PIN a 6 cifre",
    haveAccount: "Hai già un account?",
    login: "Accedi",
  },
  kyc: {
    ...en.kyc,
    title: "Verifica identità (KYC)",
    start: "Inizia verifica",
    continue: "Continua",
    submit: "Invia",
    labels: {
      none: "Non iniziato",
      draft: "Bozza",
      pending: "In revisione",
      approved: "Verificato",
      rejected: "Rifiutato",
    },
  },
});

const zh = overlay(en, {
  header: { login: "登录", register: "注册", home: "首页", menu: "菜单", language: "语言" },
  nav: { trade: "交易", account: "账户", download: "下载应用", about: "关于", help: "帮助" },
  hero: {
    line1: "以每笔交易",
    trust: "建立信任",
    line2: "",
    startTrading: "开始交易",
    startInvesting: "开始投资",
    learnMore: "了解更多",
  },
  install: {
    title: "安装 UBS 应用",
    subtitle: "添加到主屏幕 / 桌面，像原生应用一样打开",
    cta: "安装",
    iosHelp: "Safari：共享 → 添加到主屏幕",
    desktopHelp: "浏览器菜单“安装应用”或地址栏安装图标。",
    gotIt: "知道了",
  },
  app: {
    hello: "你好，",
    balance: "可用余额",
    account: "账户",
    kycNeeded: "需要身份验证",
    kycNeededSub: "像银行 App 一样逐步完成",
    tradeCta: "交易",
    tradeSub: "WebTrader",
    kyc: "KYC",
    home: "首页",
    trade: "交易",
    accountTab: "账户",
    status: "账户状态",
    active: "正常",
    verification: "验证",
    open: "打开",
    myAccount: "我的账户",
    name: "姓名",
    email: "邮箱",
    accountNo: "账号",
    logout: "退出",
  },
  auth: {
    mobileLogin: "手机银行登录",
    enterEmail: "输入邮箱",
    emailHint: "然后用 6 位 PIN 确认。",
    email: "邮箱",
    continue: "继续",
    wait: "请稍候…",
    noAccount: "还没有账户？",
    register: "注册",
    securityPin: "安全 PIN",
    enterPin: "输入 PIN",
    back: "返回",
    createAccount: "创建账户",
    fullName: "全名",
    setPin: "设置 6 位 PIN",
    haveAccount: "已有账户？",
    login: "登录",
  },
  kyc: {
    ...en.kyc,
    title: "身份验证 (KYC)",
    start: "开始验证",
    continue: "继续",
    submit: "提交",
    labels: {
      none: "未开始",
      draft: "草稿",
      pending: "审核中",
      approved: "已验证",
      rejected: "已拒绝",
    },
  },
});

export const MESSAGES: Record<Locale, Messages> = {
  en,
  tr,
  de,
  fr,
  es,
  ar,
  ru,
  pt,
  it,
  zh,
};

export function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? "");
}
