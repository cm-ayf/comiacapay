/// <reference lib="WebWorker" types="serviceworker" />
import { CacheFirst, NetworkFirst } from "@remix-pwa/sw/cache";
import type { DefaultFetchHandlerArgs } from "@remix-pwa/sw/types";
import "@remix-pwa/worker-runtime";

const registerDataCache = new NetworkFirst("registerDataCache", {
  networkTimeoutInSeconds: 5,
});
const assetCache = new CacheFirst("assetCache");
const manifestCache = new CacheFirst("manifestCache");

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

  event.waitUntil(self.skipWaiting());
});

self.addEventListener<"activate">("activate", (event) => {
  console.log("Service worker activated");

  event.waitUntil(self.clients.claim());
});
