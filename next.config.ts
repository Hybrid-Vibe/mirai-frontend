import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // Proxy tất cả request bắt đầu bằng /proxy/api sang Backend HTTP
        source: "/proxy/api/:path*",
        destination: "http://mirai.runasp.net/api/:path*",
      },
    ];
  },
};

export default nextConfig;
