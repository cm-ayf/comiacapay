import { createTheme } from "@mui/material/styles";
import { pigment } from "@pigment-css/vite-plugin";
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import tsconfigPaths from "vite-tsconfig-paths";
import bundleRootChunks from "./plugins/bundle-root-chunks";
import surpressNodeModulesWarning from "./plugins/surpress-node-modules-warning";

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
