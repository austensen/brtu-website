import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { loadEnv } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));
const monorepoRoot = resolve(__dirname, "../..");

const mode = process.env.NODE_ENV === "production" ? "production" : "development";
const rootEnv = loadEnv(mode, monorepoRoot, "");
const appEnv = loadEnv(mode, __dirname, "");
const site =
  appEnv.PUBLIC_SITE_URL ||
  rootEnv.PUBLIC_SITE_URL ||
  process.env.PUBLIC_SITE_URL ||
  "http://localhost:4321";

export default defineConfig({
  output: "static",
  site,
  integrations: [react()],
});
