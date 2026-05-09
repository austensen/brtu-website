import { createClient, type SanityClient } from "@sanity/client";
import { fileURLToPath } from "url";
import { loadEnv } from "vite";

const monorepoRoot = fileURLToPath(new URL("../../../../", import.meta.url));
const webRoot = fileURLToPath(new URL("../../../", import.meta.url));

export function resolveSanityEnv(): { projectId: string; dataset: string; apiVersion: string } {
  const fileEnv = {
    ...loadEnv("production", monorepoRoot, ""),
    ...loadEnv("development", monorepoRoot, ""),
    ...loadEnv("production", webRoot, ""),
    ...loadEnv("development", webRoot, ""),
  };
  const projectId =
    import.meta.env.PUBLIC_SANITY_PROJECT_ID ||
    fileEnv.PUBLIC_SANITY_PROJECT_ID ||
    fileEnv.SANITY_PROJECT_ID ||
    "";
  const dataset =
    import.meta.env.PUBLIC_SANITY_DATASET ||
    fileEnv.PUBLIC_SANITY_DATASET ||
    fileEnv.SANITY_DATASET ||
    "";
  const apiVersion =
    import.meta.env.PUBLIC_SANITY_API_VERSION ||
    fileEnv.PUBLIC_SANITY_API_VERSION ||
    fileEnv.SANITY_API_VERSION ||
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
    client = createClient({ projectId, dataset, apiVersion, useCdn: true });
  }
  return client;
}
