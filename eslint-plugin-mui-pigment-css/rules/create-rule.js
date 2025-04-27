// @ts-check

import { ESLintUtils } from "@typescript-eslint/utils";

export const createRule = ESLintUtils.RuleCreator(
  (rule) =>
    `https://github.com/cm-ayf/comiacapay/blob/main/eslint-plugin-mui-pigment-css/rules/${rule}.md`,
);
