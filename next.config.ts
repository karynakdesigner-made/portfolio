import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this folder. Without it, Turbopack infers the
  // parent directory ("Claude Code") as the root and fails to resolve
  // tailwindcss from Portfolio/node_modules.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
