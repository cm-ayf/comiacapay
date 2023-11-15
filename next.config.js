// @ts-check
const { default: nextPWA } = require("@ducanh2912/next-pwa");

module.exports = nextPWA({
  dest: "public",
  disable: process.env.NODE_ENV !== "production",
  cacheOnFrontEndNav: true,
  extendDefaultRuntimeCaching: true,
  workboxOptions: {
    runtimeCaching: [{ urlPattern: "/graphql", handler: "NetworkOnly" }],
  },
})({
  experimental: {
    ppr: true,
  },
  reactStrictMode: true,
  webpack(config) {
    config.module.rules.push({
      test: /\.graphql$/,
      loader: "@nitrogql/graphql-loader",
      options: {
        configFile: "./graphql.config.yaml",
      },
    });

    return config;
  },
});
