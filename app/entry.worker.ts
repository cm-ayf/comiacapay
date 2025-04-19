/// <reference lib="WebWorker" types="serviceworker" types="@remix-pwa/worker-runtime" />
import { EnhancedCache } from "@remix-pwa/sw/enhanced-cache";
import type { DefaultFetchHandlerArgs } from "@remix-pwa/sw/types";

declare const self: ServiceWorkerGlobalScope;

const registerDataCache = new EnhancedCache("registerDataCache", {
  strategy: "NetworkFirst",
  strategyOptions: { networkTimeoutInSeconds: 5 },
});
const assetCache = new EnhancedCache("assetCache", {
  strategy: "CacheFirst",
  strategyOptions: {},
});
const manifestCache = new EnhancedCache("manifestCache", {
  strategy: "NetworkFirst",
  strategyOptions: { networkTimeoutInSeconds: 5 },
});

export async function defaultFetchHandler({
  request,
  context,
}: DefaultFetchHandlerArgs) {
  if (request.method !== "GET") return context.fetchFromServer();

  const { pathname } = new URL(request.url);

  if (pathname.endsWith("/register.data")) {
    return registerDataCache.handleRequest(request);
  }

  if (process.env["NODE_ENV"] === "production") {
    if (pathname.startsWith("/assets/")) {
      return assetCache.handleRequest(request);
    }

    if (pathname === "/__manifest") {
      return manifestCache.handleRequest(request);
    }
  }

  return context.fetchFromServer();
}

self.addEventListener<"install">("install", (event) => {
  console.log("Service worker installed");

  event.waitUntil(assetCache.preCacheUrls(self.__workerManifest.assets));
});

self.addEventListener<"activate">("activate", (event) => {
  console.log("Service worker activated");

  event.waitUntil(self.clients.claim());
});
