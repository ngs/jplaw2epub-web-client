import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { faviconGenerator } from "./vite-plugins/favicon-generator";
import { markdownDevServerPlugin } from "./vite-plugins/markdown-dev-server";
import { markdownToHtmlPlugin } from "./vite-plugins/markdown-to-html";
import { serviceWorkerDevPlugin } from "./vite-plugins/service-worker-dev";
import { serviceWorkerManifestPlugin } from "./vite-plugins/service-worker-manifest";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    markdownToHtmlPlugin({
      docsDir: "public-docs",
      outputDir: "", // Output directly to dist root (e.g., dist/help/index.html)
    }),
    markdownDevServerPlugin({
      docsDir: "public-docs",
    }),
    faviconGenerator(),
    serviceWorkerDevPlugin(),
    serviceWorkerManifestPlugin(),
  ],
  base: "/",
  publicDir: "public",
  build: {
    rollupOptions: {
      input: {
        main: "./index.html",
        sw: "./src/sw/index.ts",
      },
      output: {
        entryFileNames: (chunkInfo) => {
          return chunkInfo.name === "sw"
            ? "[name].js"
            : "assets/[name]-[hash].js";
        },
      },
    },
  },
  worker: {
    format: "es",
  },
  define:
    mode === "production"
      ? {}
      : {
          __VITE_SW_MANIFEST__: "[]",
        },
}));
