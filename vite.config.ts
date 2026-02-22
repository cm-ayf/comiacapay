import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import { VitePWA, type VitePWAOptions } from "vite-plugin-pwa";
// import vercelCustomEntrypoint from "./plugins/vercel-custom-entrypoint";

const vitePwaOptions: Partial<VitePWAOptions> = {
  workbox: {
    runtimeCaching: [
      {
        urlPattern: ({ url }) =>
          /^\/\d+\/\d+\/register\.data$/.test(url.pathname),
        handler: "NetworkFirst",
        options: { networkTimeoutSeconds: 5 },
      },
      {
        urlPattern: ({ url }) =>
          /^\/\d+\/\d+\/register\.data$/.test(url.pathname),
        // FIXME: not good to expect body-keyed idempotency with POST request
        method: "POST",
        handler: "NetworkOnly",
        options: {
          backgroundSync: { name: "register" },
        },
      },
    ],
    navigateFallback: null,
  },
  manifest: {
    lang: "ja",
    theme_color: "#1976d2",
    background_color: "#1976d2",
    name: "Comiacapay",
    short_name: "Comiacapay",
  },
  registerType: "autoUpdate",
  devOptions: {
    enabled: true,
    suppressWarnings: true,
  },
  outDir: "build/client",
};

export default defineConfig({
  plugins: [
    reactRouter(),
    VitePWA(vitePwaOptions),
    // vercelCustomEntrypoint({ main: "./main.ts" }),
  ],
  resolve: {
    tsconfigPaths: true,
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify(process.env["NODE_ENV"]),
  },
});
