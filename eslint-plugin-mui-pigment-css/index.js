import { definePlugin } from "@oxlint/plugins";
import { defineConfig } from "oxlint";
import muiPigmentCss from "./rules/mui-pigment-css.js";

export default definePlugin({
  meta: {
    name: "eslint-plugin-mui-pigment-css",
  },
  rules: {
    "mui-pigment-css": muiPigmentCss,
  },
});

export const recommended = defineConfig({
  jsPlugins: ["eslint-plugin-mui-pigment-css"],
  rules: {
    "mui-pigment-css/mui-pigment-css": "error",
  },
});
