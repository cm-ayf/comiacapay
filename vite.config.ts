import { createTheme } from "@mui/material/styles";
import { pigment } from "@pigment-css/vite-plugin";
import { remixPWA } from "@remix-pwa/dev";
import { vitePlugin as remix } from "@remix-run/dev";
import { vercelPreset } from "@vercel/remix/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import bundleRootChunks from "./plugins/bundle-root-chunks";
import surpressNodeModulesWarning from "./plugins/surpress-node-modules-warning";

export default defineConfig({
  plugins: [
    pigment({
      theme: createTheme(),
      transformLibraries: ["@mui/material", "@mui/lab"],
    }),
    remix({
      presets: [vercelPreset()],
    }),
    tsconfigPaths(),
    remixPWA(),
    surpressNodeModulesWarning(),
    bundleRootChunks(),
  ],
  ssr: {
    noExternal: [/^@mui\//, "@pigment-css/react", "@remix-run/react"],
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
  },
});
