import type { Config } from "@react-router/dev/config";
import { vercelPreset } from "@vercel/react-router/vite";

export default {
  ssr: true,
  presets: [vercelPreset()],
  routeDiscovery: { mode: "initial" },
  future: {
    v8_middleware: true,
    v8_viteEnvironmentApi: true,
    unstable_optimizeDeps: true,
    unstable_subResourceIntegrity: true,
  },
} satisfies Config;
