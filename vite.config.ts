import { createTheme } from "@mui/material/styles";
import { pigment } from "@pigment-css/vite-plugin";
import { reactRouter } from "@react-router/dev/vite";
import { reactRouterPWA } from "@remix-pwa/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import bundleRootChunks from "./plugins/bundle-root-chunks";
import surpressNodeModulesWarning from "./plugins/surpress-node-modules-warning";

export default defineConfig({
  plugins: [
    pigment({
      theme: createTheme(),
      // TODO: get rid of emotion from @mui/lab and transform
      transformLibraries: ["@mui/material", "@mui/x-data-grid"],
      displayName: process.env["NODE_ENV"] !== "production",
    }),
    reactRouter(),
    tsconfigPaths(),
    reactRouterPWA(),
    surpressNodeModulesWarning(),
    bundleRootChunks(),
  ],
  resolve: {
    alias: {
      "@mui/x-internals": "@mui/x-internals/esm",
    },
  },
  ssr: {
    noExternal: [/^@mui\//, "@pigment-css/react", "@remix-run/react"],
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify(process.env["NODE_ENV"]),
  },
});
