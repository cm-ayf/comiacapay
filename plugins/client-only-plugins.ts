import type { Plugin, PluginOption } from "vite";

interface ClientOnlyPluginsOptions {
  filter: string[];
}

export function clientOnlyPlugins(options: ClientOnlyPluginsOptions): Plugin {
  function makePluginClientOnly(plugin: PluginOption) {
    if (typeof plugin !== "object" || !plugin) return;
    if (Array.isArray(plugin)) return plugin.forEach(makePluginClientOnly);
    if ("then" in plugin) return void plugin.then(makePluginClientOnly);
    if (!options.filter.includes(plugin.name)) return;
    Object.assign(plugin, { applyToEnvironment });
  }

  return {
    name: "comiacapay:client-only-plugins",
    config(config, _env) {
      makePluginClientOnly(config.plugins);
    },
  };
}

function applyToEnvironment(environment: { name: string }) {
  return environment.name === "client";
}
