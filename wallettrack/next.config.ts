import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Do not advertise the framework and version to anyone scanning for known
  // Next.js vulnerabilities. Security headers proper are set in src/proxy.ts,
  // which needs the per-request CSP nonce.
  poweredByHeader: false,

  // Trailing slashes and their non-slash counterparts are different URLs to
  // caches and to the proxy's route matching; pick one and redirect the other.
  trailingSlash: false,

  // Surfaces the origin of a slow response in production traces.
  logging: { fetches: { fullUrl: false } },

  serverExternalPackages: ["mongoose", "bcryptjs"],
};

export default nextConfig;
