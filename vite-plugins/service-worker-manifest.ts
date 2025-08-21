import type { Plugin } from "vite";

export function serviceWorkerManifestPlugin(): Plugin {
  return {
    name: "service-worker-manifest",
    enforce: 'post',
    
    generateBundle(_options, bundle) {
      // Collect all generated assets
      const staticAssets = [
        "/",
        "/help/",
        "/favicon.svg", 
        "/favicon-32x32.png",
        "/apple-touch-icon.png",
      ];

      // Find main JS bundle
      for (const [fileName] of Object.entries(bundle)) {
        if (fileName.startsWith("assets/main-") && fileName.endsWith(".js")) {
          staticAssets.push(`/${fileName}`);
        }
      }

      // Find and modify the service worker bundle
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (fileName === "sw.js" && chunk.type === "chunk") {
          // Replace __VITE_SW_MANIFEST__ with actual assets array
          // Handle both minified and non-minified versions
          chunk.code = chunk.code.replace(
            /__VITE_SW_MANIFEST__/g,
            JSON.stringify(staticAssets)
          );
        }
      }
    }
  };
}