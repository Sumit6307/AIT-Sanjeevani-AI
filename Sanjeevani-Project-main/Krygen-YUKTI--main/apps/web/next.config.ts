import { env } from "@my-better-t-app/env/web";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  reactCompiler: true,
  async rewrites() {
    const serverUrl = env.NEXT_PUBLIC_SERVER_URL;
    return [
      {
        source: "/api/auth/:path*",
        destination: `${serverUrl}/api/auth/:path*`,
      },
      {
        source: "/api/mvp/:path*",
        destination: `${serverUrl}/api/mvp/:path*`,
      },
    ];
  },
};

export default nextConfig;
