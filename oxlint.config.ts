import { defineConfig } from "oxlint";
import * as muiPigmentCss from "eslint-plugin-mui-pigment-css";

export default defineConfig({
  plugins: [
    "unicorn",
    "typescript",
    "oxc",
    "import",
    "jsx-a11y",
    "react",
    "react-perf",
  ],
  extends: [muiPigmentCss.recommended],
  categories: {
    correctness: "error",
    perf: "warn",
    suspicious: "warn",
  },
  rules: {
    "react-in-jsx-scope": "off",
    "jsx-no-new-object-as-prop": "off",
    "jsx-no-new-function-as-prop": "off",
    "jsx-no-jsx-as-prop": "off",
    "no-await-in-loop": "off",
    "no-map-spread": "off",
    "no-unassigned-import": "off",
    "no-named-export": "off",
    "no-unsafe-type-assertion": "off",

    "mui-pigment-css/mui-pigment-css": "error",
  },
  settings: {
    "jsx-a11y": {
      polymorphicPropName: null,
      components: {},
      attributes: {},
    },
    react: {
      formComponents: ["Form"],
      linkComponents: [
        { name: "Link", attribute: "to" },
        { name: "NavLink", attribute: "to" },
      ],
      version: null,
    },
  },
  env: {
    builtin: true,
    "shared-node-browser": true,
  },
  ignorePatterns: [
    "**/generated/**",
    "dev-dist/**",
    "build/**",
    ".react-router/**",
    "playwright-report/**",
    "public/entry.worker.js",
    ".husky/install.js",
  ],
});
