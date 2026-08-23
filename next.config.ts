import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/palworld/config-generator",
        destination: "/config-generator/palworld",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
