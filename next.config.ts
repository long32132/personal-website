import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "www.zhangjinglongai.com",
          },
        ],
        destination: "https://zhangjinglongai.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
