import { createTheme } from "@mui/material";
import { pigment } from "@pigment-css/vite-plugin";
import { remixPWA } from "@remix-pwa/dev";
import { vitePlugin as remix } from "@remix-run/dev";
import { vercelPreset } from "@vercel/remix/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    pigment({
      theme: createTheme(),
      transformLibraries: ["@mui/material"],
    }),
    remix({
      presets: [vercelPreset()],
    }),
    tsconfigPaths(),
    remixPWA(),
  ],
  ssr: {
    target: "webworker",
    noExternal: ["@mui/material", "@mui/utils", "@mui/material-pigment-css"],
  },
});
