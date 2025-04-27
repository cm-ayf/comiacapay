import path from "path";
import type { Plugin } from "vite";

export default function bundleRootChunks({
  root = "app/root.tsx",
} = {}): Plugin {
  const chunks = new Set<string>();

  return {
    name: "comiacapay:bundle-root-chunks",
    config() {
      return {
        build: {
          rollupOptions: {
            output: {
              manualChunks(id, { getModuleInfo }) {
                const moduleInfo = getModuleInfo(id)!;
                if (chunks.has(moduleInfo.id)) {
                  for (const resolvedId of moduleInfo.importedIdResolutions)
                    chunks.add(resolvedId.id);
                  for (const resolvedId of moduleInfo.dynamicallyImportedIdResolutions)
                    chunks.add(resolvedId.id);
                  return "root";
                } else return;
              },
            },
          },
        },
      };
    },
    configResolved(config) {
      chunks.add(path.join(config.root, root));
    },
  };
}
