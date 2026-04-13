export const DEFAULT_LOCALE = "tr";

export const LOCALE_OPTIONS = [
  { id: "tr", labelKey: "locales.tr" },
  { id: "en", labelKey: "locales.en" },
];

const translations = {
  tr: {
    providers: {
      names: {
        openalex: "OpenAlex",
        crossref: "Crossref",
        semanticScholar: "Semantic Scholar",
        core: "CORE",
        yoktez: "YÖK Tez",
      },
      common: {
        computerScience: "Bilgisayar Bilimi",
        ai: "Yapay Zeka",
        ml: "Makine Öğrenmesi",
        nlp: "Doğal Dil İşleme",
        cv: "Bilgisayarlı Görü",
        robotics: "Robotik",
        math: "Matematik",
        statistics: "İstatistik",
        physics: "Fizik",
        quantBiology: "Kantitatif Biyoloji",
        economics: "Ekonomi",
        biology: "Biyoloji",
        preprint: "Preprint",
      },
      client: {
        filterLabel: "Konu",
        filterLabelPlural: "Konular",
        filterSearchPlaceholder: "Konu ara",
        filterEmptyMessage: "Bu aramayla eşleşen {label} konusu yok.",
        all: "Tüm konular",
        feedErrorHint: "{label} verisi alınamadı.",
      },
      openalex: {
        all: "Tüm konular",
      },
      crossref: {
        all: "Tüm konular",
      },
      semanticScholar: {
        all: "Tüm konular",
      },
      core: {
        all: "Tüm konular",
      },
      yoktez: {
        filterLabel: "Anabilim dalı",
        filterLabelPlural: "Anabilim dalları",
        filterSearchPlaceholder: "Anabilim dalı ara",
        filterEmptyMessage: "Bu aramayla eşleşen anabilim dalı yok.",
        all: "Tüm Konular",
        feedErrorHint: "Back-end ayarlarını kontrol et.",
        requiresServer:
          "YÖK Tez için devam etmeden önce kendi sunucu URL adresini gir.",
      },
    },
    locales: {
      tr: "Türkçe",
      en: "English",
    },
    app: {
      title: "TezTok",
      offlineReady: "Çevrimdışı mod: Daha önce açtığın tezler ve sayfalar önbellekten gösteriliyor.",
    },
    tabs: {
      feed: "Akış",
      likes: "Beğeniler",
      settings: "Ayarlar",
    },
    install: {
      badge: "Uygulama",
      title: "TezTok'u yükle",
      androidBody:
        "Telefonunda daha hızlı açılması ve çevrimdışı daha iyi çalışması için uygulamayı yükleyebilirsin.",
      iosBody:
        "iPhone'da uygulama gibi kullanmak için Safari paylaş menüsünden ana ekrana ekle.",
      webBody:
        "Bu uygulamayı cihazına ekleyip tam ekran açabilir ve önbelleği daha iyi kullanabilirsin.",
      androidAction: "Uygulamayı yükle",
      webAction: "Yükle",
      iosLabel: "Safari'de ana ekrana ekle",
      iosTitle: "iPhone'a yükleme adımları",
      iosStep1: "Safari'de alttaki Paylaş düğmesine dokun.",
      iosStep2: "\"Ana Ekrana Ekle\" seçeneğini seç.",
      iosStep3: "Ekle'ye dokunup uygulamayı ana ekrandan aç.",
    },
    options: {
      theme: {
        light: "Açık",
        dark: "Koyu",
      },
      feedOrder: {
        random: "Rastgele",
        latest: "En yeni",
      },
      haptics: {
        off: "Kapalı",
        light: "Hafif",
        normal: "Normal",
      },
      backgroundImages: {
        off: "Kapalı",
        always: "Açık",
      },
    },
    settings: {
      source: "Kaynak",
      language: "Dil",
      languageTitle: "Dil",
      urlPlaceholder: "https://senin-sunucun.com",
      apiKeyPlaceholder: "API key",
      yoktezServerUrl: "YÖK Tez sunucu URL",
      yoktezServerHelp: "API çağrıları bu adrese yönlendirilir.",
      semanticScholarApiKey: "Semantic Scholar API key",
      semanticScholarApiKeyHelp:
        "İstersen boş bırakabilirsin ama rate limit daha sert olabilir.",
      coreApiKey: "CORE API key",
      coreApiKeyHelp:
        "CORE genelde key bekliyor. Buraya girince Bearer olarak kullanılacak.",
      defaultFilter: "Varsayılan filtre",
      theme: "Tema",
      feedOrder: "Akış sırası",
      haptics: "Haptics",
      backgroundImages: "Arka plan görselleri",
      sourceClientHelp:
        "{label} seçildiğinde akış doğrudan uygulama içinden yüklenir.",
      sourceServerHelp:
        "{label} seçildiğinde kendi API sunucunu girmen gerekir.",
    },
    picker: {
      done: "Tamam",
      all: "Tümü",
      jumpByLetter: "Harfe göre atla",
      chooseFilter: "{label} seç",
      selected: "Seçili",
      filterBy: "{label} göre filtrele",
    },
    sheet: {
      fullAbstract: "Tam özet",
    },
    likes: {
      emptyKicker: "Henüz beğeni yok",
      emptyTitle: "Bir tezi kaydetmek için iki kez dokun.",
      remove: "Beğeniden kaldır",
      googleScholar: "Google Scholar'da ara",
    },
    thesis: {
      readAbstract: "Özeti oku",
      noItems: "Şu anda gösterilecek tez yok.",
      noItemsTitle: "Tez yok",
      feedLoadError: "Tez akışı alınamadı. {hint}",
      filterLoadError: "{label} yüklenemedi. {hint}",
      filterNoItems: "{label} için tez bulunamadı.",
      loadingKicker: "Yükleniyor",
      loadingRandom: "Rastgele tezler getiriliyor...",
      loadingLatest: "En yeni tezler getiriliyor...",
      loadingFiltered: "{label} tezleri getiriliyor...",
      loadingMore: "Daha fazla tez yükleniyor...",
      loadingOverlay: "{label} yükleniyor...",
      photoCredit: "Foto: {label}",
    },
  },
  en: {
    providers: {
      names: {
        openalex: "OpenAlex",
        crossref: "Crossref",
        semanticScholar: "Semantic Scholar",
        core: "CORE",
        yoktez: "YÖK Tez",
      },
      common: {
        computerScience: "Computer Science",
        ai: "Artificial Intelligence",
        ml: "Machine Learning",
        nlp: "Natural Language Processing",
        cv: "Computer Vision",
        robotics: "Robotics",
        math: "Mathematics",
        statistics: "Statistics",
        physics: "Physics",
        quantBiology: "Quantitative Biology",
        economics: "Economics",
        biology: "Biology",
        preprint: "Preprint",
      },
      client: {
        filterLabel: "Topic",
        filterLabelPlural: "Topics",
        filterSearchPlaceholder: "Search topic",
        filterEmptyMessage: "No {label} topic matches this search.",
        all: "All topics",
        feedErrorHint: "{label} data could not be loaded.",
      },
      openalex: {
        all: "All topics",
      },
      crossref: {
        all: "All topics",
      },
      semanticScholar: {
        all: "All topics",
      },
      core: {
        all: "All topics",
      },
      yoktez: {
        filterLabel: "Department",
        filterLabelPlural: "Departments",
        filterSearchPlaceholder: "Search department",
        filterEmptyMessage: "No department matches this search.",
        all: "All topics",
        feedErrorHint: "Check the back-end settings.",
        requiresServer:
          "Enter your own server URL before continuing with YÖK Tez.",
      },
    },
    locales: {
      tr: "Turkish",
      en: "English",
    },
    app: {
      title: "TezTok",
      offlineReady: "Offline mode: previously opened theses and screens are being served from cache.",
    },
    tabs: {
      feed: "Feed",
      likes: "Likes",
      settings: "Settings",
    },
    install: {
      badge: "App",
      title: "Install TezTok",
      androidBody:
        "Install the app for faster launch and a better offline experience on your phone.",
      iosBody:
        "On iPhone, add it from Safari's share sheet to use it like an app.",
      webBody:
        "Add this app to your device to open it fullscreen and get better cache reuse.",
      androidAction: "Install app",
      webAction: "Install",
      iosLabel: "Add to Home Screen in Safari",
      iosTitle: "Install on iPhone",
      iosStep1: "Open Safari and tap the Share button.",
      iosStep2: "Choose \"Add to Home Screen\".",
      iosStep3: "Tap Add, then open TezTok from your home screen.",
    },
    options: {
      theme: {
        light: "Light",
        dark: "Dark",
      },
      feedOrder: {
        random: "Random",
        latest: "Latest",
      },
      haptics: {
        off: "Off",
        light: "Light",
        normal: "Normal",
      },
      backgroundImages: {
        off: "Off",
        always: "On",
      },
    },
    settings: {
      source: "Source",
      language: "Language",
      languageTitle: "Language",
      urlPlaceholder: "https://your-server.com",
      apiKeyPlaceholder: "API key",
      yoktezServerUrl: "YÖK Tez server URL",
      yoktezServerHelp:
        "API calls will be sent to this address. Example: `https://example.com`",
      semanticScholarApiKey: "Semantic Scholar API key",
      semanticScholarApiKeyHelp:
        "You can leave this empty, but rate limits may be stricter.",
      coreApiKey: "CORE API key",
      coreApiKeyHelp:
        "CORE usually expects a key. It will be sent as a `Bearer` token.",
      defaultFilter: "Default filter",
      theme: "Theme",
      feedOrder: "Feed order",
      haptics: "Haptics",
      backgroundImages: "Background images",
      sourceClientHelp:
        "When {label} is selected, the feed loads directly in the app.",
      sourceServerHelp:
        "When {label} is selected, enter your own API server URL.",
    },
    picker: {
      done: "Done",
      all: "All",
      jumpByLetter: "Jump by letter",
      chooseFilter: "Choose {label}",
      selected: "Selected",
      filterBy: "Filter by {label}",
    },
    sheet: {
      fullAbstract: "Full abstract",
    },
    likes: {
      emptyKicker: "No likes yet",
      emptyTitle: "Double tap to save a thesis.",
      remove: "Remove from likes",
      googleScholar: "Search on Google Scholar",
    },
    thesis: {
      readAbstract: "Read abstract",
      noItems: "There is nothing to show right now.",
      noItemsTitle: "No theses",
      feedLoadError: "The thesis feed could not be loaded. {hint}",
      filterLoadError: "{label} could not be loaded. {hint}",
      filterNoItems: "No theses were found for {label}.",
      loadingKicker: "Loading",
      loadingRandom: "Loading random theses...",
      loadingLatest: "Loading the latest theses...",
      loadingFiltered: "Loading {label} theses...",
      loadingMore: "Loading more theses...",
      loadingOverlay: "Loading {label}...",
      photoCredit: "Photo: {label}",
    },
  },
};

export function getLocale(locale) {
  return translations[locale] ? locale : DEFAULT_LOCALE;
}

export function createTranslator(locale) {
  const safeLocale = getLocale(locale);

  return function t(key, params = {}) {
    const value = key
      .split(".")
      .reduce((current, part) => current?.[part], translations[safeLocale]);

    if (typeof value !== "string") {
      return key;
    }

    return value.replace(/\{(\w+)\}/g, (_, token) =>
      String(params[token] ?? ""),
    );
  };
}
