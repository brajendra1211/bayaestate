import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // User-uploaded images are already resized/compressed to webp at upload
    // time (see src/lib/upload.ts). Next's own optimizer additionally fails
    // to see files added to /public after the last build, so it's disabled
    // rather than relied on for these locally-hosted assets.
    unoptimized: true,
  },
  experimental: {
    // Some shared-hosting environments (CloudLinux LVE process/thread caps)
    // reject spawning the normal number of build worker processes. Set
    // NEXT_BUILD_WORKERS=1 in the build env on those hosts to keep static
    // page-data collection single-threaded; unset elsewhere for full speed.
    cpus: process.env.NEXT_BUILD_WORKERS ? Number(process.env.NEXT_BUILD_WORKERS) : undefined,
  },
};

export default nextConfig;
