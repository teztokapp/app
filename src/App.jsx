import { useEffect, useRef, useState } from "react";
import {
  isNativePlatform,
  openExternalUrl,
  triggerLikeHaptic,
  triggerOpenHaptic,
  triggerSelectionHaptic,
  triggerTabHaptic,
} from "./native.js";
import {
  BACKEND_YOKTEZ,
  DEFAULT_BACKEND,
  fetchBackgroundImage,
  fetchDisciplines,
  fetchDisciplineFeed,
  fetchFeedPage,
  getBackendOptions,
  getBackendMetadata,
  searchArticles,
  sanitizeBackendSelection,
} from "./api.js";
import { createTranslator, DEFAULT_LOCALE, LOCALE_OPTIONS } from "./i18n.js";
import packageMeta from "../package.json";

const APP_VERSION = packageMeta.version;
const MODAL_CLOSE_DURATION_MS = 220;
const THEME_META_COLORS = {
  light: "#e7e3dc",
  dark: "#000000",
  dracula: "#191a21",
  forest: "#102217",
  solarized: "#fdf6e3",
};

function HeartIcon({ filled }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="action-icon">
      <path
        d="M12 21s-6.716-4.364-9.192-8.246C.786 9.59 2.003 5.75 5.73 4.656c2.053-.603 4.19.155 5.532 1.913 1.342-1.758 3.48-2.516 5.533-1.913 3.726 1.094 4.944 4.934 2.922 8.098C18.716 16.636 12 21 12 21Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PdfIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="action-icon">
      <path
        d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M14 3v5h5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ScholarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="action-icon">
      <path
        d="m3 9 9-5 9 5-9 5-9-5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M7 11.5V15c0 1.5 2.2 3 5 3s5-1.5 5-3v-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21 9v5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="action-icon">
      <path
        d="M4 6h16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M7 12h10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M10 18h4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SparklesIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="action-icon">
      <path
        d="m12 3 1.4 3.6L17 8l-3.6 1.4L12 13l-1.4-3.6L7 8l3.6-1.4L12 3Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="m18.5 14 0.9 2.1 2.1 0.9-2.1 0.9-0.9 2.1-0.9-2.1-2.1-0.9 2.1-0.9 0.9-2.1Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="m5.5 15 0.7 1.6 1.6 0.7-1.6 0.7-0.7 1.6-0.7-1.6-1.6-0.7 1.6-0.7 0.7-1.6Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LayersIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="action-icon">
      <path
        d="m12 4 8 4-8 4-8-4 8-4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="m4 12 8 4 8-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m4 16 8 4 8-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SlidersIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="action-icon">
      <path
        d="M4 7h16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M4 17h16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="9" cy="7" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="15" cy="17" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="action-icon">
      <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 10v5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="12" cy="7" r="1" fill="currentColor" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="action-icon">
      <path
        d="M14 5h5v5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 14 19 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M19 13v4a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const previewAbstract = (text, expanded) => {
  if (expanded || text.length < 140) {
    return text;
  }

  return `${text.slice(0, 140).trim()}...`;
};

const previewTitle = (text, maxLength = 140) => {
  const normalized = String(text ?? "").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength).trim()}...`;
};

const previewAuthors = (text, maxAuthors = 3) => {
  const authors = String(text ?? "")
    .split(",")
    .map((author) => author.trim())
    .filter(Boolean);

  if (authors.length <= maxAuthors) {
    return authors.join(", ");
  }

  return `${authors.slice(0, maxAuthors).join(", ")}, et al.`;
};

function useModalPresence(open) {
  const [isRendered, setIsRendered] = useState(open);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (open) {
      setIsRendered(true);
      setIsClosing(false);
      return undefined;
    }

    if (!isRendered) {
      return undefined;
    }

    setIsClosing(true);
    const timeoutId = window.setTimeout(() => {
      setIsRendered(false);
      setIsClosing(false);
    }, MODAL_CLOSE_DURATION_MS);

    return () => window.clearTimeout(timeoutId);
  }, [open, isRendered]);

  return { isRendered, isClosing };
}

const dedupeThesesById = (items) => {
  const seen = new Set();

  return items.filter((item) => {
    if (!item?.id || seen.has(item.id)) {
      return false;
    }

    seen.add(item.id);
    return true;
  });
};

const hasMinimumTitleWords = (title, minimumWords = 3) =>
  String(title ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length >= minimumWords;

const filterShortTitleTheses = (items = []) =>
  items.filter((item) => hasMinimumTitleWords(item?.title));

const normalizePickerText = (value = "") =>
  value
    .toLocaleLowerCase("tr")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const OFFLINE_CACHE_VERSION = "v2";
const SUPPORT_SLIDE_GAPS = [10, 20];
const SUPPORT_URL = String(import.meta.env.VITE_SUPPORT_URL ?? "").trim();
const MAX_BACKGROUND_IMAGE_CACHE_ITEMS = 24;

const readCachedValue = (key, fallback) => {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeCachedValue = (key, value) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    if (error?.name !== "QuotaExceededError") {
      return;
    }

    try {
      const removableKeys = [];

      for (let index = 0; index < window.localStorage.length; index += 1) {
        const storageKey = window.localStorage.key(index);

        if (storageKey?.startsWith("teztok-cache:")) {
          removableKeys.push(storageKey);
        }
      }

      removableKeys.forEach((storageKey) => {
        window.localStorage.removeItem(storageKey);
      });

      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }
};

const writePreferenceValue = (key, value) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    writeCachedValue(key, value);
  }
};

const trimBackgroundImagesCache = (items) => {
  const entries = Object.entries(items ?? {});

  if (entries.length <= MAX_BACKGROUND_IMAGE_CACHE_ITEMS) {
    return items;
  }

  return Object.fromEntries(entries.slice(-MAX_BACKGROUND_IMAGE_CACHE_ITEMS));
};

const buildOfflineScope = ({
  backend,
  customApiBaseUrl,
  contentLang,
  year,
}) =>
  [
    OFFLINE_CACHE_VERSION,
    backend || "unknown",
    String(customApiBaseUrl ?? "").trim(),
    contentLang || "all",
    year || "0",
  ].join("|");

const getDisciplinesCacheKey = (scope) => `teztok-cache:disciplines:${scope}`;
const getFeedCacheKey = (scope, feedId) => `teztok-cache:feed:${scope}:${feedId}`;
const getBackgroundImagesCacheKey = (scope) => `teztok-cache:backgrounds:${scope}`;
const DEFAULT_YOKTEZ_SERVER_URL = String(
  import.meta.env.VITE_YOKTEZ_API_BASE_URL ?? "https://yoktez-server.vercel.app/",
).trim();

const getInstallPlatform = () => {
  if (isNativePlatform()) {
    return "native";
  }

  const userAgent = String(navigator.userAgent ?? "").toLowerCase();
  const isIos = /iphone|ipad|ipod/.test(userAgent);
  const isAndroid = /android/.test(userAgent);

  if (isIos) {
    return "ios";
  }

  if (isAndroid) {
    return "android";
  }

  return "web";
};

const isStandaloneDisplay = () => {
  const displayModeQuery =
    typeof window.matchMedia === "function"
      ? window.matchMedia("(display-mode: standalone)")
      : null;

  return displayModeQuery?.matches === true || window.navigator.standalone === true;
};

const buildGoogleScholarUrl = (thesis) => {
  const query = [thesis.title].filter(Boolean).join(" ");
  const url = new URL("https://scholar.google.com/scholar");
  url.searchParams.set("hl", "en");
  url.searchParams.set("as_sdt", "0,5");
  url.searchParams.set("q", query);
  return url.toString();
};

const shuffleItems = (items = []) => {
  const nextItems = [...items];

  for (let index = nextItems.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [nextItems[index], nextItems[swapIndex]] = [nextItems[swapIndex], nextItems[index]];
  }

  return nextItems;
};

const buildFeedSlides = (items = []) => {
  const slides = [];
  let nextSupportPosition = SUPPORT_SLIDE_GAPS[0];
  let gapIndex = 0;

  items.forEach((item, index) => {
    slides.push({ kind: "thesis", thesis: item, key: item.id });

    const position = index + 1;
    const shouldInsertSupport = position === nextSupportPosition;

    if (shouldInsertSupport) {
      slides.push({
        kind: "support",
        key: `support-${position}`,
      });

      gapIndex = (gapIndex + 1) % SUPPORT_SLIDE_GAPS.length;
      nextSupportPosition += SUPPORT_SLIDE_GAPS[gapIndex];
    }
  });

  return slides;
};

const DESKTOP_MEDIA_QUERY = "(min-width: 721px) and (pointer: fine)";

const isDesktopViewport = () =>
  !isNativePlatform() &&
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia(DESKTOP_MEDIA_QUERY).matches;

const isEditableElement = (target) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

const getCenteredFeedThesisId = (container) => {
  if (!(container instanceof HTMLElement)) {
    return null;
  }

  const slides = Array.from(container.querySelectorAll("[data-thesis-id]"));

  if (!slides.length) {
    return null;
  }

  const viewportCenter = window.innerHeight / 2;
  let closestId = null;
  let closestDistance = Number.POSITIVE_INFINITY;

  slides.forEach((slide) => {
    const thesisId = slide.getAttribute("data-thesis-id");

    if (!thesisId) {
      return;
    }

    const rect = slide.getBoundingClientRect();
    const slideCenter = rect.top + rect.height / 2;
    const distance = Math.abs(slideCenter - viewportCenter);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestId = thesisId;
    }
  });

  return closestId;
};

const scrollFeedByDirection = (container, direction) => {
  if (!(container instanceof HTMLElement)) {
    return;
  }

  const slides = Array.from(container.querySelectorAll(".snap-screen"));

  if (!slides.length) {
    return;
  }

  const viewportCenter = window.innerHeight / 2;
  let currentIndex = 0;
  let closestDistance = Number.POSITIVE_INFINITY;

  slides.forEach((slide, index) => {
    const rect = slide.getBoundingClientRect();
    const slideCenter = rect.top + rect.height / 2;
    const distance = Math.abs(slideCenter - viewportCenter);

    if (distance < closestDistance) {
      closestDistance = distance;
      currentIndex = index;
    }
  });

  const nextIndex = Math.min(
    Math.max(currentIndex + direction, 0),
    slides.length - 1,
  );

  slides[nextIndex]?.scrollIntoView({ block: "start", behavior: "smooth" });
};

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="tab-icon">
      <path
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1v-9.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="tab-icon">
      <path
        d="M6 4.5A2.5 2.5 0 0 1 8.5 2H19v17H8.5A2.5 2.5 0 0 0 6 21.5m0-17v17m0-17H17"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="tab-icon">
      <circle
        cx="11"
        cy="11"
        r="6.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="m16 16 4 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="tab-icon">
      <path
        d="M12 8.6a3.4 3.4 0 1 0 0 6.8 3.4 3.4 0 0 0 0-6.8Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="m19.4 15.1 1.2 2.1-2.1 2.1-2.1-1.2a8.5 8.5 0 0 1-1.9.8L14 21h-4l-.5-2.1a8.5 8.5 0 0 1-1.9-.8l-2.1 1.2-2.1-2.1 1.2-2.1a8.5 8.5 0 0 1-.8-1.9L1 13v-2l2.1-.5a8.5 8.5 0 0 1 .8-1.9L2.7 6.5l2.1-2.1 2.1 1.2a8.5 8.5 0 0 1 1.9-.8L10 3h4l.5 2.1a8.5 8.5 0 0 1 1.9.8l2.1-1.2 2.1 2.1-1.2 2.1a8.5 8.5 0 0 1 .8 1.9L23 11v2l-2.1.5a8.5 8.5 0 0 1-.8 1.6Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TabIcon({ icon, active }) {
  if (icon === "heart") {
    return <HeartIcon filled={active} />;
  }

  if (icon === "book") {
    return <BookIcon />;
  }

  if (icon === "search") {
    return <SearchIcon />;
  }

  if (icon === "settings") {
    return <SettingsIcon />;
  }

  return <HomeIcon />;
}

function BottomTabBar({ activeTab, onSelect, tabs }) {
  return (
    <nav className="tab-bar" aria-label="Birincil">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={activeTab === tab.id ? "tab-button active" : "tab-button"}
          onClick={() => onSelect(tab.id)}
        >
          <span className="tab-icon-wrap">
            <TabIcon icon={tab.icon} active={activeTab === tab.id} />
            {tab.badge ? <span className="tab-badge" aria-hidden="true" /> : null}
          </span>
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}

function ShortcutKey({ label }) {
  return <kbd className="shortcut-key">{label}</kbd>;
}

function DesktopShortcutPanel({ title, items, align = "left" }) {
  if (!items.length) {
    return null;
  }

  return (
    <aside
      className={`desktop-shortcuts desktop-shortcuts-${align}`}
      aria-label={title}
    >
      <p className="desktop-shortcuts-title">{title}</p>
      <div className="desktop-shortcuts-list">
        {items.map((item) => (
          <div key={`${title}-${item.label}`} className="desktop-shortcut-item">
            <div className="desktop-shortcut-keys" aria-hidden="true">
              {item.keys.map((key) => (
                <ShortcutKey key={key} label={key} />
              ))}
            </div>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="settings-chevron">
      <path
        d="m7 4 6 6-6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SettingsGlyph({ tone = "neutral", children }) {
  return (
    <span className={`settings-select-icon settings-select-icon-${tone}`} aria-hidden="true">
      {children}
    </span>
  );
}

function SettingsSelectRow({
  label,
  value,
  helper,
  onOpen,
  indicator,
  leadingIcon,
  leadingTone = "neutral",
  valueAsBadge = false,
}) {
  const hasValue = Boolean(value);

  return (
    <div
      className={[
        "info-row",
        hasValue ? "settings-row-detail" : "settings-row-inline",
        leadingIcon ? "settings-row-with-icon" : "",
      ].join(" ")}
    >
      {hasValue ? (
        <>
          <div className="settings-label-row">
            <p>{label}</p>
            {indicator ? <span className="settings-indicator">{indicator}</span> : null}
          </div>
          <button
            type="button"
            className="settings-select"
            onClick={onOpen}
          >
            <span className={valueAsBadge ? "settings-value-badge" : undefined}>{value}</span>
            <ChevronIcon />
          </button>
        </>
      ) : (
        <button
          type="button"
          className="settings-select settings-select-inline"
          onClick={onOpen}
        >
          <span className="settings-select-label">
            {leadingIcon ? <SettingsGlyph tone={leadingTone}>{leadingIcon}</SettingsGlyph> : null}
            <span>{label}</span>
          </span>
          <ChevronIcon />
        </button>
      )}
      {helper ? <span className="settings-helper-text">{helper}</span> : null}
    </div>
  );
}

function AboutSheet({ open, onClose, t }) {
  const { isRendered, isClosing } = useModalPresence(open);

  if (!isRendered) {
    return null;
  }

  return (
    <div
      className={isClosing ? "sheet-backdrop modal-closing" : "sheet-backdrop"}
      onClick={onClose}
      aria-hidden="true"
    >
      <section
        className="abstract-sheet about-sheet"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={t("settings.aboutTitle")}
      >
        <div className="sheet-handle" />
        <div className="sheet-header">
          <p>{t("settings.aboutBadge")}</p>
          <button type="button" className="sheet-close" onClick={onClose}>
            {t("picker.done")}
          </button>
        </div>
        <div className="about-sheet-intro">
          <img className="about-sheet-icon" src="/icon.png" alt="" aria-hidden="true" />
          <div>
            <h3>{t("settings.aboutAppName")}</h3>
            <p className="about-sheet-version">
              {t("settings.aboutVersion", { version: APP_VERSION })}
            </p>
          </div>
        </div>
        <div className="sheet-body about-sheet-body">
          <p>{t("settings.aboutBody")}</p>
        </div>
      </section>
    </div>
  );
}

function InstallSettingsRow({ t, installPlatform, onInstallApp }) {
  const value =
    installPlatform === "android"
      ? t("install.androidAction")
      : installPlatform === "ios"
        ? t("install.iosLabel")
        : t("install.webAction");
  const helper =
    installPlatform === "android"
      ? t("install.androidBody")
      : installPlatform === "ios"
        ? `${t("install.iosStep1")} ${t("install.iosStep2")} ${t("install.iosStep3")}`
        : t("install.webBody");

  if (installPlatform === "ios") {
    return (
      <div className="info-row settings-row-detail settings-row-with-icon settings-install-row">
        <div className="settings-install-header">
          <span className="settings-select-label">
            <SettingsGlyph tone="blue">
              <ShareIcon />
            </SettingsGlyph>
            <span>{t("install.title")}</span>
          </span>
          <ChevronIcon />
        </div>
        <span className="settings-helper-text">{helper}</span>
      </div>
    );
  }

  return (
    <SettingsSelectRow
      label={t("install.title")}
      value={value}
      helper={helper}
      onOpen={onInstallApp}
      indicator=" "
      leadingIcon={<ShareIcon />}
      leadingTone="blue"
      valueAsBadge
    />
  );
}

function SettingsSection({ title, children, hideTitle = false }) {
  return (
    <section className="settings-section">
      {!hideTitle ? <p className="settings-section-title">{title}</p> : null}
      <div className="settings-section-body">{children}</div>
    </section>
  );
}

function SupportSlide({ t, onContinue }) {
  const hasSupportUrl = Boolean(SUPPORT_URL);

  return (
    <article className="thesis-screen support-screen">
      <div className="screen-atmosphere" />
      <div className="screen-grid" />

      <div className="screen-topline">
        <span className="meta-pill support-pill">{t("support.badge")}</span>
      </div>

      <div className="screen-main support-main">
        <p className="screen-kicker">{t("support.kicker")}</p>
        <h1>{t("support.title")}</h1>
        <p className="support-copy">{t("support.body")}</p>
      </div>

      <div className="screen-bottom support-bottom">
        <div className="support-actions">
          {hasSupportUrl ? (
            <button
              type="button"
              className="support-button support-button-primary"
              onClick={() => openExternalUrl(SUPPORT_URL)}
              data-no-double-tap="true"
            >
              {t("support.primaryAction")}
            </button>
          ) : null}
          <button
            type="button"
            className="support-button"
            onClick={onContinue}
            data-no-double-tap="true"
          >
            {t("support.secondaryAction")}
          </button>
        </div>
      </div>
    </article>
  );
}

function FeedLoadingState({ t }) {
  return (
    <section className="info-screen empty-state feed-loading-state">
      <div className="feed-loader" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <p className="info-kicker">{t("thesis.loadingKicker")}</p>
    </section>
  );
}

function SettingsScreen({
  t,
  localeOptions,
  backendOptions,
  themeOptions,
  hapticsOptions,
  backgroundImageOptions,
  contentLangOptions,
  feedModeOptions,
  theme,
  locale,
  backend,
  backendMeta,
  yoktezServerUrl,
  onYoktezServerUrlChange,
  defaultDisciplineLabel,
  onOpenDefaultDisciplinePicker,
  hapticsMode,
  backgroundImagesMode,
  contentLang,
  year,
  yearOptions,
  feedMode,
  onOpenSettingsPicker,
  showInstallPrompt,
  installPlatform,
  onInstallApp,
  onOpenAbout,
  activeSection,
  onSetActiveSection,
}) {
  const themeLabel =
    themeOptions.find((option) => option.id === theme)?.label ?? theme;
  const localeLabel =
    localeOptions.find((option) => option.id === locale)?.label ?? locale;
  const backendLabel = backendOptions.find((option) => option.id === backend)?.label ?? backend;
  const hapticsLabel =
    hapticsOptions.find((option) => option.id === hapticsMode)?.label ?? hapticsMode;
  const backgroundImagesLabel =
    backgroundImageOptions.find((option) => option.id === backgroundImagesMode)?.label ??
    backgroundImagesMode;
  const feedModeLabel =
    feedModeOptions.find((option) => option.id === feedMode)?.label ?? feedMode;
  const contentLangLabel =
    contentLangOptions.find((option) => option.id === contentLang)?.label ??
    contentLang;
  const yearLabel =
    yearOptions.find((option) => option.id === year)?.label ?? year;
  const showNativeHaptics = isNativePlatform();
  const settingsSections = [
    { id: "general", label: t("settings.sections.general"), icon: <SlidersIcon />, tone: "gray" },
    { id: "appearance", label: t("settings.sections.appearance"), icon: <SparklesIcon />, tone: "blue" },
    { id: "sources", label: t("settings.sections.sources"), icon: <LayersIcon />, tone: "orange" },
  ];

  return (
    <section className="info-screen settings-screen">
      <div className="info-list">
        <div
          key={activeSection ?? "root"}
          className="settings-page-transition"
        >
          {activeSection ? (
            <>
              {activeSection === "general" ? (
                <SettingsSection title={t("settings.sections.general")} hideTitle>
                  <SettingsSelectRow
                    label={t("settings.language")}
                    value={localeLabel}
                    onOpen={() => onOpenSettingsPicker("locale")}
                  />
                  <SettingsSelectRow
                    label={t("settings.defaultFilter")}
                    value={defaultDisciplineLabel}
                    onOpen={onOpenDefaultDisciplinePicker}
                  />
                  <SettingsSelectRow
                    label={t("settings.contentLanguage")}
                    value={contentLangLabel}
                    onOpen={() => onOpenSettingsPicker("contentLang")}
                  />
                </SettingsSection>
              ) : null}

              {activeSection === "appearance" ? (
                <SettingsSection title={t("settings.sections.appearance")} hideTitle>
                  <SettingsSelectRow
                    label={t("settings.theme")}
                    value={themeLabel}
                    onOpen={() => onOpenSettingsPicker("theme")}
                  />
                  <SettingsSelectRow
                    label={t("settings.feedOrder")}
                    value={feedModeLabel}
                    onOpen={() => onOpenSettingsPicker("feedMode")}
                  />
                  {showNativeHaptics ? (
                    <SettingsSelectRow
                      label={t("settings.haptics")}
                      value={hapticsLabel}
                      onOpen={() => onOpenSettingsPicker("haptics")}
                    />
                  ) : null}
                  {backendMeta.supportsBackgroundImages ? (
                    <SettingsSelectRow
                      label={t("settings.backgroundImages")}
                      value={backgroundImagesLabel}
                      onOpen={() => onOpenSettingsPicker("backgroundImages")}
                    />
                  ) : null}
                </SettingsSection>
              ) : null}

              {activeSection === "sources" ? (
                <SettingsSection title={t("settings.sections.sources")} hideTitle>
                  <SettingsSelectRow
                    label={t("settings.source")}
                    value={backendLabel}
                    helper={
                      backendMeta.clientOnly
                        ? t("settings.sourceClientHelp", { label: backendLabel })
                        : t("settings.sourceServerHelp", { label: backendLabel })
                    }
                    onOpen={() => onOpenSettingsPicker("backend")}
                  />
                  {backend === BACKEND_YOKTEZ ? (
                    <div className="info-row">
                      <p>{t("settings.yoktezServerUrl")}</p>
                      <input
                        className="settings-input"
                        type="url"
                        inputMode="url"
                        placeholder={t("settings.urlPlaceholder")}
                        value={yoktezServerUrl}
                        onChange={(event) => onYoktezServerUrlChange(event.target.value)}
                      />
                      <span>
                        {t("settings.yoktezServerHelp")}
                      </span>
                    </div>
                  ) : null}
                </SettingsSection>
              ) : null}

            </>
          ) : (
            <>
              {showInstallPrompt ? (
                <SettingsSection title={t("install.title")} hideTitle>
                  <InstallSettingsRow
                    t={t}
                    installPlatform={installPlatform}
                    onInstallApp={onInstallApp}
                  />
                </SettingsSection>
              ) : null}

              <SettingsSection title={t("tabs.settings")} hideTitle>
                {settingsSections.map((section) => (
                  <SettingsSelectRow
                    key={section.id}
                    label={section.label}
                    value=""
                    leadingIcon={section.icon}
                    leadingTone={section.tone}
                    onOpen={() => onSetActiveSection(section.id)}
                  />
                ))}
              </SettingsSection>

              <SettingsSection title={t("settings.aboutTitle")} hideTitle>
                <SettingsSelectRow
                  label={t("settings.aboutTitle")}
                  value=""
                  leadingIcon={<InfoIcon />}
                  leadingTone="blue"
                  onOpen={onOpenAbout}
                />
              </SettingsSection>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function WheelPickerSheet({
  t,
  open,
  title,
  options,
  selectedId,
  onClose,
  onSelect,
  onSelectHaptic,
}) {
  const { isRendered, isClosing } = useModalPresence(open);

  if (!isRendered) {
    return null;
  }

  return (
    <div
      className={isClosing ? "sheet-backdrop modal-closing" : "sheet-backdrop"}
      onClick={onClose}
      aria-hidden="true"
    >
      <section
        className="wheel-sheet"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="sheet-handle" />
        <div className="sheet-header">
          <p>{title}</p>
          <button type="button" className="sheet-close" onClick={onClose}>
            {t("picker.done")}
          </button>
        </div>
        <div className="wheel-picker-list radio-list" role="radiogroup" aria-label={title}>
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={selectedId === option.id}
              className={
                selectedId === option.id
                  ? "wheel-picker-item active"
                  : "wheel-picker-item"
              }
              onClick={() => {
                onSelectHaptic();
                onSelect(option.id);
              }}
            >
              <span>{option.label}</span>
              <span
                className={
                  selectedId === option.id
                    ? "radio-indicator active"
                    : "radio-indicator"
                }
                aria-hidden="true"
              />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function FeedFilterSheet({
  t,
  open,
  filterLabel,
  yearOptions,
  selectedYearId,
  onSelectYear,
  disciplineOptions,
  selectedDisciplineId,
  onSelectDiscipline,
  searchPlaceholder,
  emptyMessage,
  onClose,
  onSelectHaptic,
}) {
  const [query, setQuery] = useState("");
  const { isRendered, isClosing } = useModalPresence(open);

  useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

  if (!isRendered) {
    return null;
  }

  const normalizedQuery = normalizePickerText(query);
  const visibleOptions = disciplineOptions.filter((option) => {
    if (option.id === "all") {
      return true;
    }

    return !normalizedQuery || normalizePickerText(option.label).includes(normalizedQuery);
  });

  return (
    <div
      className={isClosing ? "sheet-backdrop picker-backdrop modal-closing" : "sheet-backdrop picker-backdrop"}
      onClick={onClose}
      aria-hidden="true"
    >
      <section
        className="discipline-picker filter-sheet"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={t("picker.filtersTitle")}
      >
        <div className="sheet-handle" />
        <div className="picker-header">
          <div>
            <p className="info-kicker">{t("picker.filtersKicker")}</p>
            <h3>{t("picker.filtersTitle")}</h3>
          </div>
          <button type="button" className="sheet-close" onClick={onClose}>
            {t("picker.done")}
          </button>
        </div>

        <div className="filter-section">
          <div className="filter-section-header">
            <p>{t("settings.year")}</p>
          </div>
          <div className="filter-chip-row" role="radiogroup" aria-label={t("settings.year")}>
            {yearOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={selectedYearId === option.id}
                className={selectedYearId === option.id ? "filter-chip active" : "filter-chip"}
                onClick={() => {
                  onSelectHaptic();
                  onSelectYear(option.id);
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-section">
          <div className="filter-section-header">
            <p>{filterLabel}</p>
          </div>
          <input
            className="picker-search"
            type="search"
            placeholder={searchPlaceholder}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div className="picker-list filter-topic-list">
            {visibleOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                className={option.id === selectedDisciplineId ? "picker-item active" : "picker-item"}
                onClick={() => {
                  onSelectHaptic();
                  onSelectDiscipline(option.id);
                }}
              >
                <span>{option.label}</span>
                {option.id === selectedDisciplineId ? <strong>{t("picker.selected")}</strong> : null}
              </button>
            ))}
            {visibleOptions.length === 0 ? <div className="picker-empty">{emptyMessage}</div> : null}
          </div>
        </div>
      </section>
    </div>
  );
}

function DisciplinePickerModal({
  t,
  open,
  title,
  heading,
  searchPlaceholder,
  emptyMessage,
  options,
  selectedId,
  onClose,
  onSelect,
  onSelectHaptic,
}) {
  const [query, setQuery] = useState("");
  const [activeLetter, setActiveLetter] = useState("");
  const { isRendered, isClosing } = useModalPresence(open);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setActiveLetter("");
    }
  }, [open]);

  if (!isRendered) {
    return null;
  }

  const letters = Array.from(
    new Set(
      options
        .filter((option) => option.id !== "all")
        .map((option) => option.label.trim().charAt(0).toLocaleUpperCase("tr"))
        .filter(Boolean),
    ),
  ).sort((left, right) => left.localeCompare(right, "tr"));

  const normalizedQuery = normalizePickerText(query);
  const visibleOptions = options.filter((option) => {
    const matchesQuery =
      !normalizedQuery ||
      normalizePickerText(option.label).includes(normalizedQuery);
    const matchesLetter =
      !activeLetter ||
      option.label.trim().charAt(0).toLocaleUpperCase("tr") === activeLetter;

    return matchesQuery && matchesLetter;
  });

  return (
    <div
      className={isClosing ? "sheet-backdrop picker-backdrop modal-closing" : "sheet-backdrop picker-backdrop"}
      onClick={onClose}
      aria-hidden="true"
    >
      <section
        className="discipline-picker"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="sheet-handle" />
        <div className="picker-header">
          <div>
            <p className="info-kicker">{title}</p>
            <h3>{heading}</h3>
          </div>
          <button type="button" className="sheet-close" onClick={onClose}>
            {t("picker.done")}
          </button>
        </div>
        <input
          className="picker-search"
          type="search"
          placeholder={searchPlaceholder}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="picker-letters" aria-label={t("picker.jumpByLetter")}>
          <button
            type="button"
            className={activeLetter === "" ? "picker-letter active" : "picker-letter"}
            onClick={() => setActiveLetter("")}
          >
            {t("picker.all")}
          </button>
          {letters.map((letter) => (
            <button
              key={letter}
              type="button"
              className={activeLetter === letter ? "picker-letter active" : "picker-letter"}
              onClick={() => setActiveLetter(letter)}
            >
              {letter}
            </button>
          ))}
        </div>
        <div className="picker-list">
          {visibleOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              className={option.id === selectedId ? "picker-item active" : "picker-item"}
              onClick={() => {
                onSelectHaptic();
                onSelect(option.id);
                onClose();
              }}
            >
              <span>{option.label}</span>
              {option.id === selectedId ? <strong>{t("picker.selected")}</strong> : null}
            </button>
          ))}
          {visibleOptions.length === 0 ? (
            <div className="picker-empty">{emptyMessage}</div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function AbstractSheet({ thesis, open, onClose, onShare, noteValue, onNoteChange, t }) {
  const { isRendered, isClosing } = useModalPresence(open);
  const [displayThesis, setDisplayThesis] = useState(thesis);
  const [activeView, setActiveView] = useState("abstract");

  useEffect(() => {
    if (thesis) {
      setDisplayThesis(thesis);
      setActiveView("abstract");
    }
  }, [thesis]);

  if (!isRendered || !displayThesis) {
    return null;
  }

  return (
    <div
      className={isClosing ? "sheet-backdrop modal-closing" : "sheet-backdrop"}
      onClick={onClose}
      aria-hidden="true"
    >
      <section
        className="abstract-sheet"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={t("sheet.fullAbstract")}
      >
        <div className="sheet-handle" />
        <div className="sheet-header">
          <p>{displayThesis.author}</p>
          <button type="button" className="sheet-close" onClick={onClose}>
            {t("picker.done")}
          </button>
        </div>
        <h3>{displayThesis.title}</h3>
        <div className="abstract-sheet-actions">
          <button type="button" className="ghost-button" onClick={() => onShare(displayThesis)}>
            {t("thesis.share")}
          </button>
        </div>
        <div className="sheet-tab-bar" role="tablist" aria-label={t("sheet.fullAbstract")}>
          <button
            type="button"
            role="tab"
            aria-selected={activeView === "abstract"}
            className={activeView === "abstract" ? "sheet-tab active" : "sheet-tab"}
            onClick={() => setActiveView("abstract")}
          >
            {t("search.actions.abstract")}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeView === "notes"}
            className={activeView === "notes" ? "sheet-tab active" : "sheet-tab"}
            onClick={() => setActiveView("notes")}
          >
            {t("thesis.notes")}
          </button>
        </div>
        {activeView === "abstract" ? (
          <div className="sheet-body">
            <p>{displayThesis.abstract}</p>
          </div>
        ) : (
          <div className="note-panel">
            <label className="note-label" htmlFor={`note-${displayThesis.id}`}>
              {t("thesis.notes")}
            </label>
            <textarea
              id={`note-${displayThesis.id}`}
              className="note-input"
              value={noteValue}
              onChange={(event) => onNoteChange(event.target.value)}
              placeholder={t("thesis.notesPlaceholder")}
            />
          </div>
        )}
      </section>
    </div>
  );
}

function LikedThesisList({ items, onOpenFeed, onRemoveLike, t }) {
  return (
    <section className="likes-list-screen">
      <div className="settings-page-transition" key={items.length === 0 ? "empty" : "list"}>
        {items.length === 0 ? (
          <div className="empty-copy empty-likes">
            <div className="empty-face" aria-hidden="true">
              :(
            </div>
            <p className="info-kicker">{t("likes.emptyKicker")}</p>
            <h3>{t("likes.emptyTitle")}</h3>
          </div>
        ) : (
          <div className="likes-list">
            {items.map((thesis) => (
              <article key={thesis.id} className="liked-item">
                <button
                  type="button"
                  className="liked-item-open"
                  onClick={() => onOpenFeed(thesis.id)}
                >
                <div className="liked-item-meta">
                  <span>{thesis.year}</span>
                  <span>{thesis.author}</span>
                </div>
                <h3>{thesis.title}</h3>
                <p>{thesis.university}</p>
                </button>
                <button
                  type="button"
                  className="liked-item-remove"
                  onClick={() => onRemoveLike(thesis)}
                >
                  {t("likes.remove")}
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function SearchResultList({
  items,
  loading,
  error,
  emptyMessage,
  open,
  onClose,
  searchValues,
  onSearchValueChange,
  onSubmit,
  onToggleLike,
  likedIds,
  onOpenAbstract,
  showGeneralQuery = true,
  t,
}) {
  const hasSearched = Object.values(searchValues).some((value) => String(value ?? "").trim());

  return (
    <section className="likes-list-screen search-screen">
      <div className="search-shell">
        <div className="settings-page-transition" key={open ? "results" : "form"}>
          {open ? (
            <>
              {error ? <p className="search-error">{error}</p> : null}

              {items.length > 0 ? (
                <div className="likes-list search-results-page">
                  {items.map((item) => {
                    const hasAbstract = Boolean(String(item.abstract ?? "").trim());
                    const hasPdf = Boolean(String(item.pdfUrl ?? "").trim());
                    const hasDetail = Boolean(String(item.detailPageUrl ?? "").trim());

                    return (
                      <article key={item.id} className="liked-item search-result-item">
                        <div className="liked-item-open">
                          <div className="liked-item-meta">
                            <span>{item.year}</span>
                            <span>{item.author || t("search.noAuthor")}</span>
                          </div>
                          <h3>{item.title}</h3>
                          <p>{item.university}</p>
                          <p className="search-result-department">{item.department}</p>
                          {hasAbstract ? (
                            <p className="search-result-abstract">{previewAbstract(item.abstract, false)}</p>
                          ) : null}
                        </div>
                        <div className="search-result-actions">
                          <button
                            type="button"
                            className={likedIds.includes(item.id) ? "liked-item-remove active-text" : "liked-item-remove"}
                            onClick={() => onToggleLike(item)}
                          >
                            {likedIds.includes(item.id) ? t("search.actions.saved") : t("search.actions.save")}
                          </button>
                          {hasAbstract ? (
                            <button
                              type="button"
                              className="liked-item-remove"
                              onClick={() => onOpenAbstract(item.id)}
                            >
                              {t("search.actions.abstract")}
                            </button>
                          ) : null}
                          {hasPdf ? (
                            <a
                              className="liked-item-remove"
                              href={item.pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {t("search.actions.pdf")}
                            </a>
                          ) : null}
                          {hasDetail ? (
                            <a
                              className="liked-item-remove"
                              href={item.detailPageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {t("search.actions.open")}
                            </a>
                          ) : null}
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-copy empty-likes search-empty">
                  <div className="empty-face" aria-hidden="true">
                    ?
                  </div>
                  <p className="info-kicker">
                    {hasSearched ? t("search.resultsKicker") : t("search.emptyKicker")}
                  </p>
                  <h3>{hasSearched ? emptyMessage : t("search.emptyTitle")}</h3>
                </div>
              )}
            </>
          ) : (
            <form
              className="search-form-card"
              onSubmit={(event) => {
                event.preventDefault();
                onSubmit();
              }}
            >
              <div className="search-form-grid">
                {showGeneralQuery ? (
                  <label className="search-field">
                    <span>{t("search.fields.query")}</span>
                    <input
                      type="search"
                      value={searchValues.query}
                      onChange={(event) => onSearchValueChange("query", event.target.value)}
                      placeholder={t("search.placeholders.query")}
                    />
                  </label>
                ) : null}
                <label className="search-field">
                  <span>{t("search.fields.title")}</span>
                  <input
                    type="search"
                    value={searchValues.title}
                    onChange={(event) => onSearchValueChange("title", event.target.value)}
                    placeholder={t("search.placeholders.title")}
                  />
                </label>
                <label className="search-field">
                  <span>{t("search.fields.author")}</span>
                  <input
                    type="search"
                    value={searchValues.author}
                    onChange={(event) => onSearchValueChange("author", event.target.value)}
                    placeholder={t("search.placeholders.author")}
                  />
                </label>
                <label className="search-field">
                  <span>{t("search.fields.source")}</span>
                  <input
                    type="search"
                    value={searchValues.source}
                    onChange={(event) => onSearchValueChange("source", event.target.value)}
                    placeholder={t("search.placeholders.source")}
                  />
                </label>
                <label className="search-field">
                  <span>{t("search.fields.year")}</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    value={searchValues.year}
                    onChange={(event) => onSearchValueChange("year", event.target.value)}
                    placeholder={t("search.placeholders.year")}
                  />
                </label>
              </div>
              <button type="submit" className="search-submit">
                {loading ? t("search.searching") : t("search.submit")}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function ThesisCard({
  t,
  thesis,
  liked,
  onToggleLike,
  onOpenAbstract,
  onSurfacePointerUp,
  pdfUrl,
  scholarUrl,
  scholarSameTab,
  onShare,
  backgroundImage,
  backgroundMeta,
}) {
  const hasAbstract = Boolean(String(thesis.abstract ?? "").trim());
  const hasPdf = Boolean(String(pdfUrl ?? "").trim());
  const hasScholar = Boolean(String(scholarUrl ?? "").trim());
  const cardTitle = previewTitle(thesis.title, 170);
  const cardAuthors = previewAuthors(thesis.author, 3);
  const cardAbstract = previewAbstract(thesis.abstract, false);

  return (
    <article
      className="thesis-screen"
      onPointerUp={onSurfacePointerUp}
      style={
        backgroundImage
          ? {
              backgroundImage: `linear-gradient(180deg, var(--image-overlay-top), var(--image-overlay-bottom)), url("${backgroundImage}")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : undefined
      }
    >
      <div className="screen-atmosphere" />
      <div className="screen-grid" />

      <div className="screen-topline">
        <span className="meta-pill">{thesis.year}</span>
      </div>

      <div className="screen-main">
        <p className="screen-kicker">
          {thesis.university} / {thesis.department}
        </p>
        <h1 title={thesis.title}>{cardTitle}</h1>
        <p className="author-line" title={thesis.author}>{cardAuthors}</p>
      </div>

      <aside className="screen-side-actions">
        <button
          type="button"
          className={liked ? "action active" : "action"}
          onClick={onToggleLike}
          onPointerUp={(event) => event.stopPropagation()}
          data-no-double-tap="true"
        >
          <HeartIcon filled={liked} />
        </button>
        {hasPdf ? (
          <a
            className="action action-link"
            onPointerUp={(event) => event.stopPropagation()}
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-no-double-tap="true"
          >
            <PdfIcon />
          </a>
        ) : null}
        {hasScholar ? (
          <a
            className="action action-link"
            onPointerUp={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();

              if (scholarSameTab) {
                event.preventDefault();
                openExternalUrl(scholarUrl, { preferSameTab: true });
              }
            }}
            href={scholarUrl}
            target={scholarSameTab ? undefined : "_blank"}
            rel={scholarSameTab ? undefined : "noopener noreferrer"}
            data-no-double-tap="true"
            aria-label={t("likes.googleScholar")}
            title={t("likes.googleScholar")}
          >
            <ScholarIcon />
          </a>
        ) : null}
        <button
          type="button"
          className="action"
          onClick={(event) => {
            event.stopPropagation();
            onShare(thesis);
          }}
          onPointerUp={(event) => event.stopPropagation()}
          data-no-double-tap="true"
          aria-label={t("thesis.share")}
          title={t("thesis.share")}
        >
          <ShareIcon />
        </button>
      </aside>

      <div className="screen-bottom">
        {hasAbstract ? (
          <div className="abstract-panel">
            <p className="abstract-text" title={thesis.abstract}>
              {cardAbstract}
            </p>
            <button
              className="ghost-button"
              onClick={onOpenAbstract}
              data-no-double-tap="true"
            >
              {t("thesis.readAbstract")}
            </button>
          </div>
        ) : null}

        <div className="keywords-row">
          {thesis.keywords.map((keyword) => (
            <span key={keyword} className="keyword-chip">
              {keyword}
            </span>
          ))}
        </div>

        {backgroundMeta?.source === "unsplash" && backgroundMeta.attributionUrl ? (
          <button
            type="button"
            className="background-credit"
            onClick={() => openExternalUrl(backgroundMeta.attributionUrl)}
            data-no-double-tap="true"
          >
            {t("thesis.photoCredit", {
              label: backgroundMeta.attributionLabel ?? "Unsplash",
            })}
          </button>
        ) : null}
      </div>
    </article>
  );
}

export default function App() {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [installPlatform, setInstallPlatform] = useState(() => getInstallPlatform());
  const [isInstalled, setIsInstalled] = useState(() => isNativePlatform() || isStandaloneDisplay());
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState(null);
  const [locale, setLocale] = useState(
    () => window.localStorage.getItem("teztok-locale") ?? DEFAULT_LOCALE,
  );
  const [backend, setBackend] = useState(
    () => sanitizeBackendSelection(
      window.localStorage.getItem("teztok-backend") ?? DEFAULT_BACKEND,
    ),
  );
  const [yoktezServerUrl, setYoktezServerUrl] = useState(
    () => window.localStorage.getItem("teztok-yoktez-server-url") ?? DEFAULT_YOKTEZ_SERVER_URL,
  );
  const [feed, setFeed] = useState([]);
  const [cursor, setCursor] = useState(0);
  const [activeTab, setActiveTab] = useState("feed");
  const [searchValues, setSearchValues] = useState(() => ({
    query: "",
    title: "",
    author: "",
    source: "",
    year: "",
  }));
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchEmptyMessage, setSearchEmptyMessage] = useState("");
  const [searchResultsOpen, setSearchResultsOpen] = useState(false);
  const [settingsActiveSection, setSettingsActiveSection] = useState(null);
  const [feedFilterOpen, setFeedFilterOpen] = useState(false);
  const [disciplineOptions, setDisciplineOptions] = useState([
    {
      id: "all",
      label: createTranslator(
        window.localStorage.getItem("teztok-locale") ?? DEFAULT_LOCALE,
      )("providers.client.all"),
      query: "",
    },
  ]);
  const [defaultDisciplineId, setDefaultDisciplineId] = useState(
    () => window.localStorage.getItem("teztok-default-discipline") ?? "all",
  );
  const [activeDisciplineId, setActiveDisciplineId] = useState(
    () => window.localStorage.getItem("teztok-default-discipline") ?? "all",
  );
  const [disciplinePickerOpen, setDisciplinePickerOpen] = useState(false);
  const [disciplinePickerMode, setDisciplinePickerMode] = useState("active");
  const [theme, setTheme] = useState(
    () => window.localStorage.getItem("teztok-theme") ?? "dark",
  );
  const [feedMode, setFeedMode] = useState(
    () => window.localStorage.getItem("teztok-feed-mode") ?? "random",
  );
  const [hapticsMode, setHapticsMode] = useState(
    () => window.localStorage.getItem("teztok-haptics") ?? "normal",
  );
  const [backgroundImagesMode, setBackgroundImagesMode] = useState(
    () => window.localStorage.getItem("teztok-background-images") ?? "always",
  );
  const [contentLang, setContentLang] = useState(
    () => window.localStorage.getItem("teztok-content-lang") ?? "english",
  );
  const [year, setYear] = useState(
    () => window.localStorage.getItem("teztok-year") ?? "all",
  );
  const [likedIds, setLikedIds] = useState(() => {
    const raw = window.localStorage.getItem("teztok-liked");
    return raw ? JSON.parse(raw) : [];
  });
  const [likedItems, setLikedItems] = useState(() => {
    const raw = window.localStorage.getItem("teztok-liked-items");
    return raw ? JSON.parse(raw) : [];
  });
  const [thesisNotes, setThesisNotes] = useState(() => readCachedValue("teztok-notes", {}));
  const [activeAbstractId, setActiveAbstractId] = useState(null);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [feedEmptyMessage, setFeedEmptyMessage] = useState("");
  const [feedError, setFeedError] = useState("");
  const [heartBursts, setHeartBursts] = useState([]);
  const [backgroundImages, setBackgroundImages] = useState({});
  const [disciplineOptionsReady, setDisciplineOptionsReady] = useState(false);
  const [pendingOpenThesisId, setPendingOpenThesisId] = useState(null);
  const [settingsPicker, setSettingsPicker] = useState(null);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [desktopViewport, setDesktopViewport] = useState(() => isDesktopViewport());
  const [activeDesktopThesisId, setActiveDesktopThesisId] = useState(null);
  const observerRef = useRef(null);
  const tapTrackerRef = useRef({ id: null, time: 0, x: 0, y: 0 });
  const feedRef = useRef(null);
  const likesRef = useRef(null);
  const searchRef = useRef(null);
  const settingsRef = useRef(null);
  const scrollPositionsRef = useRef({ feed: 0, likes: 0, search: 0, settings: 0 });
  const apiConfig = {
    backend,
    customApiBaseUrl: yoktezServerUrl,
    locale,
    contentLang,
    year: year === "all" ? null : year,
  };
  const offlineScope = buildOfflineScope(apiConfig);
  const requiresCustomYoktezUrl =
    backend === BACKEND_YOKTEZ && !yoktezServerUrl.trim();
  const allFeedCacheKey = getFeedCacheKey(offlineScope, `${feedMode}:all`);

  useEffect(() => {
    writeCachedValue("teztok-liked", likedIds);
  }, [likedIds]);

  useEffect(() => {
    writeCachedValue("teztok-notes", thesisNotes);
  }, [thesisNotes]);

  useEffect(() => {
    writeCachedValue("teztok-liked-items", likedItems);
  }, [likedItems]);

  useEffect(() => {
    writePreferenceValue("teztok-default-discipline", defaultDisciplineId);
  }, [defaultDisciplineId]);

  useEffect(() => {
    writePreferenceValue("teztok-locale", locale);
  }, [locale]);

  useEffect(() => {
    writePreferenceValue("teztok-backend", backend);
  }, [backend]);

  useEffect(() => {
    writePreferenceValue("teztok-yoktez-server-url", yoktezServerUrl);
  }, [yoktezServerUrl]);

  useEffect(() => {
    writePreferenceValue("teztok-theme", theme);
    document.documentElement.dataset.theme = theme;
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute("content", THEME_META_COLORS[theme] ?? THEME_META_COLORS.dark);
    }
  }, [theme]);

  useEffect(() => {
    writePreferenceValue("teztok-feed-mode", feedMode);
  }, [feedMode]);

  useEffect(() => {
    writePreferenceValue("teztok-haptics", hapticsMode);
  }, [hapticsMode]);

  useEffect(() => {
    writePreferenceValue("teztok-background-images", backgroundImagesMode);
  }, [backgroundImagesMode]);

  useEffect(() => {
    writePreferenceValue("teztok-content-lang", contentLang);
  }, [contentLang]);

  useEffect(() => {
    writePreferenceValue("teztok-year", year);
  }, [year]);

  useEffect(() => {
    setBackgroundImages(readCachedValue(getBackgroundImagesCacheKey(offlineScope), {}));
  }, [offlineScope]);

  useEffect(() => {
    writeCachedValue(
      getBackgroundImagesCacheKey(offlineScope),
      trimBackgroundImagesCache(backgroundImages),
    );
  }, [backgroundImages, offlineScope]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleInstall = () => setIsInstalled(true);
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredInstallPrompt(event);
    };
    const mediaQuery = window.matchMedia?.("(display-mode: standalone)");
    const desktopMediaQuery = window.matchMedia?.(DESKTOP_MEDIA_QUERY);
    const handleDisplayModeChange = (event) => {
      setIsInstalled(event.matches || window.navigator.standalone === true);
    };
    const handleDesktopViewportChange = (event) => {
      setDesktopViewport(!isNativePlatform() && event.matches);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstall);
    mediaQuery?.addEventListener?.("change", handleDisplayModeChange);
    desktopMediaQuery?.addEventListener?.("change", handleDesktopViewportChange);
    setInstallPlatform(getInstallPlatform());
    setIsInstalled(isNativePlatform() || isStandaloneDisplay());
    setDesktopViewport(isDesktopViewport());

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstall);
      mediaQuery?.removeEventListener?.("change", handleDisplayModeChange);
      desktopMediaQuery?.removeEventListener?.("change", handleDesktopViewportChange);
    };
  }, []);

  const t = createTranslator(locale);
  const canShowInstallPrompt =
    !isInstalled &&
    !isNativePlatform() &&
    (installPlatform === "ios" || installPlatform === "android" || Boolean(deferredInstallPrompt));
  const tabs = [
    { id: "feed", label: t("tabs.feed"), icon: "home" },
    { id: "likes", label: t("tabs.likes"), icon: "heart" },
    { id: "search", label: t("tabs.search"), icon: "search" },
    { id: "settings", label: t("tabs.settings"), icon: "settings", badge: canShowInstallPrompt },
  ];
  const activeTabConfig = tabs.find((tab) => tab.id === activeTab);
  const headerTitle =
    activeTab === "feed"
      ? t("app.title")
      : activeTab === "settings" && settingsActiveSection
        ? t(`settings.sections.${settingsActiveSection}`)
        : activeTab === "search" && searchResultsOpen
          ? t("search.resultsKicker")
          : activeTabConfig?.label ?? t("app.title");
  const headerBackAction =
    activeTab === "settings" && settingsActiveSection
      ? () => setSettingsActiveSection(null)
      : activeTab === "search" && searchResultsOpen
        ? () => setSearchResultsOpen(false)
        : null;
  const headerClassName = activeTab === "feed" ? "header-leading header-leading-feed" : "header-leading";
  const headerTitleClassName = activeTab === "feed" ? "header-title header-title-feed" : "header-title";
  const themeOptions = [
    { id: "light", label: t("options.theme.light") },
    { id: "dark", label: t("options.theme.dark") },
    { id: "dracula", label: t("options.theme.dracula") },
    { id: "forest", label: t("options.theme.forest") },
    { id: "solarized", label: t("options.theme.solarized") },
  ];
  const feedModeOptions = [
    { id: "random", label: t("options.feedOrder.random") },
    { id: "latest", label: t("options.feedOrder.latest") },
  ];
  const hapticsOptions = [
    { id: "off", label: t("options.haptics.off") },
    { id: "light", label: t("options.haptics.light") },
    { id: "normal", label: t("options.haptics.normal") },
  ];
  const backgroundImageOptions = [
    { id: "off", label: t("options.backgroundImages.off") },
    { id: "always", label: t("options.backgroundImages.always") },
  ];
  const contentLangOptions = [
    { id: "english", label: t("options.contentLang.english") },
    { id: "all", label: t("options.contentLang.all") },
  ];
  const CURRENT_YEAR = new Date().getFullYear();
  const yearOptions = [
    { id: "all", label: t("options.year.all") },
    ...Array.from({ length: 30 }, (_, i) => {
      const y = CURRENT_YEAR - i;
      return { id: String(y), label: String(y) };
    }),
  ];
  const localeOptions = LOCALE_OPTIONS.map((option) => ({
    id: option.id,
    label: option.label,
  }));
  const backendOptions = getBackendOptions(locale);
  const activeDisciplineOption =
    disciplineOptions.find((option) => option.id === activeDisciplineId) ??
    disciplineOptions[0];
  const defaultDisciplineOption =
    disciplineOptions.find((option) => option.id === defaultDisciplineId) ??
    disciplineOptions[0];
  const backendMeta = getBackendMetadata(backend, locale);

  const canLoadBackgroundImages =
    backendMeta.supportsBackgroundImages && backgroundImagesMode === "always";

  const fireTabHaptic = () => {
    if (hapticsMode === "off") {
      return;
    }

    void triggerTabHaptic();
  };

  const fireSelectionHaptic = () => {
    if (hapticsMode === "off") {
      return;
    }

    void triggerSelectionHaptic();
  };

  const fireLikeHaptic = (liked) => {
    if (hapticsMode === "off") {
      return;
    }

    void triggerLikeHaptic(liked);
  };

  const fireOpenHaptic = () => {
    if (hapticsMode === "off") {
      return;
    }

    void triggerOpenHaptic();
  };

  async function handleInstallApp() {
    if (!deferredInstallPrompt) {
      return;
    }

    try {
      await deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
    } catch {}

    setDeferredInstallPrompt(null);
  }

  useEffect(() => {
    if (requiresCustomYoktezUrl) {
      setDisciplineOptions([{ id: "all", label: backendMeta.allFilterLabel, query: "" }]);
      setActiveDisciplineId("all");
      setDisciplineOptionsReady(true);
      setFeed([]);
      setCursor(0);
      setLoadingFeed(false);
      setFeedError("");
      setFeedEmptyMessage(t("providers.yoktez.requiresServer"));
      return;
    }

    setDisciplineOptionsReady(false);

    void fetchDisciplines(apiConfig)
      .then((data) => {
        const liveOptions = dedupeThesesById((data.items ?? []).map((item) => ({
          id: item.id,
          label: item.label,
          query: item.query,
        })));

        const nextOptions = [
          { id: "all", label: backendMeta.allFilterLabel, query: "" },
          ...liveOptions,
        ];

        setFeedError("");
        setDisciplineOptions(nextOptions);
        setDisciplineOptionsReady(true);
        writeCachedValue(getDisciplinesCacheKey(offlineScope), nextOptions);

        const validIds = new Set(["all", ...liveOptions.map((item) => item.id)]);
        setDefaultDisciplineId((current) =>
          validIds.has(current) ? current : "all",
        );
        setActiveDisciplineId((current) => {
          if (validIds.has(current)) {
            return current;
          }

          return validIds.has(defaultDisciplineId) ? defaultDisciplineId : "all";
        });
      })
      .catch((error) => {
        const cachedOptions = readCachedValue(
          getDisciplinesCacheKey(offlineScope),
          [],
        );
        const fallbackOptions =
          cachedOptions.length > 0
            ? cachedOptions
            : [{ id: "all", label: backendMeta.allFilterLabel, query: "" }];

        setDisciplineOptions(fallbackOptions);
        setDisciplineOptionsReady(true);
        setDefaultDisciplineId((current) =>
          fallbackOptions.some((item) => item.id === current) ? current : "all",
        );
        setActiveDisciplineId((current) =>
          fallbackOptions.some((item) => item.id === current) ? current : "all",
        );
        setFeedError(cachedOptions.length > 0 ? "" : error.message);
        setFeedEmptyMessage(
          cachedOptions.length > 0
            ? ""
            : `${backendMeta.filterLabelPlural} alınamadı. ${backendMeta.feedErrorHint}`,
        );
        setLoadingFeed(false);
      });
  }, [
    backend,
    yoktezServerUrl,
    offlineScope,
    defaultDisciplineId,
    backendMeta.allFilterLabel,
    backendMeta.feedErrorHint,
    backendMeta.filterLabelPlural,
  ]);

  useEffect(() => {
    if (requiresCustomYoktezUrl || !disciplineOptionsReady) {
      return;
    }

    const hasResolvedActiveDiscipline =
      activeDisciplineId === "all" ||
      disciplineOptions.some((option) => option.id === activeDisciplineId);

    if (!hasResolvedActiveDiscipline) {
      return;
    }

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    if (activeDisciplineOption.query) {
      setFeed([]);
      void loadDisciplineFeed(activeDisciplineOption);
      return;
    }

    setFeed([]);
    void loadFeed(0, true);
  }, [
    disciplineOptionsReady,
    activeDisciplineId,
    disciplineOptions,
    backend,
    yoktezServerUrl,
    feedMode,
    year,
    contentLang,
  ]);


  useEffect(() => {
    if (!canLoadBackgroundImages) {
      setBackgroundImages((current) =>
        Object.keys(current).length === 0 ? current : {}
      );
      return;
    }

    const uncached = feed
      .filter((thesis) => !backgroundImages[thesis.id])
      .slice(0, 6);

    uncached.forEach((thesis) => {
      void fetchBackgroundImage({
        title: thesis.title,
        keywords: thesis.keywords,
      }, apiConfig)
        .then((data) => {
          if (!data.item) {
            return;
          }

          setBackgroundImages((current) => {
            if (current[thesis.id]) {
              return current;
            }

            return {
              ...current,
              [thesis.id]: data.item,
            };
          });
        })
        .catch(() => {});
    });
  }, [
    feed,
    backgroundImages,
    canLoadBackgroundImages,
    backend,
    yoktezServerUrl,
  ]);

  async function loadFeed(nextCursor, replace = false) {
    const cacheKey = allFeedCacheKey;

    try {
      setLoadingFeed(true);
      setFeedError("");
      setFeedEmptyMessage("");
      if (replace) {
        scrollPositionsRef.current.feed = 0;
        feedRef.current?.scrollTo({ top: 0, behavior: "auto" });
      }
      const data = await fetchFeedPage(nextCursor, 4, apiConfig);
      const fetchedItems = filterShortTitleTheses(
        feedMode === "random" ? shuffleItems(data.items ?? []) : (data.items ?? []),
      );

      setCursor(data.nextCursor);
      setFeed((current) => {
        const nextItems = replace
          ? dedupeThesesById(fetchedItems)
          : dedupeThesesById([...current, ...fetchedItems]);

        writeCachedValue(cacheKey, {
          items: nextItems,
          cursor: data.nextCursor ?? 0,
        });

        return nextItems;
      });
      if (replace && fetchedItems.length === 0) {
        setFeedEmptyMessage(t("thesis.noItems"));
      }
    } catch (error) {
      const cachedFeed = readCachedValue(cacheKey, null);

      if (replace && cachedFeed?.items?.length) {
        setFeed(cachedFeed.items);
        setCursor(cachedFeed.cursor ?? 0);
        setFeedError("");
        setFeedEmptyMessage("");
      } else {
        setFeedError(error.message);
        setFeedEmptyMessage(
          t("thesis.feedLoadError", { hint: backendMeta.feedErrorHint }),
        );
        if (replace) {
          setFeed([]);
        }
      }
    } finally {
      setLoadingFeed(false);
    }
  }

  async function loadDisciplineFeed(disciplineOption) {
    const cacheKey = getFeedCacheKey(
      offlineScope,
      `${feedMode}:discipline:${disciplineOption.id}`,
    );

    try {
      setLoadingFeed(true);
      setFeedError("");
      setFeedEmptyMessage("");
      scrollPositionsRef.current.feed = 0;
      feedRef.current?.scrollTo({ top: 0, behavior: "auto" });
      const data = await fetchDisciplineFeed(disciplineOption.id, apiConfig);
      setCursor(0);
      const uniqueItems = dedupeThesesById(
        filterShortTitleTheses(
          feedMode === "random" ? shuffleItems(data.items ?? []) : (data.items ?? []),
        ),
      );
      setFeed(uniqueItems);
      writeCachedValue(cacheKey, {
        items: uniqueItems,
        cursor: 0,
      });
      if (uniqueItems.length === 0) {
        setFeedEmptyMessage(
          t("thesis.filterNoItems", { label: disciplineOption.label }),
        );
      }
    } catch (error) {
      const cachedFeed = readCachedValue(cacheKey, null);

      if (cachedFeed?.items?.length) {
        setFeed(cachedFeed.items);
        setCursor(0);
        setFeedError("");
        setFeedEmptyMessage(
          cachedFeed.items.length === 0
            ? t("thesis.filterNoItems", { label: disciplineOption.label })
            : "",
        );
      } else {
        setFeed([]);
        setCursor(0);
        setFeedError(error.message);
        setFeedEmptyMessage(
          t("thesis.filterLoadError", {
            label: disciplineOption.label,
            hint: backendMeta.feedErrorHint,
          }),
        );
      }
    } finally {
      setLoadingFeed(false);
    }
  }

  function setSentinel(node) {
    if (activeDisciplineOption.query) {
      return;
    }

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];

        if (firstEntry.isIntersecting) {
          void loadFeed(cursor);
        }
      },
      { threshold: 0.8 },
    );

    if (node) {
      observerRef.current.observe(node);
    }
  }

  function toggleLike(thesis) {
    const isLiking = !likedIds.includes(thesis.id);
    fireLikeHaptic(isLiking);

    setLikedIds((current) =>
      current.includes(thesis.id)
        ? current.filter((item) => item !== thesis.id)
        : [...current, thesis.id],
    );

    setLikedItems((current) => {
      if (current.some((item) => item.id === thesis.id)) {
        return current.filter((item) => item.id !== thesis.id);
      }

      return [thesis, ...current];
    });
  }

  function spawnHeart(id, event) {
    const burstContainer =
      event.currentTarget.closest(".snap-screen") ?? event.currentTarget;
    const rect = burstContainer.getBoundingClientRect();
    const burst = {
      key: `${id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      thesisId: id,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };

    setHeartBursts((current) => [...current, burst]);

    window.setTimeout(() => {
      setHeartBursts((current) =>
        current.filter((item) => item.key !== burst.key),
      );
    }, 900);
  }

  function handlePointerUp(id) {
    return (event) => {
      if (event.target.closest("[data-no-double-tap='true']")) {
        return;
      }

      const pointerType = event.nativeEvent.pointerType;
      if (pointerType && pointerType !== "touch" && pointerType !== "mouse") {
        return;
      }

      const now = Date.now();
      const lastTap = tapTrackerRef.current;
      const x = event.clientX ?? 0;
      const y = event.clientY ?? 0;
      const closeEnough =
        Math.abs(lastTap.x - x) < 24 && Math.abs(lastTap.y - y) < 24;

      if (lastTap.id === id && now - lastTap.time < 320 && closeEnough) {
        const thesis = feed.find((item) => item.id === id);
        if (thesis) {
          toggleLike(thesis);
        }
        spawnHeart(id, event);
        tapTrackerRef.current = { id: null, time: 0, x: 0, y: 0 };
        return;
      }

      tapTrackerRef.current = { id, time: now, x, y };
    };
  }

  const likedFeed = dedupeThesesById(
    filterShortTitleTheses(
      likedItems.map((liked) => feed.find((item) => item.id === liked.id) ?? liked),
    ),
  );
  const visibleFeed = activeTab === "likes" ? likedFeed : feed;
  const feedSlides =
    activeTab === "feed" ? buildFeedSlides(visibleFeed) : [];
  const activeAbstractThesis =
    feed.find((item) => item.id === activeAbstractId) ??
    likedFeed.find((item) => item.id === activeAbstractId) ??
    searchResults.find((item) => item.id === activeAbstractId) ??
    null;
  const activeAbstractNote = activeAbstractId ? thesisNotes[activeAbstractId] ?? "" : "";
  const desktopFocusedThesis =
    visibleFeed.find((item) => item.id === activeDesktopThesisId) ??
    visibleFeed[0] ??
    null;
  const desktopPrimaryShortcuts = [
    { keys: ["1"], label: t("tabs.feed") },
    { keys: ["2"], label: t("tabs.likes") },
    { keys: ["3"], label: t("tabs.search") },
    { keys: ["4"], label: t("tabs.settings") },
    ...(activeTab === "feed"
      ? [
          { keys: ["J", "↓"], label: t("shortcuts.nextThesis") },
          { keys: ["K", "↑"], label: t("shortcuts.previousThesis") },
        ]
      : []),
    ...(activeTab === "search" ? [{ keys: ["/"], label: t("shortcuts.focusSearch") }] : []),
  ];
  const desktopContextShortcuts =
    activeTab === "feed"
      ? [
          {
            keys: ["L"],
            label: likedIds.includes(desktopFocusedThesis?.id)
              ? t("shortcuts.unlikeThesis")
              : t("shortcuts.likeThesis"),
          },
          Boolean(String(desktopFocusedThesis?.abstract ?? "").trim()) && {
            keys: ["A"],
            label: t("shortcuts.openAbstract"),
          },
          Boolean(String(desktopFocusedThesis?.pdfUrl ?? "").trim()) && {
            keys: ["P"],
            label: t("shortcuts.openPdf"),
          },
          desktopFocusedThesis && { keys: ["G"], label: t("shortcuts.openScholar") },
          { keys: ["Esc"], label: t("shortcuts.closeSheets") },
        ].filter(Boolean)
      : [
          { keys: ["/"], label: t("shortcuts.jumpToSearch") },
          { keys: ["Esc"], label: t("shortcuts.closePanel") },
        ];

  useEffect(() => {
    const currentContainer =
      activeTab === "feed"
        ? feedRef.current
        : activeTab === "likes"
          ? likesRef.current
          : activeTab === "search"
            ? searchRef.current
            : settingsRef.current;

    window.requestAnimationFrame(() => {
      currentContainer?.scrollTo({
        top: scrollPositionsRef.current[activeTab] ?? 0,
        behavior: "auto",
      });
    });
  }, [activeTab]);

  useEffect(() => {
    if (!desktopViewport || activeTab !== "feed") {
      setActiveDesktopThesisId(null);
      return;
    }

    const updateActiveThesis = () => {
      setActiveDesktopThesisId(getCenteredFeedThesisId(feedRef.current));
    };

    updateActiveThesis();
    const handleViewportChange = () => {
      window.requestAnimationFrame(updateActiveThesis);
    };

    window.addEventListener("resize", handleViewportChange);

    return () => {
      window.removeEventListener("resize", handleViewportChange);
    };
  }, [desktopViewport, activeTab, feed]);

  useEffect(() => {
    if (!desktopViewport) {
      return;
    }

    const handleKeyDown = (event) => {
      if (event.defaultPrevented) {
        return;
      }

      const key = event.key;
      const loweredKey = key.toLowerCase();
      const target = event.target;
      const activeFeedThesis =
        visibleFeed.find((item) => item.id === getCenteredFeedThesisId(feedRef.current)) ??
        visibleFeed[0] ??
        null;

      if (key === "Escape") {
        if (activeAbstractId) {
          setActiveAbstractId(null);
          return;
        }

        if (settingsPicker) {
          setSettingsPicker(null);
          return;
        }

        if (feedFilterOpen) {
          setFeedFilterOpen(false);
          return;
        }

        if (disciplinePickerOpen) {
          setDisciplinePickerOpen(false);
          return;
        }

        if (aboutOpen) {
          setAboutOpen(false);
          return;
        }

        if (searchResultsOpen) {
          setSearchResultsOpen(false);
        }

        return;
      }

      if (isEditableElement(target)) {
        if (key === "/" && activeTab !== "search") {
          event.preventDefault();
          handleTabSelect("search");
        }

        return;
      }

      if (key === "/") {
        event.preventDefault();
        handleTabSelect("search");

        window.requestAnimationFrame(() => {
          searchRef.current?.querySelector("input")?.focus();
        });
        return;
      }

      if (["1", "2", "3", "4"].includes(key)) {
        event.preventDefault();
        handleTabSelect(
          key === "1"
            ? "feed"
            : key === "2"
              ? "likes"
              : key === "3"
                ? "search"
                : "settings",
        );
        return;
      }

      if (activeTab !== "feed") {
        return;
      }

      if (loweredKey === "j" || key === "ArrowDown") {
        event.preventDefault();
        scrollFeedByDirection(feedRef.current, 1);
        return;
      }

      if (loweredKey === "k" || key === "ArrowUp") {
        event.preventDefault();
        scrollFeedByDirection(feedRef.current, -1);
        return;
      }

      if (!activeFeedThesis) {
        return;
      }

      if (loweredKey === "l") {
        event.preventDefault();
        toggleLike(activeFeedThesis);
        return;
      }

      if (loweredKey === "a" && String(activeFeedThesis.abstract ?? "").trim()) {
        event.preventDefault();
        fireSelectionHaptic();
        setActiveAbstractId(activeFeedThesis.id);
        return;
      }

      if (loweredKey === "p" && String(activeFeedThesis.pdfUrl ?? "").trim()) {
        event.preventDefault();
        fireOpenHaptic();
        openExternalUrl(activeFeedThesis.pdfUrl);
        return;
      }

      if (loweredKey === "g") {
        event.preventDefault();
        fireOpenHaptic();
        openExternalUrl(buildGoogleScholarUrl(activeFeedThesis), {
          preferSameTab: installPlatform === "ios" && !isNativePlatform(),
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    desktopViewport,
    activeTab,
    visibleFeed,
    activeAbstractId,
    settingsPicker,
    feedFilterOpen,
    disciplinePickerOpen,
    aboutOpen,
    searchResultsOpen,
    installPlatform,
  ]);

  function handleTabSelect(nextTab) {
    const currentContainer =
      activeTab === "feed"
        ? feedRef.current
        : activeTab === "likes"
          ? likesRef.current
          : activeTab === "search"
            ? searchRef.current
            : settingsRef.current;

    if (currentContainer) {
      scrollPositionsRef.current[activeTab] = currentContainer.scrollTop;
    }

    fireTabHaptic();
    setActiveTab(nextTab);
  }

  function openLikedItem(id) {
    fireOpenHaptic();
    const likedThesis = likedFeed.find((item) => item.id === id);

    if (likedThesis) {
      setFeed((current) =>
        current.some((item) => item.id === id)
          ? current
          : [likedThesis, ...current],
      );
    }
    setPendingOpenThesisId(id);
    setActiveDisciplineId("all");
    setActiveTab("feed");
  }

  function updateSearchValue(key, value) {
    setSearchValues((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function runSearch() {
    try {
      setSearchLoading(true);
      setSearchError("");
      setSearchEmptyMessage("");
      scrollPositionsRef.current.search = 0;
      searchRef.current?.scrollTo({ top: 0, behavior: "auto" });

      const trimmedValues = Object.fromEntries(
        Object.entries(searchValues).map(([key, value]) => [key, String(value ?? "").trim()]),
      );
      const hasAnyCriteria = Object.values(trimmedValues).some(Boolean);

      if (!hasAnyCriteria) {
        setSearchResults([]);
        setSearchEmptyMessage(t("search.emptyTitle"));
        setSearchResultsOpen(true);
        return;
      }

      const data = await searchArticles({
        ...trimmedValues,
        year: trimmedValues.year || undefined,
        limit: 20,
      }, apiConfig);

      const items = dedupeThesesById(filterShortTitleTheses(data.items ?? []));
      setSearchResults(items);
      setSearchResultsOpen(true);
      if (items.length === 0) {
        setSearchEmptyMessage(t("search.noResults"));
      }
    } catch (error) {
      setSearchResults([]);
      setSearchError(error.message);
      setSearchEmptyMessage(t("search.loadError"));
      setSearchResultsOpen(true);
    } finally {
      setSearchLoading(false);
    }
  }

  function scrollToNextSlide(currentTarget) {
    const slide = currentTarget.closest(".snap-screen");
    const nextSlide = slide?.nextElementSibling;

    if (nextSlide instanceof HTMLElement) {
      nextSlide.scrollIntoView({ block: "start", behavior: "smooth" });
    }
  }

  useEffect(() => {
    if (activeTab !== "feed" || !pendingOpenThesisId) {
      return;
    }

    const element = document.querySelector(`[data-thesis-id="${pendingOpenThesisId}"]`);
    if (!element) {
      return;
    }

    window.requestAnimationFrame(() => {
      element.scrollIntoView({ block: "start", behavior: "smooth" });
      setPendingOpenThesisId(null);
    });
  }, [activeTab, pendingOpenThesisId, feed]);

  function handleOpenDisciplinePicker() {
    fireSelectionHaptic();
    setDisciplinePickerMode("active");
    setDisciplinePickerOpen(true);
  }

  function handleOpenDefaultDisciplinePicker() {
    fireSelectionHaptic();
    setDisciplinePickerMode("default");
    setDisciplinePickerOpen(true);
  }

  async function handleShareThesis(thesis) {
    if (!thesis) {
      return;
    }

    const shareText = [thesis.title, String(thesis.pdfUrl ?? "").trim()].filter(Boolean).join("\n");

    try {
      if (navigator.share) {
        await navigator.share({
          title: thesis.title,
          text: shareText,
          url: String(thesis.pdfUrl ?? "").trim() || undefined,
        });
        return;
      }
    } catch (error) {
      if (error?.name === "AbortError") {
        return;
      }
    }

    try {
      await navigator.clipboard.writeText(shareText);
    } catch {}
  }

  function updateThesisNote(thesisId, value) {
    setThesisNotes((current) => {
      const trimmedValue = value.trim();

      if (!trimmedValue) {
        if (!(thesisId in current)) {
          return current;
        }

        const next = { ...current };
        delete next[thesisId];
        return next;
      }

      return {
        ...current,
        [thesisId]: value,
      };
    });
  }

  const settingsPickerConfig =
    settingsPicker === "backend"
      ? {
          title: t("settings.source"),
          options: backendOptions,
          selectedId: backend,
          onSelect: setBackend,
        }
      : settingsPicker === "locale"
        ? {
            title: t("settings.languageTitle"),
            options: localeOptions,
            selectedId: locale,
            onSelect: setLocale,
          }
      : settingsPicker === "theme"
        ? {
            title: t("settings.theme"),
            options: themeOptions,
            selectedId: theme,
            onSelect: setTheme,
          }
      : settingsPicker === "feedMode"
        ? {
            title: t("settings.feedOrder"),
            options: feedModeOptions,
            selectedId: feedMode,
            onSelect: setFeedMode,
          }
        : settingsPicker === "haptics"
          ? {
              title: t("settings.haptics"),
              options: hapticsOptions,
              selectedId: hapticsMode,
              onSelect: setHapticsMode,
            }
          : settingsPicker === "backgroundImages"
            ? {
                title: t("settings.backgroundImages"),
                options: backgroundImageOptions,
                selectedId: backgroundImagesMode,
                onSelect: setBackgroundImagesMode,
              }
            : settingsPicker === "contentLang"
              ? {
                  title: t("settings.contentLanguage"),
                  options: contentLangOptions,
                  selectedId: contentLang,
                  onSelect: setContentLang,
                }
              : settingsPicker === "year"
                ? {
                    title: t("settings.year"),
                    options: yearOptions,
                    selectedId: year,
                    onSelect: (id) => {
                      setYear(id);
                      setSettingsPicker(null);
                    },
                  }
                : null;

  return (
    <div className="app-shell">
      <header className="floating-header">
        <div className={headerClassName}>
          {headerBackAction ? (
            <button
              type="button"
              className="header-back-button"
              onClick={headerBackAction}
              aria-label={t("settings.back")}
            >
              <ChevronIcon />
              <span>{t("settings.back")}</span>
            </button>
          ) : null}
          <div className={headerTitleClassName}>
            <h2>{headerTitle}</h2>
          </div>
        </div>
        {activeTab === "feed" ? (
          <div className="header-actions">
            <button
              type="button"
              className="topic-select topic-select-icon"
              onClick={() => {
                fireSelectionHaptic();
                setFeedFilterOpen(true);
              }}
              aria-label={t("picker.filtersTitle")}
            >
              <FilterIcon />
            </button>
          </div>
        ) : null}
      </header>

      {!isOnline ? <div className="offline-banner">{t("app.offlineReady")}</div> : null}

      {activeTab === "settings" ? (
        <div
          ref={settingsRef}
          className="tab-scroll tab-scroll-with-header-gap"
          onScroll={() => {
            scrollPositionsRef.current.settings = settingsRef.current?.scrollTop ?? 0;
          }}
        >
          <SettingsScreen
            theme={theme}
            t={t}
            locale={locale}
            localeOptions={localeOptions}
            backendOptions={backendOptions}
            themeOptions={themeOptions}
            feedModeOptions={feedModeOptions}
            hapticsOptions={hapticsOptions}
            backgroundImageOptions={backgroundImageOptions}
            contentLangOptions={contentLangOptions}
            backend={backend}
            backendMeta={backendMeta}
            yoktezServerUrl={yoktezServerUrl}
            onYoktezServerUrlChange={setYoktezServerUrl}
            defaultDisciplineLabel={
              defaultDisciplineOption?.label ?? backendMeta.allFilterLabel
            }
            onOpenDefaultDisciplinePicker={handleOpenDefaultDisciplinePicker}
            hapticsMode={hapticsMode}
            backgroundImagesMode={backgroundImagesMode}
            contentLang={contentLang}
            year={year}
            yearOptions={yearOptions}
            feedMode={feedMode}
            showInstallPrompt={canShowInstallPrompt}
            installPlatform={installPlatform}
            onInstallApp={handleInstallApp}
            onOpenSettingsPicker={(pickerId) => {
              fireSelectionHaptic();
              setSettingsPicker(pickerId);
            }}
            onOpenAbout={() => {
              fireSelectionHaptic();
              setAboutOpen(true);
            }}
            activeSection={settingsActiveSection}
            onSetActiveSection={setSettingsActiveSection}
          />
        </div>
      ) : activeTab === "likes" ? (
        <div
          ref={likesRef}
          className="tab-scroll tab-scroll-with-header-gap"
          onScroll={() => {
            scrollPositionsRef.current.likes = likesRef.current?.scrollTop ?? 0;
          }}
        >
          <LikedThesisList
            t={t}
            items={likedFeed}
            onOpenFeed={openLikedItem}
            onRemoveLike={toggleLike}
          />
        </div>
      ) : activeTab === "search" ? (
        <div
          ref={searchRef}
          className="tab-scroll tab-scroll-with-header-gap"
          onScroll={() => {
            scrollPositionsRef.current.search = searchRef.current?.scrollTop ?? 0;
          }}
        >
          <SearchResultList
            t={t}
            items={searchResults}
            loading={searchLoading}
            error={searchError}
            emptyMessage={searchEmptyMessage || t("search.noResults")}
            open={searchResultsOpen}
            onClose={() => setSearchResultsOpen(false)}
            searchValues={searchValues}
            onSearchValueChange={updateSearchValue}
            onSubmit={() => {
              fireSelectionHaptic();
              void runSearch();
            }}
            onToggleLike={toggleLike}
            likedIds={likedIds}
            showGeneralQuery={backend !== BACKEND_YOKTEZ}
            onOpenAbstract={(id) => {
              fireSelectionHaptic();
              setActiveAbstractId(id);
            }}
          />
        </div>
      ) : (
        <main
          className="feed settings-page-transition"
          ref={feedRef}
          onScroll={() => {
            scrollPositionsRef.current.feed = feedRef.current?.scrollTop ?? 0;
            if (desktopViewport) {
              setActiveDesktopThesisId(getCenteredFeedThesisId(feedRef.current));
            }
          }}
        >
          {activeTab === "feed" && loadingFeed && visibleFeed.length === 0 && (
            <FeedLoadingState t={t} />
          )}

          {feedSlides.map((slide, index) => (
            <section
              key={`${slide.key}-${index}`}
              className="snap-screen"
              data-thesis-id={slide.kind === "thesis" ? slide.thesis.id : undefined}
              ref={
                activeTab === "feed" &&
                !activeDisciplineOption.query &&
                index === feedSlides.length - 1
                  ? setSentinel
                  : null
              }
            >
              {slide.kind === "thesis" ? (
                <>
                  <ThesisCard
                    t={t}
                    thesis={slide.thesis}
                    liked={likedIds.includes(slide.thesis.id)}
                    onToggleLike={() => toggleLike(slide.thesis)}
                    onOpenAbstract={() => {
                      fireSelectionHaptic();
                      setActiveAbstractId(slide.thesis.id);
                    }}
                    pdfUrl={slide.thesis.pdfUrl}
                    scholarUrl={buildGoogleScholarUrl(slide.thesis)}
                    scholarSameTab={installPlatform === "ios" && !isNativePlatform()}
                    onShare={handleShareThesis}
                    onSurfacePointerUp={handlePointerUp(slide.thesis.id)}
                    backgroundImage={canLoadBackgroundImages ? backgroundImages[slide.thesis.id]?.imageUrl : null}
                    backgroundMeta={canLoadBackgroundImages ? backgroundImages[slide.thesis.id] : null}
                  />
                  {heartBursts
                    .filter((burst) => burst.thesisId === slide.thesis.id)
                    .map((burst) => (
                      <div
                        key={burst.key}
                        className="heart-burst"
                        style={{ left: `${burst.x}px`, top: `${burst.y}px` }}
                        aria-hidden="true"
                      >
                        <HeartIcon filled />
                      </div>
                    ))}
                </>
              ) : (
                <SupportSlide
                  t={t}
                  onContinue={(event) => {
                    fireSelectionHaptic();
                    scrollToNextSlide(event.currentTarget);
                  }}
                />
              )}
            </section>
          ))}

          {activeTab === "feed" && !activeDisciplineOption.query && loadingFeed && (
            <div className="loading-strip">{t("thesis.loadingMore")}</div>
          )}

          {activeTab === "feed" && activeDisciplineOption.query && loadingFeed && visibleFeed.length > 0 && (
            <div className="loading-overlay">
              <div className="loading-strip">
                {t("thesis.loadingOverlay", { label: activeDisciplineOption.label })}
              </div>
            </div>
          )}

          {activeTab === "feed" && !loadingFeed && visibleFeed.length === 0 && (
            <section className="info-screen empty-state">
              <div className="empty-copy">
                <p className="info-kicker">{t("thesis.noItemsTitle")}</p>
                <h3>{feedEmptyMessage || t("thesis.noItems")}</h3>
                {feedError ? <p>{feedError}</p> : null}
              </div>
            </section>
          )}
        </main>
      )}

      {desktopViewport ? (
        <>
          <DesktopShortcutPanel
            title={t("shortcuts.title")}
            items={desktopPrimaryShortcuts}
            align="left"
          />
          <DesktopShortcutPanel
            title={
              activeTab === "feed"
                ? t("shortcuts.thesisTitle")
                : t("shortcuts.actionsTitle")
            }
            items={desktopContextShortcuts}
            align="right"
          />
        </>
      ) : null}

      <BottomTabBar activeTab={activeTab} onSelect={handleTabSelect} tabs={tabs} />
      <FeedFilterSheet
        t={t}
        open={feedFilterOpen}
        filterLabel={backendMeta.filterLabelPlural}
        yearOptions={yearOptions}
        selectedYearId={year}
        onSelectYear={setYear}
        disciplineOptions={disciplineOptions}
        selectedDisciplineId={activeDisciplineId}
        onSelectDiscipline={setActiveDisciplineId}
        searchPlaceholder={backendMeta.filterSearchPlaceholder}
        emptyMessage={backendMeta.filterEmptyMessage}
        onClose={() => setFeedFilterOpen(false)}
        onSelectHaptic={fireSelectionHaptic}
      />
      <DisciplinePickerModal
        t={t}
        open={disciplinePickerOpen}
        title={backendMeta.filterLabelPlural}
        heading={t("picker.chooseFilter", { label: backendMeta.filterLabel })}
        searchPlaceholder={backendMeta.filterSearchPlaceholder}
        emptyMessage={backendMeta.filterEmptyMessage}
        options={disciplineOptions}
        selectedId={
          disciplinePickerMode === "default" ? defaultDisciplineId : activeDisciplineId
        }
        onClose={() => setDisciplinePickerOpen(false)}
        onSelect={(value) => {
          if (disciplinePickerMode === "default") {
            setDefaultDisciplineId(value);
            return;
          }

          setActiveDisciplineId(value);
        }}
        onSelectHaptic={fireSelectionHaptic}
      />
      <AbstractSheet
        t={t}
        thesis={activeAbstractThesis}
        open={Boolean(activeAbstractThesis)}
        onClose={() => setActiveAbstractId(null)}
        onShare={handleShareThesis}
        noteValue={activeAbstractNote}
        onNoteChange={(value) => {
          if (activeAbstractId) {
            updateThesisNote(activeAbstractId, value);
          }
        }}
      />
      <WheelPickerSheet
        t={t}
        open={Boolean(settingsPickerConfig)}
        title={settingsPickerConfig?.title ?? ""}
        options={settingsPickerConfig?.options ?? []}
        selectedId={settingsPickerConfig?.selectedId ?? ""}
        onClose={() => setSettingsPicker(null)}
        onSelect={(value) => {
          settingsPickerConfig?.onSelect(value);
        }}
        onSelectHaptic={fireSelectionHaptic}
      />
      <AboutSheet
        t={t}
        open={aboutOpen}
        onClose={() => setAboutOpen(false)}
      />
    </div>
  );
}
