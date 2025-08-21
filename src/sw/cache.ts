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
      })
    );
  };

  // Install event - cache resources
  self.addEventListener("install", (event: ExtendableEvent) => {
    event.waitUntil(addCache());
  });

  // Fetch event - serve from cache when available
  self.addEventListener("fetch", (event: FetchEvent) => {
    event.respondWith(responseIfCached(event.request));
  });

  // Activate event - clean up old caches
  self.addEventListener("activate", (event: ExtendableEvent) => {
    event.waitUntil(purgeCaches());
  });
};
