import type { NextConfig } from "next";

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  buildExcludes: [/middleware-manifest\.json$/],
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: "NetworkFirst",
      options: {
        cacheName: "offlineCache",
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 30 * 24 * 60 * 60,
        },
      },
    },
  ],
});

const nextConfig: NextConfig = {
  // 生产环境禁用 ESLint，加快构建速度
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 禁用类型检查错误
  typescript: {
    ignoreBuildErrors: true,
  },
  // 配置输出
  output: 'standalone',
  // 禁用 telemetry
  telemetry: false,
};

export default withPWA(nextConfig);
