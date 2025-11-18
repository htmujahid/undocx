import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  redirects: async () => {
    return [
      {
        source: "/",
        destination: "/editor",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
