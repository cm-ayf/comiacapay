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
      const response = await manifestCache.handleRequest(request);
      if (response.ok) preCacheFromManifest(response.clone()).catch(() => {});
      return response;
    }
  }

  return context.fetchFromServer();
}

interface ManifestRoute {
  imports: string[];
  css: string[];
}
interface Manifest {
  [routeId: string]: ManifestRoute;
}

async function preCacheFromManifest(response: Response) {
  const manifest: Manifest = await response.json();
  const assets = new Set<string>();
  for (const route of Object.values(manifest)) {
    for (const asset of route?.imports) assets.add(asset);
    for (const asset of route?.css) assets.add(asset);
  }
  await assetCache.preCacheUrls(Array.from(assets));
}

self.addEventListener<"install">("install", (event) => {
  console.log("Service worker installed");

  event.waitUntil(self.skipWaiting());
});

self.addEventListener<"activate">("activate", (event) => {
  console.log("Service worker activated");

  event.waitUntil(self.clients.claim());
});
