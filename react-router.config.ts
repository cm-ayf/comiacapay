import type { Config } from "@react-router/dev/config";
import { vercelPreset } from "@vercel/react-router/vite";

export default {
  ssr: true,
  presets: [vercelPreset()],
  routeDiscovery: { mode: "initial" },
  subResourceIntegrity: true,
  future: {
    unstable_optimizeDeps: true,
  },
} satisfies Config;
