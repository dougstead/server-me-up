import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/palworld/config-generator",
        destination: "/config-generator/palworld",
        permanent: true,
      },
      {
        // Renamed when the site's old "Server Me Up" branding was cleaned
        // up (the filename itself carried the old name) -- redirect so
        // anyone who saved/bookmarked the old download link still works.
        source: "/downloads/server-me-up-hardware-scan.bat",
        destination: "/downloads/selfservr-hardware-scan.bat",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
