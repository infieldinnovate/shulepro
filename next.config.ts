// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
// };

// export default nextConfig;

const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  sassOptions: {
    includePaths: [path.join(__dirname, "styles")],
    additionalData: `
      @use "abstracts/variables" as *;
      @use "abstracts/mixins" as *;
    `,
  },
};

module.exports = nextConfig;
