import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { faviconGenerator } from "./vite-plugins/favicon-generator";
import { markdownDevServerPlugin } from "./vite-plugins/markdown-dev-server";
import { markdownToHtmlPlugin } from "./vite-plugins/markdown-to-html";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    markdownToHtmlPlugin({
      docsDir: "public-docs",
      outputDir: ""  // Output directly to dist root (e.g., dist/help/index.html)
    }),
    markdownDevServerPlugin({
      docsDir: "public-docs"
    }),
    faviconGenerator()
  ],
  base: "/",
  publicDir: "public",
});
