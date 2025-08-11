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
              advancedChunks: {
                groups: [
                  {
                    name(moduleId, ctx) {
                      const moduleInfo = ctx.getModuleInfo(moduleId)!;
                      if (chunks.has(moduleId)) {
                        for (const importedId of moduleInfo.importedIds)
                          chunks.add(importedId);
                        for (const importedId of moduleInfo.dynamicallyImportedIds)
                          chunks.add(importedId);
                        return "root";
                      } else return null;
                    },
                  },
                ],
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
