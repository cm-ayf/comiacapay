import fs from "node:fs/promises";
import path from "node:path";
import type { BuildManifest } from "@react-router/dev/config";
import { createRequestListener } from "@remix-run/node-fetch-server";
import type { Plugin } from "vite";

interface Options {
  main?: string;
}

export default function vercelCustomEntrypoint({
  main = "./main.ts",
}: Options): Plugin {
  return {
    name: "comiacapay:vite-preview-vercel",
    config: {
      order: "pre",
      handler() {
        return {
          environments: {
            ssr: {
              build: {
                rolldownOptions: {
                  input: { index: main },
                },
              },
            },
          },
        };
      },
    },
    async configurePreviewServer({ config, middlewares }) {
      const buildResultJson = await fs.readFile(
        path.resolve(config.root, ".vercel/react-router-build-result.json"),
        "utf-8",
      );
      const { buildManifest }: BuildResult = JSON.parse(buildResultJson);
      if (!buildManifest.serverBundles) return;

      const [serverBundle, ...rest] = Object.values(
        buildManifest.serverBundles,
      );
      if (
        !serverBundle ||
        !serverBundle.id.startsWith("nodejs_") ||
        rest.length > 0
      ) {
        throw new Error(
          "vercel-custom-entrypoint only supports single nodejs server bundle",
        );
      }

      const { default: handler } = await import(
        path.resolve(config.root, serverBundle.file)
      );

      return () => {
        middlewares.use(createRequestListener(handler));
      };
    },
  };
}

interface BuildResult {
  buildManifest: BuildManifest;
}
