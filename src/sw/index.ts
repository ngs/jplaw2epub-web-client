/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;

import { setupCache } from "./cache";
import { setupEpubDownload } from "./download";

setupCache(self);
setupEpubDownload(self);

export {};
