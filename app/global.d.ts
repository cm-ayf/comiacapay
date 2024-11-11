import type { SxProp } from "@pigment-css/react";

declare module "react" {
  interface Attributes {
    sx?: SxProp | undefined;
  }
}
