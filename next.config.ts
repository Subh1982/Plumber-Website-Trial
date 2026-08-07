import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/chat": ["./data/plumber-knowledge.md"],
    "/api/photo-assessment": ["./data/plumber-knowledge.md"],
  },
};

export default nextConfig;
