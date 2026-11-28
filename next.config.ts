import type { NextConfig } from "next";

const appHost = new URL(process.env.BETTER_AUTH_URL ?? "http://localhost:3000").hostname;

const nextConfig: NextConfig = {
  allowedDevOrigins: [appHost],
  devIndicators: { position: "bottom-right" },
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
