declare global {
  const __VITE_SW_MANIFEST__: string[] | undefined;
}

// This will be replaced by Vite at build time
const manifest = __VITE_SW_MANIFEST__ ?? [];

export const setupCache = (self: ServiceWorkerGlobalScope) => {
  const CACHE_NAME = "jplaw-epub-v1";

  // This will be replaced by Vite at build time with actual asset URLs
  // In development, use a default list
  const urlsToCache: readonly string[] =
    manifest.length > 0
      ? manifest
      : [
          "/",
          "/help/",
          "/favicon.svg",
          "/favicon-32x32.png",
          "/apple-touch-icon.png",
        ];

  const addCache = async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(urlsToCache);
  };

  const responseIfCached = async (request: Request) => {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match(request);
    if (response) {
      return response;
    }
    return fetch(request);
  };

  const purgeCaches = async () => {
    const cacheWhitelist: readonly string[] = [CACHE_NAME];
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(async (cacheName: string) => {
        if (!cacheWhitelist.includes(cacheName)) {
          await caches.delete(cacheName);
        }
      }),
    );
  };

  // Handle EPUB downloads with progress reporting
  const downloadEpub = async (
    url: string,
    sessionId: string,
    sourceClient: Client,
  ) => {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      const contentLength = response.headers.get("content-length");
      const total = contentLength ? parseInt(contentLength, 10) : 0;
      const reader = response.body?.getReader();

      if (!reader) {
        throw new Error("Failed to read response body");
      }

      const chunks: Uint8Array[] = [];
      let received = 0;
      let lastUpdateTime = 0;
      const UPDATE_INTERVAL = 100; // Update every 100ms

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        chunks.push(value);
        received += value.length;

        if (total > 0) {
          const now = Date.now();
          // Send progress updates at intervals
          if (now - lastUpdateTime > UPDATE_INTERVAL) {
            const progress = (received / total) * 100;
            sourceClient.postMessage({
              type: "download-progress",
              sessionId,
              progress,
              received,
              total,
            });
            lastUpdateTime = now;
          }
        }
      }

      // Final progress update
      if (total > 0) {
        sourceClient.postMessage({
          type: "download-progress",
          sessionId,
          progress: 100,
          received,
          total,
        });
      }

      // Combine chunks into a single blob
      const blob = new Blob(chunks as BlobPart[], {
        type: "application/epub+zip",
      });

      // Convert blob to base64 for transfer
      const fileReader = new FileReader();
      fileReader.onloadend = () => {
        sourceClient.postMessage({
          type: "download-complete",
          sessionId,
          data: fileReader.result,
          mimeType: "application/epub+zip",
        });
      };
      fileReader.readAsDataURL(blob);
    } catch (error) {
      // Send error message
      sourceClient.postMessage({
        type: "download-error",
        sessionId,
        error: error instanceof Error ? error.message : "Download failed",
      });
    }
  };

  // Install event - cache resources
  self.addEventListener("install", (event: ExtendableEvent) => {
    // Skip waiting to activate immediately
    self.skipWaiting();
    event.waitUntil(addCache());
  });

  // Fetch event - serve from cache when available
  self.addEventListener("fetch", (event: FetchEvent) => {
    event.respondWith(responseIfCached(event.request));
  });

  // Activate event - clean up old caches and claim clients
  self.addEventListener("activate", (event: ExtendableEvent) => {
    event.waitUntil(
      Promise.all([
        purgeCaches(),
        // Take control of all clients immediately
        self.clients.claim(),
      ]),
    );
  });

  // Message event - handle download requests
  self.addEventListener("message", (event: ExtendableMessageEvent) => {
    if (event.data.type === "download-epub") {
      const { url, clientId: sessionId } = event.data;

      // Wrap the async operation immediately in waitUntil
      event.waitUntil(
        (async () => {
          // Get the client that sent the message
          if (event.source && "id" in event.source) {
            const client = await self.clients.get(event.source.id);
            if (client) {
              await downloadEpub(url, sessionId, client);
            }
          }
        })(),
      );
    }
  });
};
