import { defineConfig } from "astro/config";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { loadEnv } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));
const monorepoRoot = resolve(__dirname, "../..");

export default defineConfig(({ mode }) => {
  const rootEnv = loadEnv(mode, monorepoRoot, "");
  const appEnv = loadEnv(mode, __dirname, "");
  const site =
    appEnv.PUBLIC_SITE_URL ||
    rootEnv.PUBLIC_SITE_URL ||
    process.env.PUBLIC_SITE_URL ||
    "http://localhost:4321";

  return {
    output: "static",
    site,
  };
});
