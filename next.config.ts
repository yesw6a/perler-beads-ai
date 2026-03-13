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
  // 静态导出
  output: 'export',
  // 禁用 telemetry
  telemetry: false,
  // 禁用图像优化（静态导出需要）
  images: {
    unoptimized: true,
  },
};

export default withPWA(nextConfig);
