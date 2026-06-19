import path from "node:path";
import { fileURLToPath } from "node:url";

const frontendRoot = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(frontendRoot, "../../..");

/** @type {import("next").NextConfig} */
const nextConfig = {
  turbopack: {
    root: frontendRoot,
  },
  outputFileTracingRoot: repoRoot,
};

export default nextConfig;
