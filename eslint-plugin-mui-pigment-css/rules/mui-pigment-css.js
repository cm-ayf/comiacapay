// @ts-check

import { defineRule } from "@oxlint/plugins";
import assert from "node:assert";

const pattern =
  /^@mui\/material\/(Box|Container|Grid|Hidden|RtlProvider|Stack)$/;

export default defineRule({
  meta: {
    docs: {
      description:
        "Enforce importing components from `@mui/material-pigment-css`",
    },
    messages: {
      default:
        'Component `{{ component }}` should be imported from `"@mui/material-pigment-css/{{ component }}"`',
    },
    schema: [],
    type: "problem",
    fixable: "code",
  },
  createOnce(context) {
    return {
      [`ImportDeclaration[source.value=${pattern}]`](node) {
        assert(node.type === "ImportDeclaration");
        const component = node.source.value.replace(pattern, "$1");
        context.report({
          node,
          messageId: "default",
          data: { component },
          fix(fixer) {
            return fixer.replaceText(
              node.source,
              `"@mui/material-pigment-css/${component}"`,
            );
          },
        });
      },
    };
  },
});
