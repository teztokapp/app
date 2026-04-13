const IMAGE_CACHE_TTL_MS = 1000 * 60 * 60 * 6;
const IMAGE_NEGATIVE_CACHE_TTL_MS = 1000 * 60 * 15;
const COMMONS_COOLDOWN_MS = 1000 * 60 * 10;
const UNSPLASH_COOLDOWN_MS = 1000 * 60 * 10;
const imageCache = new Map();
let commonsCooldownUntil = 0;
let unsplashCooldownUntil = 0;
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

const buildImageKey = (query) => query.trim().toLocaleLowerCase("tr");

const getCachedImage = (key) => {
  const hit = imageCache.get(key);

  if (!hit) {
    return undefined;
  }

  if (Date.now() > hit.expiresAt) {
    imageCache.delete(key);
    return undefined;
  }

  return hit.value;
};

const setCachedImage = (key, value, ttlMs = IMAGE_CACHE_TTL_MS) => {
  imageCache.set(key, { value, expiresAt: Date.now() + ttlMs });
  return value;
};

function buildCandidateQueries({ title = "", keywords = [] }) {
  const cleanKeywords = keywords.filter(Boolean).slice(0, 3);

  return [
    cleanKeywords.join(" "),
    cleanKeywords[0] ?? "",
    title.split(":")[0]?.trim() ?? "",
    title.split(" ").slice(0, 4).join(" ")
  ].filter(Boolean);
}

const addUnsplashUtm = (rawUrl) => {
  if (!rawUrl) {
    return null;
  }

  const url = new URL(rawUrl);
  url.searchParams.set("utm_source", "teztok");
  url.searchParams.set("utm_medium", "referral");
  return url.toString();
};

async function fetchCommonsImage(query) {
  if (Date.now() < commonsCooldownUntil) {
    return null;
  }

  const url = new URL("https://commons.wikimedia.org/w/api.php");
  url.searchParams.set("action", "query");
  url.searchParams.set("generator", "search");
  url.searchParams.set("gsrsearch", query);
  url.searchParams.set("gsrnamespace", "6");
  url.searchParams.set("gsrlimit", "6");
  url.searchParams.set("prop", "imageinfo");
  url.searchParams.set("iiprop", "url|mime|extmetadata");
  url.searchParams.set("iiurlwidth", "1600");
  url.searchParams.set("format", "json");
  url.searchParams.set("origin", "*");

  const response = await fetch(url, {
    headers: {
      "User-Agent": "TezTok/0.1 (academic thesis browsing prototype)"
    }
  });

  if (response.status === 429) {
    commonsCooldownUntil = Date.now() + COMMONS_COOLDOWN_MS;
    return null;
  }

  if (!response.ok) {
    throw new Error(`Wikimedia image search failed: ${response.status}`);
  }

  const payload = await response.json();
  const pages = Object.values(payload?.query?.pages ?? {});

  return (
    pages
      .map((page) => {
        const info = page.imageinfo?.[0];

        if (!info?.thumburl || !info.mime?.startsWith("image/")) {
          return null;
        }

        return {
          source: "wikimedia-commons",
          query,
          title: page.title?.replace(/^File:/, "") ?? query,
          imageUrl: info.thumburl,
          pageUrl: info.descriptionurl ?? null,
          license: info.extmetadata?.LicenseShortName?.value ?? null
        };
      })
      .find(Boolean) ?? null
  );
}

async function fetchUnsplashImage(query) {
  if (!UNSPLASH_ACCESS_KEY || Date.now() < unsplashCooldownUntil) {
    return null;
  }

  const url = new URL("https://api.unsplash.com/search/photos");
  url.searchParams.set("query", query);
  url.searchParams.set("per_page", "8");
  url.searchParams.set("orientation", "portrait");
  url.searchParams.set("content_filter", "high");
  url.searchParams.set("client_id", UNSPLASH_ACCESS_KEY);

  const response = await fetch(url, {
    headers: {
      "Accept-Version": "v1",
      "User-Agent": "TezTok/0.1 (academic thesis browsing prototype)",
    },
  });

  if (response.status === 429) {
    unsplashCooldownUntil = Date.now() + UNSPLASH_COOLDOWN_MS;
    return null;
  }

  if (response.status === 401 || response.status === 403) {
    unsplashCooldownUntil = Date.now() + UNSPLASH_COOLDOWN_MS;
    return null;
  }

  if (!response.ok) {
    throw new Error(`Unsplash image search failed: ${response.status}`);
  }

  const payload = await response.json();
  const photo =
    payload?.results?.find((item) => item?.urls?.regular && item?.user?.name) ?? null;

  if (!photo) {
    return null;
  }

  return {
    source: "unsplash",
    query,
    title: photo.alt_description ?? photo.description ?? query,
    imageUrl: photo.urls.regular,
    pageUrl: addUnsplashUtm(photo.links?.html),
    attributionLabel: `${photo.user.name} / Unsplash`,
    attributionUrl: addUnsplashUtm(photo.user.links?.html ?? photo.links?.html),
    license: "Unsplash",
  };
}

export async function getBackgroundImage(params) {
  const candidates = buildCandidateQueries(params);

  for (const query of candidates) {
    const cacheKey = buildImageKey(query);
    const cached = getCachedImage(cacheKey);

    if (cached !== undefined) {
      return cached;
    }

    const commonsResult = await fetchCommonsImage(query);

    if (commonsResult) {
      return setCachedImage(cacheKey, commonsResult);
    }

    const unsplashResult = await fetchUnsplashImage(query);

    if (unsplashResult) {
      return setCachedImage(cacheKey, unsplashResult);
    }

    setCachedImage(cacheKey, null, IMAGE_NEGATIVE_CACHE_TTL_MS);
  }

  return null;
}
