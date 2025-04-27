import rules from "./rules/index.js";
/** @import { Linter } from "eslint" */

/** @type {Linter.Config} */
const muiPigmentCss = {
  plugins: {
    "mui-pigment-css": { rules },
  },
  rules: {
    "mui-pigment-css/mui-pigment-css": "error",
  },
};

export default muiPigmentCss;
