/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SANITY_PROJECT_ID: string;
  readonly PUBLIC_SANITY_DATASET: string;
  readonly PUBLIC_SANITY_API_VERSION?: string;
  /** Production site origin for ICS URL / calendar links (no trailing slash). */
  readonly PUBLIC_SITE_URL?: string;
  /** Server-only (never `PUBLIC_*`). Session cookie HMAC secret. */
  readonly MEMBERS_SESSION_SECRET?: string;
  /** Server-only shared members password (plaintext compare on the server). */
  readonly MEMBERS_PASSWORD?: string;
  /** Server-only secret for `GET /api/members/bootstrap?t=…`. */
  readonly MEMBERS_MAGIC_LINK_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
