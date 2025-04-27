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
      transformLibraries: [
        "@mui/material",
        "@mui/icons-material",
        "@mui/lab",
        "@mui/x-data-grid",
        "@mui/x-internals",
      ],
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
      "use-sync-external-store/shim": "react",
    },
  },
  ssr: {
    noExternal: [/^@mui\//, "@pigment-css/react"],
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify(process.env["NODE_ENV"]),
  },
});
