import { createClient, type SanityClient } from "@sanity/client";
import { config as loadDotenv } from "dotenv";
import { join } from "path";
import { fileURLToPath } from "url";

const monorepoRoot = fileURLToPath(new URL("../../../../", import.meta.url));
const webRoot = fileURLToPath(new URL("../../../", import.meta.url));

let dotenvLoaded = false;

/** Load repo `.env` files once (local dev / scripts). Netlify injects env at build/runtime. */
function loadEnvFiles(): void {
  if (dotenvLoaded) return;
  dotenvLoaded = true;
  loadDotenv({ path: join(webRoot, ".env") });
  loadDotenv({ path: join(monorepoRoot, ".env") });
}

export function resolveSanityEnv(): { projectId: string; dataset: string; apiVersion: string } {
  loadEnvFiles();
  const projectId =
    import.meta.env.PUBLIC_SANITY_PROJECT_ID ||
    process.env.PUBLIC_SANITY_PROJECT_ID ||
    process.env.SANITY_PROJECT_ID ||
    "";
  const dataset =
    import.meta.env.PUBLIC_SANITY_DATASET ||
    process.env.PUBLIC_SANITY_DATASET ||
    process.env.SANITY_DATASET ||
    "";
  const apiVersion =
    import.meta.env.PUBLIC_SANITY_API_VERSION ||
    process.env.PUBLIC_SANITY_API_VERSION ||
    process.env.SANITY_API_VERSION ||
    "2024-01-01";
  return { projectId, dataset, apiVersion };
}

let client: SanityClient | null = null;

export function getSanityClient(): SanityClient {
  if (!client) {
    const { projectId, dataset, apiVersion } = resolveSanityEnv();
    if (!projectId || !dataset) {
      throw new Error("Missing PUBLIC_SANITY_PROJECT_ID or PUBLIC_SANITY_DATASET (or SANITY_* in root .env)");
    }
    // In dev, disable CDN so newly published documents show up immediately (CDN is eventually consistent).
    client = createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: import.meta.env.PROD,
    });
  }
  return client;
}
