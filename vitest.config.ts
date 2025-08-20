import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./src/test/setup.ts",
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
  })
);
