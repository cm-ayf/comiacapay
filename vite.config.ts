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
      transformLibraries: ["@mui/material", "@mui/icons-material", "@mui/lab"],
      displayName: process.env["NODE_ENV"] !== "production",
    }),
    reactRouter(),
    tsconfigPaths(),
    reactRouterPWA(),
    surpressNodeModulesWarning(),
    bundleRootChunks(),
  ],
  ssr: {
    noExternal: [/^@mui\/(?!x-)/, "@pigment-css/react"],
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify(process.env["NODE_ENV"]),
  },
});
