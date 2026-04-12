const IMAGE_CACHE_TTL_MS = 1000 * 60 * 60 * 6;
const imageCache = new Map();

const buildImageKey = (query) => query.trim().toLocaleLowerCase("tr");

const getCachedImage = (key) => {
  const hit = imageCache.get(key);

  if (!hit) {
    return null;
  }

  if (Date.now() > hit.expiresAt) {
    imageCache.delete(key);
    return null;
  }

  return hit.value;
};

const setCachedImage = (key, value) => {
  imageCache.set(key, { value, expiresAt: Date.now() + IMAGE_CACHE_TTL_MS });
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

async function fetchCommonsImage(query) {
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

export async function getBackgroundImage(params) {
  const candidates = buildCandidateQueries(params);

  for (const query of candidates) {
    const cacheKey = buildImageKey(query);
    const cached = getCachedImage(cacheKey);

    if (cached) {
      return cached;
    }

    const result = await fetchCommonsImage(query);

    if (result) {
      return setCachedImage(cacheKey, result);
    }
  }

  return null;
}
