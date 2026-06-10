import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.uploadthing.com" },
      { protocol: "https", hostname: "**.ufs.sh" },
      { protocol: "https", hostname: "img.clerk.com" },
      { protocol: "https", hostname: "**.amazonaws.com" },
    ],
  },
  serverExternalPackages: ["fluent-ffmpeg", "@ffmpeg/ffmpeg"],
  turbopack: {},
};

export default nextConfig;
