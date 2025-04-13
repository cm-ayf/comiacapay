import type { SxProp } from "@pigment-css/react";

declare global {
  namespace React {
    interface Attributes {
      sx?: SxProp | null | undefined;
    }
  }
}
