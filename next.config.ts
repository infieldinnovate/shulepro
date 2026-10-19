import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  sassOptions: {
    includePaths: [path.resolve(process.cwd(), "styles")],
    additionalData: `
      @use "tokens" as *;
      @use "mixins" as *;
      @use "breakpoints" as *;
    `,
  },
};

export default nextConfig;
