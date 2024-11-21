import type { Plugin } from "vite";

export default function surpressNodeModulesWarning(): Plugin {
  return {
    name: "comiacapay:surpress-node-modules-warning",
    config() {
      return {
        build: {
          rollupOptions: {
            onwarn(warning, defaultHandler) {
              if (warning.id?.includes("/node_modules")) return;
              defaultHandler(warning);
            },
          },
        },
      };
    },
  };
}
