import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/admin",
        destination: "/secret-admin",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;

