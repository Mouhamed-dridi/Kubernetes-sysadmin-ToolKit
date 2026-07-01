import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/home", destination: "/" },
      { source: "/iteme", destination: "/mypage" },
    ];
  },
};

export default nextConfig;
