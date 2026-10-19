import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  sassOptions: {
    includePaths: [path.resolve(process.cwd(), "styles")],
    additionalData: `
      @use "mixins" as *;
    `,
  },
};

export default nextConfig;
