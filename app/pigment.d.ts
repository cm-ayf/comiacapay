import type { Theme } from "@mui/material/styles";
import "@mui/material-pigment-css";

declare module "@mui/material-pigment-css" {
  interface ThemeArgs {
    theme: Theme;
  }
}
