// @ts-check

import prettier from "eslint-config-prettier";
import importX from "eslint-plugin-import-x";
import jsxA11y from "eslint-plugin-jsx-a11y";
import muiPathImports from "eslint-plugin-mui-path-imports";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";
import muiPigmentCss from "./eslint-plugin-mui-pigment-css/index.js";

export default tseslint.config(
  ...tseslint.configs.recommended,
  prettier,
  importX.flatConfigs.typescript,
  importX.flatConfigs.react,
  {
    ...importX.flatConfigs.recommended,
    settings: {
      "import-x/internal-regex": "^~/",
      "import/resolver": {
        node: {
          extensions: [".ts", ".tsx"],
        },
        typescript: {
          alwaysTryTypes: true,
        },
      },
    },
    rules: {
      "import-x/order": [
        "error",
        { alphabetize: { order: "asc" }, "newlines-between": "never" },
      ],
      "react/no-unknown-property": ["error", { ignore: ["sx"] }],
    },
  },
  jsxA11y.flatConfigs.recommended,
  {
    ...react.configs.flat.recommended,
    settings: {
      react: {
        version: "detect",
      },
      formComponents: ["Form"],
      linkComponents: [
        { name: "Link", linkAttribute: "to" },
        { name: "NavLink", linkAttribute: "to" },
      ],
    },
  },
  react.configs.flat["jsx-runtime"],
  {
    ignores: ["tests/**"],
    ...reactHooks.configs["recommended-latest"],
  },
  {
    plugins: {
      "mui-path-imports": muiPathImports,
    },
    rules: {
      "mui-path-imports/mui-path-imports": "error",
    },
  },
  muiPigmentCss,
  {
    ignores: [
      ".react-router/**",
      "build/**",
      "dev-dist/**",
      "playwright-report/**",
      "public/entry.worker.js",
    ],
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    files: ["app/entry.client.tsx"],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: ["app/entry.server.tsx"],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ["app/entry.worker.ts"],
    languageOptions: {
      globals: globals.serviceworker,
    },
  },
);
