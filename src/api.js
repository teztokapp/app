import { createTranslator, DEFAULT_LOCALE } from "./i18n.js";

export const BACKEND_OPENALEX = "openalex";
export const BACKEND_CROSSREF = "crossref";
export const BACKEND_SEMANTIC_SCHOLAR = "semantic-scholar";
export const BACKEND_CORE = "core";
export const BACKEND_YOKTEZ = "yoktez";
export const DEFAULT_BACKEND = BACKEND_YOKTEZ;

export const BACKEND_OPTIONS = [
  { id: BACKEND_OPENALEX, label: "OpenAlex" },
  { id: BACKEND_SEMANTIC_SCHOLAR, label: "Semantic Scholar" },
  { id: BACKEND_CORE, label: "CORE" },
  { id: BACKEND_CROSSREF, label: "Crossref" },
  { id: BACKEND_YOKTEZ, label: "YÖK Tez" },
];

export function getBackendOptions(locale = DEFAULT_LOCALE) {
  const t = getTranslatorForLocale(locale);
  const labelKeys = {
    [BACKEND_OPENALEX]: "providers.names.openalex",
    [BACKEND_SEMANTIC_SCHOLAR]: "providers.names.semanticScholar",
    [BACKEND_CORE]: "providers.names.core",
    [BACKEND_CROSSREF]: "providers.names.crossref",
    [BACKEND_YOKTEZ]: "providers.names.yoktez",
  };

  return BACKEND_OPTIONS.map((option) => {
    const translated = t(labelKeys[option.id]);

    return {
      ...option,
      label: translated === labelKeys[option.id] ? option.label : translated,
    };
  });
}

const OPENALEX_API_URL = (
  import.meta.env.VITE_OPENALEX_API_URL ??
  "https://api.openalex.org/works"
).trim();

const CROSSREF_API_URL = (
  import.meta.env.VITE_CROSSREF_API_URL ??
  "https://api.crossref.org/works"
).trim();

const SEMANTIC_SCHOLAR_API_URL = (
  import.meta.env.VITE_SEMANTIC_SCHOLAR_API_URL ??
  "https://api.semanticscholar.org/graph/v1/paper/search"
).trim();

const CORE_API_URL = (
  import.meta.env.VITE_CORE_API_URL ??
  "https://api.core.ac.uk/v3/search/works/"
).trim();

const OPENALEX_FILTER_OPTIONS = [
  { id: "all", labelKey: "providers.openalex.all", fallbackLabel: "Tüm OpenAlex", search: "", filter: "" },
  { id: "computer-science", labelKey: "providers.common.computerScience", fallbackLabel: "Bilgisayar Bilimi", search: "", filter: "primary_topic.field.id:17" },
  { id: "ai", labelKey: "providers.common.ai", fallbackLabel: "Yapay Zeka", search: "", filter: "primary_topic.subfield.id:1702" },
  { id: "ml", labelKey: "providers.common.ml", fallbackLabel: "Makine Öğrenmesi", search: "machine learning", filter: "primary_topic.subfield.id:1702" },
  { id: "nlp", labelKey: "providers.common.nlp", fallbackLabel: "Doğal Dil İşleme", search: "", filter: "primary_topic.id:T10181" },
  { id: "cv", labelKey: "providers.common.cv", fallbackLabel: "Bilgisayarlı Görü", search: "", filter: "primary_topic.subfield.id:1707" },
  { id: "biology", labelKey: "providers.common.biology", fallbackLabel: "Biyoloji", search: "", filter: "primary_topic.domain.id:1" },
  { id: "economics", labelKey: "providers.common.economics", fallbackLabel: "Ekonomi", search: "", filter: "primary_topic.field.id:20" },
];

const CROSSREF_FILTER_OPTIONS = [
  { id: "all", labelKey: "providers.crossref.all", fallbackLabel: "Tüm Crossref", query: "", type: "" },
  { id: "preprint", labelKey: "providers.common.preprint", fallbackLabel: "Preprint", query: "", type: "posted-content" },
  { id: "ai", labelKey: "providers.common.ai", fallbackLabel: "Yapay Zeka", query: "artificial intelligence", type: "" },
  { id: "ml", labelKey: "providers.common.ml", fallbackLabel: "Makine Öğrenmesi", query: "machine learning", type: "" },
  { id: "nlp", labelKey: "providers.common.nlp", fallbackLabel: "Doğal Dil İşleme", query: "natural language processing", type: "" },
  { id: "cv", labelKey: "providers.common.cv", fallbackLabel: "Bilgisayarlı Görü", query: "computer vision", type: "" },
  { id: "biology", labelKey: "providers.common.biology", fallbackLabel: "Biyoloji", query: "biology", type: "" },
  { id: "economics", labelKey: "providers.common.economics", fallbackLabel: "Ekonomi", query: "economics", type: "" },
];

const SEMANTIC_SCHOLAR_FILTER_OPTIONS = [
  { id: "all", labelKey: "providers.semanticScholar.all", fallbackLabel: "Tüm Semantic Scholar", query: "research" },
  { id: "ai", labelKey: "providers.common.ai", fallbackLabel: "Yapay Zeka", query: "\"artificial intelligence\"" },
  { id: "ml", labelKey: "providers.common.ml", fallbackLabel: "Makine Öğrenmesi", query: "\"machine learning\"" },
  { id: "nlp", labelKey: "providers.common.nlp", fallbackLabel: "Doğal Dil İşleme", query: "\"natural language processing\"" },
  { id: "cv", labelKey: "providers.common.cv", fallbackLabel: "Bilgisayarlı Görü", query: "\"computer vision\"" },
  { id: "biology", labelKey: "providers.common.biology", fallbackLabel: "Biyoloji", query: "biology" },
  { id: "economics", labelKey: "providers.common.economics", fallbackLabel: "Ekonomi", query: "economics" },
];

const CORE_FILTER_OPTIONS = [
  { id: "all", labelKey: "providers.core.all", fallbackLabel: "Tüm CORE", query: "research" },
  { id: "ai", labelKey: "providers.common.ai", fallbackLabel: "Yapay Zeka", query: "\"artificial intelligence\"" },
  { id: "ml", labelKey: "providers.common.ml", fallbackLabel: "Makine Öğrenmesi", query: "\"machine learning\"" },
  { id: "nlp", labelKey: "providers.common.nlp", fallbackLabel: "Doğal Dil İşleme", query: "\"natural language processing\"" },
  { id: "cv", labelKey: "providers.common.cv", fallbackLabel: "Bilgisayarlı Görü", query: "\"computer vision\"" },
  { id: "biology", labelKey: "providers.common.biology", fallbackLabel: "Biyoloji", query: "biology" },
  { id: "economics", labelKey: "providers.common.economics", fallbackLabel: "Ekonomi", query: "economics" },
];

function getTranslatorForLocale(locale) {
  return createTranslator(locale ?? DEFAULT_LOCALE);
}

function localizeOption(option, locale) {
  const t = getTranslatorForLocale(locale);
  const label = t(option.labelKey);

  return {
    ...option,
    label: label === option.labelKey ? option.fallbackLabel : label,
  };
}

function localizeOptions(options, locale) {
  return options.map((option) => localizeOption(option, locale));
}

function getClientProviderMetadata(id, label, locale = DEFAULT_LOCALE) {
  const t = getTranslatorForLocale(locale);

  return {
    id,
    label,
    filterLabel: t("providers.client.filterLabel"),
    filterLabelPlural: t("providers.client.filterLabelPlural"),
    filterSearchPlaceholder: t("providers.client.filterSearchPlaceholder"),
    filterEmptyMessage: t("providers.client.filterEmptyMessage", { label }),
    allFilterLabel: t("providers.client.all"),
    feedErrorHint: t("providers.client.feedErrorHint", { label }),
    supportsBackgroundImages: true,
    requiresCustomServer: false,
    clientOnly: true,
  };
}

export function getBackendMetadata(backend, locale = DEFAULT_LOCALE) {
  const t = getTranslatorForLocale(locale);

  if (backend === BACKEND_YOKTEZ) {
    return {
      id: BACKEND_YOKTEZ,
      label: t("providers.names.yoktez"),
      filterLabel: t("providers.yoktez.filterLabel"),
      filterLabelPlural: t("providers.yoktez.filterLabelPlural"),
      filterSearchPlaceholder: t("providers.yoktez.filterSearchPlaceholder"),
      filterEmptyMessage: t("providers.yoktez.filterEmptyMessage"),
      allFilterLabel: t("providers.yoktez.all"),
      feedErrorHint: t("providers.yoktez.feedErrorHint"),
      supportsBackgroundImages: true,
      requiresCustomServer: true,
      clientOnly: false,
    };
  }
  if (backend === BACKEND_CROSSREF) {
    return getClientProviderMetadata(BACKEND_CROSSREF, t("providers.names.crossref"), locale);
  }

  if (backend === BACKEND_SEMANTIC_SCHOLAR) {
    return getClientProviderMetadata(
      BACKEND_SEMANTIC_SCHOLAR,
      t("providers.names.semanticScholar"),
      locale,
    );
  }

  if (backend === BACKEND_CORE) {
    return getClientProviderMetadata(BACKEND_CORE, t("providers.names.core"), locale);
  }

  return getClientProviderMetadata(BACKEND_OPENALEX, t("providers.names.openalex"), locale);
}

function normalizeBaseUrl(value) {
  return String(value ?? "").trim().replace(/\/$/, "");
}

function normalizeWhitespace(value = "") {
  return String(value).replace(/\s+/g, " ").trim();
}

function humanizeTypeLabel(value = "") {
  const normalized = normalizeWhitespace(value).replace(/[-_]+/g, " ");

  if (!normalized) {
    return "";
  }

  return normalized.replace(/\b\w/g, (char) => char.toUpperCase());
}

function stripHtml(value = "") {
  return normalizeWhitespace(String(value).replace(/<[^>]+>/g, " "));
}

function normalizeTitle(value = "") {
  return stripHtml(value);
}

function normalizeAbstract(value = "") {
  return stripHtml(value);
}

function resolveYear(...candidates) {
  const currentYear = new Date().getFullYear() + 1;

  for (const candidate of candidates) {
    const match = String(candidate ?? "").match(/\d{4}/);
    const year = Number(match?.[0] ?? "");

    if (year >= 1900 && year <= currentYear) {
      return String(year);
    }
  }

  return "----";
}

function resolveBaseUrl(config = {}) {
  return config.backend === BACKEND_YOKTEZ
    ? normalizeBaseUrl(config.customApiBaseUrl)
    : "";
}

function buildUrl(path, params, config) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const baseUrl = resolveBaseUrl(config);
  const absoluteUrl = baseUrl
    ? `${baseUrl}${normalizedPath}`
    : normalizedPath;
  const url = new URL(absoluteUrl, window.location.origin);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        return;
      }

      url.searchParams.set(key, String(value));
    });
  }

  return baseUrl ? url.toString() : `${url.pathname}${url.search}`;
}

async function requestJson(path, params, config) {
  if (config?.backend === BACKEND_YOKTEZ && !resolveBaseUrl(config)) {
    throw new Error("YÖK Tez server URL is required.");
  }

  const response = await fetch(buildUrl(path, params, config));

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
}

async function requestJsonFromBaseUrl(baseUrl, path, params) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${normalizeBaseUrl(baseUrl)}${normalizedPath}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        return;
      }

      url.searchParams.set(key, String(value));
    });
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
}

function getOpenAlexFilterById(filterId = "all") {
  const matched = OPENALEX_FILTER_OPTIONS.find((option) => option.id === filterId);

  if (matched) {
    return matched;
  }

  if (filterId && String(filterId).includes(":")) {
    return {
      id: filterId,
      labelKey: "",
      fallbackLabel: filterId,
      search: "",
      filter: String(filterId),
    };
  }

  return OPENALEX_FILTER_OPTIONS[0];
}

function getCrossrefFilterById(filterId = "all") {
  return (
    CROSSREF_FILTER_OPTIONS.find((option) => option.id === filterId) ??
    CROSSREF_FILTER_OPTIONS[0]
  );
}

function getSemanticScholarFilterById(filterId = "all") {
  return (
    SEMANTIC_SCHOLAR_FILTER_OPTIONS.find((option) => option.id === filterId) ??
    SEMANTIC_SCHOLAR_FILTER_OPTIONS[0]
  );
}

function getCoreFilterById(filterId = "all") {
  return (
    CORE_FILTER_OPTIONS.find((option) => option.id === filterId) ??
    CORE_FILTER_OPTIONS[0]
  );
}

function readText(parent, namespace, tagName) {
  return normalizeWhitespace(
    parent.getElementsByTagNameNS(namespace, tagName)[0]?.textContent ?? "",
  );
}


function buildAuthorLabel(names = []) {
  return names.filter(Boolean).join(", ");
}

function rebuildOpenAlexAbstract(index = {}) {
  if (!index || typeof index !== "object" || Array.isArray(index)) {
    return "";
  }

  const entries = Object.entries(index);
  if (entries.length === 0) {
    return "";
  }

  const words = [];

  entries.forEach(([word, positions]) => {
    positions.forEach((position) => {
      words[position] = word;
    });
  });

  return normalizeWhitespace(words.filter(Boolean).join(" "));
}

function pickKeywords(values = []) {
  return values
    .map((value) => normalizeWhitespace(value))
    .filter(Boolean)
    .slice(0, 5);
}

function dedupeItemsById(items = []) {
  const seen = new Set();

  return items.filter((item) => {
    const id = item?.id;

    if (!id || seen.has(id)) {
      return false;
    }

    seen.add(id);
    return true;
  });
}

function normalizePdfUrl(
  value = "",
  { allowCoreDownloadProxy = true, requirePdfLikePath = true } = {},
) {
  const url = normalizeWhitespace(value);

  if (!url) {
    return "";
  }

  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname.toLowerCase();
    const hostname = parsed.hostname.toLowerCase();
    const looksLikePdf =
      pathname.endsWith(".pdf") ||
      pathname.includes("/pdf/") ||
      pathname.includes("/download/pdf/");

    if (requirePdfLikePath && !looksLikePdf) {
      return "";
    }

    if (!allowCoreDownloadProxy && hostname.endsWith("core.ac.uk")) {
      return "";
    }

    return parsed.toString();
  } catch {
    return "";
  }
}

function buildHeaders(extraHeaders = {}) {
  return Object.fromEntries(
    Object.entries(extraHeaders).filter(([, value]) => Boolean(value)),
  );
}



async function requestOpenAlexFeed({ page = 1, perPage = 4, filterId = "all" } = {}) {
  const filter = getOpenAlexFilterById(filterId);
  const url = new URL(OPENALEX_API_URL);
  url.searchParams.set("page", String(page));
  url.searchParams.set("per-page", String(perPage));
  url.searchParams.set("sort", "publication_date:desc");

  if (filter.search) {
    url.searchParams.set("search", filter.search);
  }

  if (filter.filter) {
    url.searchParams.set("filter", filter.filter);
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`OpenAlex request failed: ${response.status}`);
  }

  const data = await response.json();
  const results = (data.results ?? []).filter((item) => item.type !== "dataset");
  const items = results.map((item) => {
    const authors = (item.authorships ?? [])
      .map((authorship) => authorship.author?.display_name)
      .filter(Boolean);
    const primaryLocation = item.best_oa_location ?? item.primary_location ?? {};
    const primaryTopic = item.primary_topic;
    const keywords = pickKeywords([
      ...(item.keywords ?? []).map((keyword) => keyword.display_name),
      ...(item.topics ?? []).map((topic) => topic.display_name),
      ...(item.concepts ?? []).map((concept) => concept.display_name),
    ]);

    return {
      id: item.id ?? item.ids?.openalex ?? item.doi ?? item.display_name,
      title: normalizeTitle(item.display_name ?? item.title ?? ""),
      abstract: normalizeAbstract(rebuildOpenAlexAbstract(item.abstract_inverted_index)),
      author: buildAuthorLabel(authors),
      university:
        normalizeWhitespace(
          primaryLocation.source?.display_name ??
            primaryLocation.landing_page_url ??
            "OpenAlex",
        ) || "OpenAlex",
      department:
        normalizeWhitespace(
          primaryTopic?.field?.display_name ??
            primaryTopic?.subfield?.display_name ??
            primaryTopic?.display_name ??
            item.type,
        ) || "OpenAlex",
      year: resolveYear(
        item.publication_year,
        item.publication_date,
        item.updated_date,
        item.created_date,
      ),
      pdfUrl: normalizePdfUrl(primaryLocation.pdf_url ?? item.open_access?.oa_url ?? "", {
        requirePdfLikePath: false,
      }),
      detailPageUrl: primaryLocation.landing_page_url ?? item.id ?? "",
      keywords,
    };
  });

  return {
    items,
    nextCursor: (data.results ?? []).length === perPage ? page + 1 : page,
  };
}

async function requestOpenAlexDisciplines() {
  const [fieldsResponse, subfieldsResponse] = await Promise.all([
    fetch("https://api.openalex.org/fields?per-page=50&sort=works_count:desc"),
    fetch("https://api.openalex.org/subfields?per-page=200&sort=works_count:desc"),
  ]);

  if (!fieldsResponse.ok || !subfieldsResponse.ok) {
    throw new Error("OpenAlex disciplines could not be loaded.");
  }

  const fieldsData = await fieldsResponse.json();
  const subfieldsData = await subfieldsResponse.json();

  const fieldItems = (fieldsData.results ?? []).map((item) => ({
    id: `primary_topic.field.id:${String(item.id ?? "").split("/").pop()}`,
    label: normalizeWhitespace(item.display_name ?? ""),
    query: normalizeWhitespace(item.display_name ?? ""),
  }));

  const subfieldItems = (subfieldsData.results ?? []).map((item) => ({
    id: `primary_topic.subfield.id:${String(item.id ?? "").split("/").pop()}`,
    label: normalizeWhitespace(item.display_name ?? ""),
    query: normalizeWhitespace(
      [item.display_name, item.field?.display_name].filter(Boolean).join(" "),
    ),
  }));

  return {
    items: dedupeItemsById([...fieldItems, ...subfieldItems]).filter((item) => item.label),
  };
}

async function requestCrossrefFeed({ offset = 0, rows = 4, filterId = "all" } = {}) {
  const filter = getCrossrefFilterById(filterId);
  const url = new URL(CROSSREF_API_URL);
  url.searchParams.set("rows", String(rows));
  url.searchParams.set("offset", String(offset));
  url.searchParams.set("sort", "indexed");
  url.searchParams.set("order", "desc");

  if (filter.query) {
    url.searchParams.set("query.bibliographic", filter.query);
  }

  if (filter.type) {
    url.searchParams.set("filter", `type:${filter.type}`);
  }

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Crossref request failed: ${response.status}`);
  }

  const data = await response.json();
  const items = (data.message?.items ?? []).map((item) => {
    const authors = (item.author ?? [])
      .map((author) =>
        normalizeWhitespace([author.given, author.family].filter(Boolean).join(" ")),
      )
      .filter(Boolean);
    const links = item.link ?? [];
    const pdfUrl =
      links.find((link) => String(link["content-type"] ?? "").includes("pdf"))?.URL ?? "";
    const title = normalizeWhitespace((item.title ?? [])[0] ?? "");
    const abstract = stripHtml(item.abstract ?? "");
    const subjects = pickKeywords([
      ...(item.subject ?? []),
      item.type,
      ...(item["container-title"] ?? []),
    ]);

    return {
      id: item.DOI ?? item.URL ?? title,
      title: normalizeTitle(title),
      abstract,
      author: buildAuthorLabel(authors),
      university:
        normalizeWhitespace((item["container-title"] ?? [])[0] ?? item.publisher ?? "Crossref") ||
        "Crossref",
      department:
        normalizeWhitespace((item.subject ?? [])[0] || humanizeTypeLabel(item.type) || "Crossref") ||
        "Crossref",
      year: resolveYear(
        item.issued?.["date-parts"]?.[0]?.[0],
        item.published?.["date-parts"]?.[0]?.[0],
        item.created?.["date-time"],
        item.indexed?.["date-time"],
      ),
      pdfUrl: normalizePdfUrl(pdfUrl),
      detailPageUrl: item.URL ?? item.resource?.primary?.URL ?? "",
      keywords: subjects,
    };
  });

  return {
    items,
    nextCursor: items.length === rows ? offset + rows : offset,
  };
}

async function requestSemanticScholarFeed({
  offset = 0,
  limit = 4,
  filterId = "all",
  apiKey = "",
} = {}) {
  const filter = getSemanticScholarFilterById(filterId);
  const url = new URL(SEMANTIC_SCHOLAR_API_URL);
  url.searchParams.set("query", filter.query);
  url.searchParams.set("offset", String(offset));
  url.searchParams.set("limit", String(limit));
  url.searchParams.set(
    "fields",
    [
      "title",
      "abstract",
      "year",
      "authors",
      "url",
      "openAccessPdf",
      "fieldsOfStudy",
      "publicationTypes",
      "venue",
    ].join(","),
  );

  const response = await fetch(url.toString(), {
    headers: buildHeaders({
      "x-api-key": apiKey.trim(),
    }),
  });

  if (!response.ok) {
    throw new Error(`Semantic Scholar request failed: ${response.status}`);
  }

  const data = await response.json();
  const items = (data.data ?? []).map((item) => ({
      id: item.paperId ?? item.url ?? item.title,
      title: normalizeTitle(item.title ?? ""),
    abstract: normalizeAbstract(item.abstract ?? ""),
    author: buildAuthorLabel((item.authors ?? []).map((author) => author.name)),
    university: normalizeWhitespace(item.venue ?? "Semantic Scholar") || "Semantic Scholar",
    department:
      normalizeWhitespace((item.fieldsOfStudy ?? [])[0] ?? (item.publicationTypes ?? [])[0] ?? "Semantic Scholar") ||
      "Semantic Scholar",
    year: resolveYear(item.year),
    pdfUrl: normalizePdfUrl(item.openAccessPdf?.url ?? "", {
      requirePdfLikePath: false,
    }),
    detailPageUrl: item.url ?? "",
    keywords: pickKeywords([...(item.fieldsOfStudy ?? []), ...(item.publicationTypes ?? [])]),
  }));

  return {
    items,
    nextCursor: items.length === limit ? offset + limit : offset,
  };
}

async function requestCoreFeed({
  offset = 0,
  limit = 4,
  filterId = "all",
  apiKey = "",
} = {}) {
  const filter = getCoreFilterById(filterId);
  const url = new URL(CORE_API_URL);
  url.searchParams.set("q", filter.query);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("offset", String(offset));

  const response = await fetch(url.toString(), {
    headers: buildHeaders({
      Authorization: apiKey.trim() ? `Bearer ${apiKey.trim()}` : "",
    }),
  });

  if (!response.ok) {
    throw new Error(`CORE request failed: ${response.status}`);
  }

  const data = await response.json();
  const items = (data.results ?? data.data ?? []).map((item) => {
    const authors = Array.isArray(item.authors)
      ? item.authors.map((author) =>
          typeof author === "string"
            ? author
            : normalizeWhitespace(
                [author.name, author.given, author.family].filter(Boolean).join(" "),
              ),
        )
      : [];

    return {
      id: item.id ?? item.doi ?? item.oaiPmhUrl ?? item.downloadUrl ?? item.title,
      title: normalizeTitle(item.title ?? ""),
      abstract: normalizeAbstract(item.abstract ?? item.description ?? ""),
      author: buildAuthorLabel(authors),
      university:
        normalizeWhitespace(
          item.publisher ??
            item.journal ??
            item.dataProvider?.name ??
            item.repositoryDocument?.repositoryName ??
            "CORE",
        ) || "CORE",
      department:
        normalizeWhitespace(
          (item.topics ?? [])[0] ??
            (item.subjects ?? [])[0] ??
            (item.fields ?? [])[0] ??
            "CORE",
        ) || "CORE",
      year: resolveYear(item.yearPublished, item.publishedDate, item.createdDate),
      pdfUrl: normalizePdfUrl(item.downloadUrl ?? item.fullTextIdentifier ?? "", {
        allowCoreDownloadProxy: false,
      }),
      detailPageUrl: item.oaiPmhUrl ?? item.fullTextIdentifier ?? item.downloadUrl ?? "",
      keywords: pickKeywords([
        ...(item.topics ?? []),
        ...(item.subjects ?? []),
        ...(item.fields ?? []),
      ]),
    };
  });

  return {
    items,
    nextCursor: items.length === limit ? offset + limit : offset,
  };
}

export function fetchDisciplines(config) {

  if (config?.backend === BACKEND_OPENALEX) {
    return requestOpenAlexDisciplines().catch(() => ({
      items: localizeOptions(OPENALEX_FILTER_OPTIONS, config?.locale)
        .filter((option) => option.id !== "all")
        .map((option) => ({
          id: option.filter || option.id,
          label: option.label,
          query: option.search || option.filter || option.id,
        })),
    }));
  }

  if (config?.backend === BACKEND_CROSSREF) {
    return Promise.resolve({
      items: localizeOptions(CROSSREF_FILTER_OPTIONS, config?.locale)
        .filter((option) => option.id !== "all")
        .map((option) => ({
          id: option.id,
          label: option.label,
          query: option.query || option.type || option.id,
        })),
    });
  }

  if (config?.backend === BACKEND_SEMANTIC_SCHOLAR) {
    return Promise.resolve({
      items: localizeOptions(SEMANTIC_SCHOLAR_FILTER_OPTIONS, config?.locale)
        .filter((option) => option.id !== "all")
        .map((option) => ({
          id: option.id,
          label: option.label,
          query: option.query,
        })),
    });
  }

  if (config?.backend === BACKEND_CORE) {
    return Promise.resolve({
      items: localizeOptions(CORE_FILTER_OPTIONS, config?.locale)
        .filter((option) => option.id !== "all")
        .map((option) => ({
          id: option.id,
          label: option.label,
          query: option.query,
        })),
    });
  }

  return requestJson("/api/disciplines", undefined, config);
}

export function fetchFeedPage(cursor, limit, config) {

  if (config?.backend === BACKEND_OPENALEX) {
    return requestOpenAlexFeed({
      page: Number(cursor ?? 1) || 1,
      perPage: Number(limit ?? 4),
    });
  }

  if (config?.backend === BACKEND_CROSSREF) {
    return requestCrossrefFeed({
      offset: Number(cursor ?? 0),
      rows: Number(limit ?? 4),
    });
  }

  if (config?.backend === BACKEND_SEMANTIC_SCHOLAR) {
    return requestSemanticScholarFeed({
      offset: Number(cursor ?? 0),
      limit: Number(limit ?? 4),
      apiKey: config.semanticScholarApiKey,
    });
  }

  if (config?.backend === BACKEND_CORE) {
    return requestCoreFeed({
      offset: Number(cursor ?? 0),
      limit: Number(limit ?? 4),
      apiKey: config.coreApiKey,
    });
  }

  return requestJson("/api/feed", { cursor, limit }, config);
}

export function fetchDisciplineFeed(discipline, config) {

  if (config?.backend === BACKEND_OPENALEX) {
    return requestOpenAlexFeed({
      page: 1,
      perPage: 20,
      filterId: discipline,
    });
  }

  if (config?.backend === BACKEND_CROSSREF) {
    return requestCrossrefFeed({
      offset: 0,
      rows: 20,
      filterId: discipline,
    });
  }

  if (config?.backend === BACKEND_SEMANTIC_SCHOLAR) {
    return requestSemanticScholarFeed({
      offset: 0,
      limit: 20,
      filterId: discipline,
      apiKey: config.semanticScholarApiKey,
    });
  }

  if (config?.backend === BACKEND_CORE) {
    return requestCoreFeed({
      offset: 0,
      limit: 20,
      filterId: discipline,
      apiKey: config.coreApiKey,
    });
  }

  return requestJson("/api/discipline-feed", { discipline }, config);
}

export function fetchBackgroundImage({ title, keywords }, config) {
  return requestJson("/api/background-image", {
    title,
    keywords: keywords.join(","),
  }, config);
}
