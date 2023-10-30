// @ts-check
const nextPWA = require("next-pwa");
const nextPWACache = /** @type {import('workbox-build').RuntimeCaching[]} */ (
  require("next-pwa/cache")
);

module.exports = nextPWA({
  dest: "public",
  disable: process.env.NODE_ENV !== "production",
  cacheOnFrontEndNav: true,
  runtimeCaching: [
    {
      urlPattern: "/api/users/me",
      method: "GET",
      handler: "NetworkOnly",
    },
    ...nextPWACache,
  ],
})({
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
