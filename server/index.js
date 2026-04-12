import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  getCategories,
  getCategoryFeed,
  getCacheStats,
  getDisciplines,
  getDisciplineFeed,
  getFeed,
  getRandomThesis,
  getThesisById,
  searchTheses
} from "./yoktezClient.js";
import { generateSummary } from "./summary.js";
import { getBackgroundImage } from "./backgroundImages.js";

const app = express();
const port = process.env.PORT || 3001;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    scraper: "adapter-ready",
    cache: getCacheStats()
  });
});

app.get("/api/random-thesis", async (req, res, next) => {
  try {
    const seed = Number(req.query.seed ?? Math.random());
    const thesis = await getRandomThesis(seed);
    res.json(thesis);
  } catch (error) {
    next(error);
  }
});

app.get("/api/feed", async (req, res, next) => {
  try {
    const cursor = Number(req.query.cursor ?? 0);
    const limit = Math.min(Number(req.query.limit ?? 4), 10);
    const feed = await getFeed(cursor, limit);
    res.json(feed);
  } catch (error) {
    next(error);
  }
});

app.get("/api/search", async (req, res, next) => {
  try {
    const results = await searchTheses(String(req.query.q ?? ""));
    res.json({
      query: String(req.query.q ?? ""),
      count: results.length,
      items: results
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/categories", async (_req, res, next) => {
  try {
    const items = await getCategories();
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

app.get("/api/disciplines", async (_req, res, next) => {
  try {
    const items = await getDisciplines();
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

app.get("/api/category-feed", async (req, res, next) => {
  try {
    const category = String(req.query.category ?? "");
    const payload = await getCategoryFeed(category);
    res.json({
      category,
      ...payload
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/discipline-feed", async (req, res, next) => {
  try {
    const discipline = String(req.query.discipline ?? "");
    const payload = await getDisciplineFeed(discipline);
    res.json({
      discipline,
      ...payload
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/thesis/:id", async (req, res, next) => {
  try {
    const thesis = await getThesisById(req.params.id);

    if (!thesis) {
      res.status(404).json({ error: "Thesis not found" });
      return;
    }

    res.json(thesis);
  } catch (error) {
    next(error);
  }
});

app.post("/api/thesis/:id/summary", async (req, res, next) => {
  try {
    const thesis = await getThesisById(req.params.id);

    if (!thesis) {
      res.status(404).json({ error: "Thesis not found" });
      return;
    }

    const summary = await generateSummary(thesis);
    res.json(summary);
  } catch (error) {
    next(error);
  }
});

app.get("/api/background-image", async (req, res, next) => {
  try {
    const keywords = String(req.query.keywords ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    const title = String(req.query.title ?? "");
    const item = await getBackgroundImage({ title, keywords });
    res.json({ item });
  } catch (error) {
    next(error);
  }
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(rootDir, "dist")));

  app.get("*", (_req, res) => {
    res.sendFile(path.join(rootDir, "dist", "index.html"));
  });
}

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({
    error: "Internal server error",
    details: error.message
  });
});

app.listen(port, () => {
  console.log(`TezTok server listening on http://localhost:${port}`);
});
