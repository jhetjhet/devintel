import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: "standalone", // Enable standalone output for better performance and smaller image size
};

export default nextConfig;
