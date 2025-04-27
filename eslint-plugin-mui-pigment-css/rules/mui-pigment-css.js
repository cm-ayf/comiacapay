// @ts-check

import { createRule } from "./create-rule.js";

const COMPONENTS = [
  "Box",
  "Container",
  "Grid",
  "Hidden",
  "RtlProvider",
  "Stack",
];

export const muiPigmentCss = createRule({
  name: "mui-pigment-css",
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
  defaultOptions: [],
  create(context) {
    return {
      ImportDeclaration(node) {
        const [, component] =
          node.source.value.match(/^@mui\/material\/(\w+)$/) ?? [];
        if (component && COMPONENTS.includes(component)) {
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
        }
      },
    };
  },
});
