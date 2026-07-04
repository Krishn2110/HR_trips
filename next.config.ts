import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  //output: "export", // Enables static export
  images: {
    unoptimized: true, // Disables the Node.js image optimization requirement
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
    ],
  },
};

export default nextConfig;