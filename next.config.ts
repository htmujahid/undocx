import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "lh3.googleusercontent.com" }],
  },
  async redirects() {
    return [
      { source: "/library", destination: "/library/profiles", permanent: false },
    ];
  },
};

export default nextConfig;
