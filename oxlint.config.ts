import { defineConfig } from "oxlint";

export default defineConfig({
  plugins: ["unicorn", "typescript", "oxc", "import", "jsx-a11y", "react"],
  categories: {
    correctness: "error",
    perf: "warn",
    suspicious: "warn",
  },
  rules: {
    "react-in-jsx-scope": "off",
    "no-await-in-loop": "off",
    "no-map-spread": "off",
    "no-unassigned-import": "off",
    "no-named-export": "off",
    "no-unsafe-type-assertion": "off",
    "no-shadow": "off",
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
