import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import netlify from "@astrojs/netlify";
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

// Astro 5 removed `output: "hybrid"`; static + per-route `prerender = false`
// is the documented replacement (see https://docs.astro.build/en/guides/on-demand-rendering/).
// The Netlify adapter handles on-demand rendering for routes that opt out of prerendering.
//
// `npm run dev` sets NETLIFY_DEV=1 so @netlify/vite-plugin skips its dev middleware; otherwise POST
// (login/logout forms, etc.) can hang indefinitely. `netlify dev` sets this env itself.
export default defineConfig({
  output: "static",
  site,
  adapter: netlify(),
  integrations: [react()],
});
