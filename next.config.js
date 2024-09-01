// @ts-check
const { default: nextPWA } = require("@ducanh2912/next-pwa");
/**
 * @import { RouteMatchCallbackOptions } from "workbox-core";
 */

/**
 * @param {RouteMatchCallbackOptions} options
 */
function getGraphQLOperationName({ url }) {
  if (url.pathname !== "/graphql") return null;
  return url.searchParams.get("operationName");
}

/**
 * @param {RouteMatchCallbackOptions} options
 */
function isGraphqlGetCurrentUser(options) {
  return getGraphQLOperationName(options) === "GetCurrentUser";
}

/**
 * @param {RouteMatchCallbackOptions} options
 */
function isGraphqlGet(options) {
  return !!getGraphQLOperationName(options) && options.request.method === "GET";
}

module.exports = nextPWA({
  dest: "public",
  disable: process.env.NODE_ENV !== "production",
  cacheOnFrontEndNav: true,
  extendDefaultRuntimeCaching: true,
  workboxOptions: {
    runtimeCaching: [
      { urlPattern: isGraphqlGetCurrentUser, handler: "NetworkOnly" },
      { urlPattern: isGraphqlGet, handler: "NetworkFirst" },
    ],
  },
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
