import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  // The design handoff writes these addresses without the hyphen.
  async redirects() {
    return [
      { source: "/signup", destination: "/sign-up", permanent: false },
      { source: "/login", destination: "/log-in", permanent: false },
    ];
  },
  partialPrefetching: true,
  // Use the same Tailwind transform when local verification needs webpack.
  webpack(config) {
    config.module.rules.push({
      test: /globals\.css$/,
      enforce: "pre",
      use: ["@tailwindcss/turbopack"],
    });
    return config;
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
