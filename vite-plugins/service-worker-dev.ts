import { resolve } from "path";
import { build } from "esbuild";
import type { Plugin } from "vite";

export function serviceWorkerDevPlugin(): Plugin {
  return {
    name: "service-worker-dev",
    apply: "serve", // Only apply in dev server
    
    configureServer(server) {
      // Handle /sw.js requests in development
      server.middlewares.use(async (req, res, next) => {
        if (req.url === "/sw.js") {
          try {
            // Build the service worker on the fly
            const result = await build({
              entryPoints: [resolve(process.cwd(), "src/sw/index.ts")],
              bundle: true,
              write: false,
              format: "esm",
              define: {
                "__VITE_SW_MANIFEST__": JSON.stringify([
                  "/",
                  "/help/",
                  "/favicon.svg",
                  "/favicon-32x32.png",
                  "/apple-touch-icon.png",
                ])
              }
            });

            const code = result.outputFiles[0].text;
            
            res.setHeader("Content-Type", "application/javascript");
            res.setHeader("Cache-Control", "no-cache");
            res.end(code);
          } catch (error) {
            console.error("Failed to build service worker:", error);
            res.statusCode = 500;
            res.end("Failed to build service worker");
          }
        } else {
          next();
        }
      });
    }
  };
}