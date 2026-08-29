import type { NextConfig } from "next";
import "./src/env";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  reactCompiler: true,
};

export default nextConfig;
