/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SANITY_PROJECT_ID: string;
  readonly PUBLIC_SANITY_DATASET: string;
  readonly PUBLIC_SANITY_API_VERSION?: string;
  /** Production site origin for ICS URL / calendar links (no trailing slash). */
  readonly PUBLIC_SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
