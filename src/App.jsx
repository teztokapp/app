import { useEffect, useRef, useState } from "react";

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

const previewAbstract = (text, expanded) => {
  if (expanded || text.length < 140) {
    return text;
  }

  return `${text.slice(0, 140).trim()}...`;
};

const tabs = [
  { id: "feed", label: "Akış", icon: "home" },
  { id: "likes", label: "Beğeniler", icon: "heart" },
  { id: "settings", label: "Ayarlar", icon: "settings" },
];

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

function BottomTabBar({ activeTab, onSelect }) {
  return (
    <nav className="tab-bar" aria-label="Birincil">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={activeTab === tab.id ? "tab-button active" : "tab-button"}
          onClick={() => onSelect(tab.id)}
        >
          <TabIcon icon={tab.icon} active={activeTab === tab.id} />
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}

function SettingsScreen({
  theme,
  onThemeChange,
  selectedDisciplineLabel,
  onOpenDisciplinePicker,
}) {
  return (
    <section className="info-screen">
      <div className="info-list">
        <div className="info-row">
          <p>Varsayılan anabilim dalı</p>
          <button
            type="button"
            className="settings-select"
            onClick={onOpenDisciplinePicker}
          >
            <span>{selectedDisciplineLabel}</span>
          </button>
        </div>
        <div className="info-row">
          <p>Tema</p>
          <div className="theme-toggle" role="group" aria-label="Tema">
            {["light", "dark"].map((option) => (
              <button
                key={option}
                type="button"
                className={theme === option ? "theme-button active" : "theme-button"}
                onClick={() => onThemeChange(option)}
              >
                {option === "light" ? "Açık" : "Koyu"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function DisciplinePickerModal({
  open,
  title,
  options,
  selectedId,
  onClose,
  onSelect,
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
        .map((option) => option.label.trim().charAt(0).toLocaleUpperCase("tr"))
        .filter(Boolean),
    ),
  );

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
            <h3>Anabilim dalı seç</h3>
          </div>
          <button type="button" className="sheet-close" onClick={onClose}>
            Tamam
          </button>
        </div>
        <input
          className="picker-search"
          type="search"
          placeholder="Anabilim dalı ara"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="picker-letters" aria-label="Harfe göre atla">
          <button
            type="button"
            className={activeLetter === "" ? "picker-letter active" : "picker-letter"}
            onClick={() => setActiveLetter("")}
          >
            Tümü
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
                onSelect(option.id);
                onClose();
              }}
            >
              <span>{option.label}</span>
              {option.id === selectedId ? <strong>Seçili</strong> : null}
            </button>
          ))}
          {visibleOptions.length === 0 ? (
            <div className="picker-empty">Bu aramayla eşleşen anabilim dalı yok.</div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function AbstractSheet({ thesis, open, onClose }) {
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
        aria-label="Tam özet"
      >
        <div className="sheet-handle" />
        <div className="sheet-header">
          <p>{thesis.author}</p>
          <button type="button" className="sheet-close" onClick={onClose}>
            Tamam
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

function LikedThesisList({ items, onOpenFeed, onRemoveLike }) {
  return (
    <section className="likes-list-screen">
      {items.length === 0 ? (
        <div className="empty-copy empty-likes">
          <div className="empty-face" aria-hidden="true">
            :(
          </div>
          <p className="info-kicker">Henüz beğeni yok</p>
          <h3>Bir tezi kaydetmek için iki kez dokun.</h3>
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
                Beğeniden kaldır
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function ThesisCard({
  thesis,
  liked,
  onToggleLike,
  onOpenAbstract,
  onSurfacePointerUp,
  onOpenPdf,
  backgroundImage,
}) {
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
          className={liked ? "action active" : "action"}
          onClick={onToggleLike}
          data-no-double-tap="true"
        >
          <HeartIcon filled={liked} />
        </button>
        <button
          type="button"
          className="action action-link"
          onClick={onOpenPdf}
          data-no-double-tap="true"
        >
          <PdfIcon />
        </button>
      </aside>

      <div className="screen-bottom">
        <div className="abstract-panel">
          <p className="abstract-text">
            {previewAbstract(thesis.abstract, false)}
          </p>
          <button
            className="ghost-button"
            onClick={onOpenAbstract}
            data-no-double-tap="true"
          >
            Özeti oku
          </button>
        </div>

        <div className="keywords-row">
          {thesis.keywords.map((keyword) => (
            <span key={keyword} className="keyword-chip">
              {keyword}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

export default function App() {
  const [feed, setFeed] = useState([]);
  const [cursor, setCursor] = useState(0);
  const [activeTab, setActiveTab] = useState("feed");
  const [disciplineOptions, setDisciplineOptions] = useState([
    { id: "all", label: "Tüm Konular", query: "" },
  ]);
  const [selectedDisciplineId, setSelectedDisciplineId] = useState(
    () => window.localStorage.getItem("teztok-default-discipline") ?? "all",
  );
  const [disciplinePickerOpen, setDisciplinePickerOpen] = useState(false);
  const [theme, setTheme] = useState(
    () => window.localStorage.getItem("teztok-theme") ?? "dark",
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
  const [heartBursts, setHeartBursts] = useState([]);
  const [backgroundImages, setBackgroundImages] = useState({});
  const [pendingOpenThesisId, setPendingOpenThesisId] = useState(null);
  const observerRef = useRef(null);
  const tapTrackerRef = useRef({ id: null, time: 0, x: 0, y: 0 });
  const feedRef = useRef(null);
  const likesRef = useRef(null);
  const settingsRef = useRef(null);
  const scrollPositionsRef = useRef({ feed: 0, likes: 0, settings: 0 });

  useEffect(() => {
    window.localStorage.setItem("teztok-liked", JSON.stringify(likedIds));
  }, [likedIds]);

  useEffect(() => {
    window.localStorage.setItem("teztok-liked-items", JSON.stringify(likedItems));
  }, [likedItems]);

  useEffect(() => {
    window.localStorage.setItem("teztok-default-discipline", selectedDisciplineId);
  }, [selectedDisciplineId]);

  useEffect(() => {
    window.localStorage.setItem("teztok-theme", theme);
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const activeDisciplineOption =
    disciplineOptions.find((option) => option.id === selectedDisciplineId) ??
    disciplineOptions[0];

  useEffect(() => {
    void fetch("/api/disciplines")
      .then((response) => response.json())
      .then((data) => {
        const liveOptions = dedupeThesesById((data.items ?? []).map((item) => ({
          id: item.id,
          label: item.label,
          query: item.query,
        })));

        setDisciplineOptions([
          { id: "all", label: "Tüm Konular", query: "" },
          ...liveOptions,
        ]);

        const validIds = new Set(["all", ...liveOptions.map((item) => item.id)]);
        setSelectedDisciplineId((current) =>
          validIds.has(current) ? current : "all",
        );
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    if (activeDisciplineOption.query) {
      void loadDisciplineFeed(activeDisciplineOption);
      return;
    }

    void loadFeed(0, true);
  }, [selectedDisciplineId]);

  useEffect(() => {
    const uncached = feed
      .filter((thesis) => !backgroundImages[thesis.id])
      .slice(0, 6);

    uncached.forEach((thesis) => {
      const params = new URLSearchParams({
        title: thesis.title,
        keywords: thesis.keywords.join(","),
      });

      void fetch(`/api/background-image?${params.toString()}`)
        .then((response) => response.json())
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
  }, [feed, backgroundImages]);

  async function loadFeed(nextCursor, replace = false) {
    setLoadingFeed(true);
    setFeedEmptyMessage("");
    if (replace) {
      scrollPositionsRef.current.feed = 0;
      feedRef.current?.scrollTo({ top: 0, behavior: "auto" });
    }
    const response = await fetch(`/api/feed?cursor=${nextCursor}&limit=4`);
    const data = await response.json();

    setCursor(data.nextCursor);
    setFeed((current) =>
      replace
        ? dedupeThesesById(data.items)
        : dedupeThesesById([...current, ...data.items]),
    );
    setLoadingFeed(false);
  }

  async function loadDisciplineFeed(disciplineOption) {
    setLoadingFeed(true);
    setFeedEmptyMessage("");
    scrollPositionsRef.current.feed = 0;
    feedRef.current?.scrollTo({ top: 0, behavior: "auto" });
    const response = await fetch(
      `/api/discipline-feed?discipline=${encodeURIComponent(disciplineOption.id)}`,
    );
    const data = await response.json();
    setCursor(0);
    const uniqueItems = dedupeThesesById(data.items ?? []);
    setFeed(uniqueItems);
    if (uniqueItems.length === 0) {
      setFeedEmptyMessage(`${disciplineOption.label} için tez bulunamadı.`);
    }
    setLoadingFeed(false);
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

    setActiveTab(nextTab);
  }

  function openLikedItem(id) {
    const likedThesis = likedFeed.find((item) => item.id === id);

    if (likedThesis) {
      setFeed((current) =>
        current.some((item) => item.id === id)
          ? current
          : [likedThesis, ...current],
      );
    }

    setPendingOpenThesisId(id);
    setSelectedDisciplineId("all");
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

  return (
    <div className="app-shell">
      <header className="floating-header">
        <div className="header-brand">
          <h2>TezTok</h2>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="topic-select"
            onClick={() => setDisciplinePickerOpen(true)}
            aria-label="Anabilim dalına göre filtrele"
          >
            <span>{activeDisciplineOption?.label ?? "Tüm Konular"}</span>
          </button>
        </div>
      </header>

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
            onThemeChange={setTheme}
            selectedDisciplineLabel={activeDisciplineOption?.label ?? "Tüm Konular"}
            onOpenDisciplinePicker={() => setDisciplinePickerOpen(true)}
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
                <p className="info-kicker">Yükleniyor</p>
                <h3>
                  {activeDisciplineOption.query
                    ? `${activeDisciplineOption.label} tezleri getiriliyor...`
                    : "En yeni tezler getiriliyor..."}
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
                thesis={thesis}
                liked={likedIds.includes(thesis.id)}
                onToggleLike={() => toggleLike(thesis)}
                onOpenAbstract={() => setActiveAbstractId(thesis.id)}
                onOpenPdf={() => {
                  const targetUrl = thesis.pdfUrl || thesis.detailPageUrl;
                  if (targetUrl) {
                    window.open(targetUrl, "_blank", "noopener,noreferrer");
                  }
                }}
                onSurfacePointerUp={handlePointerUp(thesis.id)}
                backgroundImage={backgroundImages[thesis.id]?.imageUrl}
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
            <div className="loading-strip">Daha fazla tez yükleniyor...</div>
          )}

          {activeTab === "feed" && activeDisciplineOption.query && loadingFeed && visibleFeed.length > 0 && (
            <div className="loading-overlay">
              <div className="loading-strip">
                {activeDisciplineOption.label} yükleniyor...
              </div>
            </div>
          )}

          {activeTab === "feed" && !loadingFeed && visibleFeed.length === 0 && (
            <section className="info-screen empty-state">
              <div className="empty-copy">
                <p className="info-kicker">Tez yok</p>
                <h3>{feedEmptyMessage || "Şu anda gösterilecek tez yok."}</h3>
              </div>
            </section>
          )}
        </main>
      )}

      <BottomTabBar activeTab={activeTab} onSelect={handleTabSelect} />
      <DisciplinePickerModal
        open={disciplinePickerOpen}
        title="Anabilim Dalları"
        options={disciplineOptions}
        selectedId={selectedDisciplineId}
        onClose={() => setDisciplinePickerOpen(false)}
        onSelect={setSelectedDisciplineId}
      />
      <AbstractSheet
        thesis={feed.find((item) => item.id === activeAbstractId)}
        open={Boolean(activeAbstractId)}
        onClose={() => setActiveAbstractId(null)}
      />
    </div>
  );
}
