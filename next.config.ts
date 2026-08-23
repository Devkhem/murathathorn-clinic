import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Default is 1MB, too small for a full-resolution camera photo passed
      // directly to a server action (extractIdCardOcr). Photos are compressed
      // client-side before upload (see lib/image/compress.ts), so this is
      // headroom, not the primary size control.
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;
