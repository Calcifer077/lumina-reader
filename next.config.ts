import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  serverExternalPackages: ["pdf-parse", "pdfjs-dist", "epub2"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: process.env.SUPABASE_URL!,
        pathname: "/storage/v1/object/sign/books/**",
      },
    ],
  },
};

export default nextConfig;
