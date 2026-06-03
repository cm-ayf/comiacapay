import type { Config } from "@react-router/dev/config";
import { vercelPreset } from "@vercel/react-router/vite";

export default {
  ssr: true,
  presets: [vercelPreset()],
  routeDiscovery: { mode: "initial" },
  subResourceIntegrity: true,
  future: {
    v8_passThroughRequests: true,
    v8_middleware: true,
    v8_splitRouteModules: true,
    v8_trailingSlashAwareDataRequests: true,
    v8_viteEnvironmentApi: true,
    unstable_optimizeDeps: true,
  },
} satisfies Config;
