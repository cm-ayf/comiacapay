import type { Config } from "@react-router/dev/config";
import { vercelPreset } from "@vercel/react-router/vite";

declare module "react-router" {
  interface Future {
    unstable_middleware: true; // 👈 Enable middleware types
  }
}

export default {
  ssr: true,
  presets: [vercelPreset()],
  future: {
    unstable_middleware: true,
  },
} satisfies Config;
