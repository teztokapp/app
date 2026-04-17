import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
      },
      includeAssets: ["icon-192.png", "icon-512.png", "apple-touch-icon.png"],
      manifest: {
        name: "TezTok",
        short_name: "TezTok",
        description: "A mobile-first thesis browser inspired by TikTok, powered by YOKTez.",
        id: "/",
        theme_color: "#0b1020",
        background_color: "#0b1020",
        display: "standalone",
        display_override: ["window-controls-overlay", "standalone"],
        start_url: "/",
        scope: "/",
        protocol_handlers: [
          {
            protocol: "web+teztok",
            url: "/?open=%s",
          },
        ],
        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        screenshots: [
          {
            src: "/screenshots/screenshot-mobile-1.png",
            sizes: "750x1334",
            type: "image/png",
            label: "TezTok feed preview",
          },
          {
            src: "/screenshots/screenshot-mobile-2.png",
            sizes: "750x1334",
            type: "image/png",
            label: "TezTok search preview",
          },
          {
            src: "/screenshots/screenshot-mobile-3.png",
            sizes: "750x1334",
            type: "image/png",
            label: "TezTok thesis detail preview",
          },
          {
            src: "/screenshots/screenshot-mobile-4.png",
            sizes: "750x1334",
            type: "image/png",
            label: "TezTok settings preview",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,json}"],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        navigateFallback: "/index.html",
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "NetworkFirst",
            options: {
              cacheName: "app-pages",
              networkTimeoutSeconds: 3,
            },
          },
          {
            urlPattern: ({ request }) =>
              request.destination === "script" ||
              request.destination === "style" ||
              request.destination === "worker",
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "app-assets",
            },
          },
          {
            urlPattern: ({ request }) => request.destination === "image",
            handler: "CacheFirst",
            options: {
              cacheName: "app-images",
              expiration: {
                maxEntries: 80,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
          {
            urlPattern: ({ url }) =>
              url.origin === self.location.origin &&
              url.pathname.startsWith("/api/"),
            handler: "NetworkFirst",
            options: {
              cacheName: "server-api",
              networkTimeoutSeconds: 3,
              cacheableResponse: {
                statuses: [0, 200],
              },
              expiration: {
                maxEntries: 80,
                maxAgeSeconds: 60 * 60 * 24 * 7,
              },
            },
          },
          {
            urlPattern: ({ url, request }) =>
              request.method === "GET" &&
              [
                "api.openalex.org",
                "api.crossref.org",
                "api.semanticscholar.org",
                "api.core.ac.uk",
                "eutils.ncbi.nlm.nih.gov",
              ].includes(url.hostname),
            handler: "NetworkFirst",
            options: {
              cacheName: "remote-feeds",
              networkTimeoutSeconds: 3,
              cacheableResponse: {
                statuses: [0, 200],
              },
              expiration: {
                maxEntries: 120,
                maxAgeSeconds: 60 * 60 * 24 * 7,
              },
            },
          },
        ],
      },
    }),
  ],
  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      "/api": "http://localhost:3001"
    }
  },
  build: {
    outDir: "dist"
  }
});
