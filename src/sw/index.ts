/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;

import { setupCache } from "./cache";

setupCache(self);

export {};
