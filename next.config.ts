import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // next-mdx-remote executes compiled MDX via `new Function`; transpiling it
  // avoids known Turbopack incompatibilities (see next-mdx-remote README).
  transpilePackages: ["next-mdx-remote"],
};

export default nextConfig;
