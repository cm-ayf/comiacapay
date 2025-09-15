// @ts-check
/* eslint-disable import-x/no-named-as-default,import-x/no-named-as-default-member */

import prettier from "eslint-config-prettier";
import importX from "eslint-plugin-import-x";
import jsxA11y from "eslint-plugin-jsx-a11y";
import muiPathImports from "eslint-plugin-mui-path-imports";
import react from "eslint-plugin-react";
import * as reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";
import muiPigmentCss from "./eslint-plugin-mui-pigment-css/index.js";

export default tseslint.config(
  {
    languageOptions: {
      globals: globals["shared-node-browser"],
    },
  },
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  prettier,
  importX.flatConfigs.typescript,
  importX.flatConfigs.react,
  importX.flatConfigs.recommended,
  {
    settings: {
      "import-x/internal-regex": "^~/",
      "import-x/resolver": {
        node: {
          extensions: [".ts", ".tsx"],
        },
        typescript: {
          alwaysTryTypes: true,
        },
      },
    },
    rules: {
      "import-x/no-unresolved": ["error", { ignore: ["virtual:*"] }],
      "import-x/order": [
        "error",
        { alphabetize: { order: "asc" }, "newlines-between": "never" },
      ],
      "import-x/no-restricted-paths": [
        "error",
        {
          zones: [
            {
              from: ["./app/!(lib|generated)/**/*", "./app/*"],
              target: "./app/lib/**/*",
            },
            {
              from: ["./app/routes/**/*", "./app/*"],
              target: "./app/components/**/*",
            },
          ],
        },
      ],
    },
  },
  jsxA11y.flatConfigs.recommended,
  react.configs.flat.recommended,
  {
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
    rules: {
      "react/no-unknown-property": ["error", { ignore: ["sx"] }],
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
      "**/generated/**",
      "build/**",
      ".react-router/**",
      "public/entry.worker.js",
    ],
  },
);
