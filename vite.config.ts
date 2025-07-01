import { createTheme } from "@mui/material/styles";
import { pigment } from "@pigment-css/vite-plugin";
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import { VitePWA, type VitePWAOptions } from "vite-plugin-pwa";
import tsconfigPaths from "vite-tsconfig-paths";
import bundleRootChunks from "./plugins/bundle-root-chunks";
import surpressNodeModulesWarning from "./plugins/surpress-node-modules-warning";

const runtimeCaching = [
  {
    urlPattern: /\/\d+\/\d+\/register\.data/,
    handler: "NetworkFirst",
    options: { networkTimeoutSeconds: 5 },
  },
  {
    urlPattern: /\/assets\//,
    handler: "CacheFirst",
  },
  {
    urlPattern: "/__manifest",
    handler: "NetworkFirst",
    options: { networkTimeoutSeconds: 5 },
  },
] satisfies VitePWAOptions["workbox"]["runtimeCaching"];

export default defineConfig({
  plugins: [
    pigment({
      theme: createTheme(),
      transformLibraries: ["@mui/material", "@mui/icons-material"],
      displayName: process.env["NODE_ENV"] !== "production",
    }),
    reactRouter(),
    tsconfigPaths(),
    VitePWA({
      workbox: {
        runtimeCaching,
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
      },
    }),
    surpressNodeModulesWarning(),
    bundleRootChunks(),
  ],
  ssr: {
    noExternal: [/^@mui\/(?!x-|lab)/, "@pigment-css/react"],
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify(process.env["NODE_ENV"]),
  },
});
