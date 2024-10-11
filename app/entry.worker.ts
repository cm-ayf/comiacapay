/// <reference lib="WebWorker" types="serviceworker" />

export {};

self.addEventListener<"install">("install", (event) => {
  console.log("Service worker installed");

  event.waitUntil(self.skipWaiting());
});

self.addEventListener<"activate">("activate", (event) => {
  console.log("Service worker activated");

  event.waitUntil(self.clients.claim());
});
