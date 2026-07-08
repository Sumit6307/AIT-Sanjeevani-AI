import "@my-better-t-app/env/web";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination: "https://sanjeevani-backend1.onrender.com/api/auth/:path*",
      },
      {
        source: "/api/mvp/:path*",
        destination: "https://sanjeevani-backend1.onrender.com/api/mvp/:path*",
      },
    ];
  },
};

export default nextConfig;
