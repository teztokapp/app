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
  BACKEND_CORE,
  BACKEND_SEMANTIC_SCHOLAR,
  BACKEND_YOKTEZ,
  DEFAULT_BACKEND,
  fetchBackgroundImage,
  fetchDisciplines,
  fetchDisciplineFeed,
  fetchFeedPage,
  getBackendOptions,
  getBackendMetadata,
} from "./api.js";
import { createTranslator, DEFAULT_LOCALE, LOCALE_OPTIONS } from "./i18n.js";

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

const previewAbstract = (text, expanded) => {
  if (expanded || text.length < 140) {
    return text;
  }

  return `${text.slice(0, 140).trim()}...`;
};

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

const normalizePickerText = (value = "") =>
  value
    .toLocaleLowerCase("tr")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const OFFLINE_CACHE_VERSION = "v2";

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
  } catch {}
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

function SettingsSelectRow({
  label,
  value,
  helper,
  onOpen,
  indicator,
  valueAsBadge = false,
}) {
  return (
    <div className="info-row">
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
      {helper ? <span>{helper}</span> : null}
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
      <div className="info-row">
        <p>{t("install.title")}</p>
        <div className="settings-static">
          <span>{value}</span>
        </div>
        <span>{helper}</span>
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
      valueAsBadge
    />
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
  semanticScholarApiKey,
  onSemanticScholarApiKeyChange,
  coreApiKey,
  onCoreApiKeyChange,
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

  return (
    <section className="info-screen">
      <div className="info-list">
        {showInstallPrompt ? (
          <InstallSettingsRow
            t={t}
            installPlatform={installPlatform}
            onInstallApp={onInstallApp}
          />
        ) : null}
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
        <SettingsSelectRow
          label={t("settings.language")}
          value={localeLabel}
          onOpen={() => onOpenSettingsPicker("locale")}
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

        {backend === BACKEND_SEMANTIC_SCHOLAR ? (
          <div className="info-row">
            <p>{t("settings.semanticScholarApiKey")}</p>
            <input
              className="settings-input"
              type="password"
              placeholder={t("settings.apiKeyPlaceholder")}
              value={semanticScholarApiKey}
              onChange={(event) => onSemanticScholarApiKeyChange(event.target.value)}
            />
            <span>{t("settings.semanticScholarApiKeyHelp")}</span>
          </div>
        ) : null}
        {backend === BACKEND_CORE ? (
          <div className="info-row">
            <p>{t("settings.coreApiKey")}</p>
            <input
              className="settings-input"
              type="password"
              placeholder={t("settings.apiKeyPlaceholder")}
              value={coreApiKey}
              onChange={(event) => onCoreApiKeyChange(event.target.value)}
            />
            <span>{t("settings.coreApiKeyHelp")}</span>
          </div>
        ) : null}
        <SettingsSelectRow
          label={t("settings.defaultFilter")}
          value={defaultDisciplineLabel}
          onOpen={onOpenDefaultDisciplinePicker}
        />
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
        <SettingsSelectRow
          label={t("settings.contentLanguage")}
          value={contentLangLabel}
          onOpen={() => onOpenSettingsPicker("contentLang")}
        />
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
  if (!open) {
    return null;
  }

  return (
    <div className="sheet-backdrop" onClick={onClose} aria-hidden="true">
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

  useEffect(() => {
    if (!open) {
      setQuery("");
      setActiveLetter("");
    }
  }, [open]);

  if (!open) {
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
    <div className="sheet-backdrop picker-backdrop" onClick={onClose} aria-hidden="true">
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

function AbstractSheet({ thesis, open, onClose, t }) {
  if (!open) {
    return null;
  }

  return (
    <div className="sheet-backdrop" onClick={onClose} aria-hidden="true">
      <section
        className="abstract-sheet"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={t("sheet.fullAbstract")}
      >
        <div className="sheet-handle" />
        <div className="sheet-header">
          <p>{thesis.author}</p>
          <button type="button" className="sheet-close" onClick={onClose}>
            {t("picker.done")}
          </button>
        </div>
        <h3>{thesis.title}</h3>
        <div className="sheet-body">
          <p>{thesis.abstract}</p>
        </div>
      </section>
    </div>
  );
}

function LikedThesisList({ items, onOpenFeed, onRemoveLike, t }) {
  return (
    <section className="likes-list-screen">
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
  backgroundImage,
  backgroundMeta,
}) {
  const hasAbstract = Boolean(String(thesis.abstract ?? "").trim());
  const hasPdf = Boolean(String(pdfUrl ?? "").trim());
  const hasScholar = Boolean(String(scholarUrl ?? "").trim());

  return (
    <article
      className="thesis-screen"
      onPointerUp={onSurfacePointerUp}
      style={
        backgroundImage
          ? {
              backgroundImage: `linear-gradient(180deg, rgba(0, 0, 0, 0.18), rgba(0, 0, 0, 0.82)), url("${backgroundImage}")`,
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
        <h1>{thesis.title}</h1>
        <p className="author-line">{thesis.author}</p>
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
      </aside>

      <div className="screen-bottom">
        {hasAbstract ? (
          <div className="abstract-panel">
            <p className="abstract-text">
              {previewAbstract(thesis.abstract, false)}
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
    () => window.localStorage.getItem("teztok-backend") ?? DEFAULT_BACKEND,
  );
  const [yoktezServerUrl, setYoktezServerUrl] = useState(
    () => window.localStorage.getItem("teztok-yoktez-server-url") ?? "https://yoktez-server.vercel.app/",
  );
  const [semanticScholarApiKey, setSemanticScholarApiKey] = useState(
    () => window.localStorage.getItem("teztok-semantic-scholar-api-key") ?? "",
  );
  const [coreApiKey, setCoreApiKey] = useState(
    () => window.localStorage.getItem("teztok-core-api-key") ?? "",
  );
  const [feed, setFeed] = useState([]);
  const [cursor, setCursor] = useState(0);
  const [activeTab, setActiveTab] = useState("feed");
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
  const [activeAbstractId, setActiveAbstractId] = useState(null);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [feedEmptyMessage, setFeedEmptyMessage] = useState("");
  const [feedError, setFeedError] = useState("");
  const [heartBursts, setHeartBursts] = useState([]);
  const [backgroundImages, setBackgroundImages] = useState({});
  const [pendingOpenThesisId, setPendingOpenThesisId] = useState(null);
  const [settingsPicker, setSettingsPicker] = useState(null);
  const observerRef = useRef(null);
  const tapTrackerRef = useRef({ id: null, time: 0, x: 0, y: 0 });
  const feedRef = useRef(null);
  const likesRef = useRef(null);
  const settingsRef = useRef(null);
  const scrollPositionsRef = useRef({ feed: 0, likes: 0, settings: 0 });
  const apiConfig = {
    backend,
    customApiBaseUrl: yoktezServerUrl,
    semanticScholarApiKey,
    coreApiKey,
    locale,
    contentLang,
    year: year === "all" ? null : year,
  };
  const offlineScope = buildOfflineScope(apiConfig);
  const requiresCustomYoktezUrl =
    backend === BACKEND_YOKTEZ && !yoktezServerUrl.trim();
  const allFeedCacheKey = getFeedCacheKey(offlineScope, `${feedMode}:all`);

  useEffect(() => {
    window.localStorage.setItem("teztok-liked", JSON.stringify(likedIds));
  }, [likedIds]);

  useEffect(() => {
    window.localStorage.setItem("teztok-liked-items", JSON.stringify(likedItems));
  }, [likedItems]);

  useEffect(() => {
    window.localStorage.setItem("teztok-default-discipline", defaultDisciplineId);
  }, [defaultDisciplineId]);

  useEffect(() => {
    window.localStorage.setItem("teztok-locale", locale);
  }, [locale]);

  useEffect(() => {
    window.localStorage.setItem("teztok-backend", backend);
  }, [backend]);

  useEffect(() => {
    window.localStorage.setItem("teztok-yoktez-server-url", yoktezServerUrl);
  }, [yoktezServerUrl]);

  useEffect(() => {
    window.localStorage.setItem(
      "teztok-semantic-scholar-api-key",
      semanticScholarApiKey,
    );
  }, [semanticScholarApiKey]);

  useEffect(() => {
    window.localStorage.setItem("teztok-core-api-key", coreApiKey);
  }, [coreApiKey]);

  useEffect(() => {
    window.localStorage.setItem("teztok-theme", theme);
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    window.localStorage.setItem("teztok-feed-mode", feedMode);
  }, [feedMode]);

  useEffect(() => {
    window.localStorage.setItem("teztok-haptics", hapticsMode);
  }, [hapticsMode]);

  useEffect(() => {
    window.localStorage.setItem("teztok-background-images", backgroundImagesMode);
  }, [backgroundImagesMode]);

  useEffect(() => {
    window.localStorage.setItem("teztok-content-lang", contentLang);
  }, [contentLang]);

  useEffect(() => {
    window.localStorage.setItem("teztok-year", year);
  }, [year]);

  useEffect(() => {
    setBackgroundImages(readCachedValue(getBackgroundImagesCacheKey(offlineScope), {}));
  }, [offlineScope]);

  useEffect(() => {
    writeCachedValue(getBackgroundImagesCacheKey(offlineScope), backgroundImages);
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
    const handleDisplayModeChange = (event) => {
      setIsInstalled(event.matches || window.navigator.standalone === true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstall);
    mediaQuery?.addEventListener?.("change", handleDisplayModeChange);
    setInstallPlatform(getInstallPlatform());
    setIsInstalled(isNativePlatform() || isStandaloneDisplay());

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstall);
      mediaQuery?.removeEventListener?.("change", handleDisplayModeChange);
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
    { id: "settings", label: t("tabs.settings"), icon: "settings", badge: canShowInstallPrompt },
  ];
  const themeOptions = [
    { id: "light", label: t("options.theme.light") },
    { id: "dark", label: t("options.theme.dark") },
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
    label: t(option.labelKey),
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
      setFeed([]);
      setCursor(0);
      setLoadingFeed(false);
      setFeedError("");
      setFeedEmptyMessage(t("providers.yoktez.requiresServer"));
      return;
    }

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
    if (requiresCustomYoktezUrl) {
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
    activeDisciplineId,
    disciplineOptions,
    activeDisciplineOption,
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
  }, [feed, backgroundImages, canLoadBackgroundImages, backend, yoktezServerUrl]);

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
      const fetchedItems =
        feedMode === "random" ? shuffleItems(data.items ?? []) : (data.items ?? []);

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
        feedMode === "random" ? shuffleItems(data.items ?? []) : (data.items ?? []),
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
    const rect = event.currentTarget.getBoundingClientRect();
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
    likedItems.map((liked) => feed.find((item) => item.id === liked.id) ?? liked),
  );
  const visibleFeed = activeTab === "likes" ? likedFeed : feed;

  useEffect(() => {
    const currentContainer =
      activeTab === "feed"
        ? feedRef.current
        : activeTab === "likes"
          ? likesRef.current
          : settingsRef.current;

    window.requestAnimationFrame(() => {
      currentContainer?.scrollTo({
        top: scrollPositionsRef.current[activeTab] ?? 0,
        behavior: "auto",
      });
    });
  }, [activeTab]);

  function handleTabSelect(nextTab) {
    const currentContainer =
      activeTab === "feed"
        ? feedRef.current
        : activeTab === "likes"
          ? likesRef.current
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
        <div className="header-brand">
          <h2>{t("app.title")}</h2>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="topic-select"
            onClick={() => {
              fireSelectionHaptic();
              setSettingsPicker("year");
            }}
            aria-label={t("picker.filterBy", { label: t("settings.year") })}
          >
            <span>{year === "all" ? t("settings.year") : year}</span>
          </button>
          <button
            type="button"
            className="topic-select"
            onClick={handleOpenDisciplinePicker}
            aria-label={t("picker.filterBy", { label: backendMeta.filterLabel })}
          >
            <span>{activeDisciplineOption?.label ?? backendMeta.allFilterLabel}</span>
          </button>
        </div>
      </header>

      {!isOnline ? <div className="offline-banner">{t("app.offlineReady")}</div> : null}

      {activeTab === "settings" ? (
        <div
          ref={settingsRef}
          className="tab-scroll"
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
            semanticScholarApiKey={semanticScholarApiKey}
            onSemanticScholarApiKeyChange={setSemanticScholarApiKey}
            coreApiKey={coreApiKey}
            onCoreApiKeyChange={setCoreApiKey}
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
          />
        </div>
      ) : activeTab === "likes" ? (
        <div
          ref={likesRef}
          className="tab-scroll"
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
      ) : (
        <main
          className="feed"
          ref={feedRef}
          onScroll={() => {
            scrollPositionsRef.current.feed = feedRef.current?.scrollTop ?? 0;
          }}
        >
          {activeTab === "feed" && loadingFeed && visibleFeed.length === 0 && (
            <section className="info-screen empty-state">
              <div className="empty-copy">
                <p className="info-kicker">{t("thesis.loadingKicker")}</p>
                <h3>
                  {activeDisciplineOption.query
                    ? t("thesis.loadingFiltered", { label: activeDisciplineOption.label })
                    : feedMode === "random"
                      ? t("thesis.loadingRandom")
                      : t("thesis.loadingLatest")}
                </h3>
              </div>
            </section>
          )}

          {visibleFeed.map((thesis, index) => (
            <section
              key={`${thesis.id}-${index}`}
              className="snap-screen"
              data-thesis-id={thesis.id}
              ref={
                activeTab === "feed" &&
                !activeDisciplineOption.query &&
                index === visibleFeed.length - 1
                  ? setSentinel
                  : null
              }
            >
              <ThesisCard
                t={t}
                thesis={thesis}
                liked={likedIds.includes(thesis.id)}
                onToggleLike={() => toggleLike(thesis)}
                onOpenAbstract={() => {
                  fireSelectionHaptic();
                  setActiveAbstractId(thesis.id);
                }}
                pdfUrl={thesis.pdfUrl}
                scholarUrl={buildGoogleScholarUrl(thesis)}
                scholarSameTab={installPlatform === "ios" && !isNativePlatform()}
                onSurfacePointerUp={handlePointerUp(thesis.id)}
                backgroundImage={canLoadBackgroundImages ? backgroundImages[thesis.id]?.imageUrl : null}
                backgroundMeta={canLoadBackgroundImages ? backgroundImages[thesis.id] : null}
              />
              {heartBursts
                .filter((burst) => burst.thesisId === thesis.id)
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

      <BottomTabBar activeTab={activeTab} onSelect={handleTabSelect} tabs={tabs} />
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
        thesis={feed.find((item) => item.id === activeAbstractId)}
        open={Boolean(activeAbstractId)}
        onClose={() => setActiveAbstractId(null)}
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
    </div>
  );
}
