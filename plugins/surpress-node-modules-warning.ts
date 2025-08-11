import type { Plugin } from "vite";

export default function surpressNodeModulesWarning(): Plugin {
  return {
    name: "comiacapay:surpress-node-modules-warning",
    config() {
      return {
        build: {
          rollupOptions: {
            onLog(level, log, defaultHandler) {
              if (log.id?.includes("/node_modules")) return;
              defaultHandler(level, log);
            },
          },
        },
      };
    },
  };
}
