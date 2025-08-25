import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

export default defineConfig((configEnv) =>
  mergeConfig(
    typeof viteConfig === "function" ? viteConfig(configEnv) : viteConfig,
    defineConfig({
      test: {
        globals: true,
        environment: "jsdom",
        setupFiles: "./src/test/setup.ts",
        exclude: [
          "**/node_modules/**",
          "**/dist/**",
          "**/cypress/**",
          "**/e2e/**",
        ],
        css: true,
        reporters: [["verbose", { summary: true }]],
        coverage: {
          provider: "v8",
          reporter: ["text", "json", "html"],
          exclude: [
            "node_modules/",
            "src/test/",
            "*.config.ts",
            "*.config.js",
            "src/gql/",
            "src/vite-env.d.ts",
            "vite-plugins/",
          ],
        },
      },
    }),
  ),
);
