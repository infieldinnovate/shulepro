import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  sassOptions: {
    includePaths: [path.join(__dirname, "styles")],
    additionalData: `
      @use "abstracts/variables" as *;
      @use "abstracts/mixins" as *;
    `,
  },
};

export default nextConfig;
