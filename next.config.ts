import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root so Next doesn't infer a parent dir from stray
  // lockfiles higher up the tree.
  turbopack: {
    root: path.resolve("."),
  },
};

export default nextConfig;
