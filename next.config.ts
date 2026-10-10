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
