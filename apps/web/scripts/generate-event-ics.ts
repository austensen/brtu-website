import { createClient } from "@sanity/client";
import { config } from "dotenv";
import { mkdirSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { buildEventIcs } from "../src/lib/events/ics.ts";
import { allEventsForIcs } from "../src/lib/sanity/queries.ts";

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = join(here, "..");
config({ path: join(webRoot, ".env") });
config({ path: join(webRoot, "../..", ".env") });

const projectId =
  process.env.PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID;
const dataset = process.env.PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET;
const apiVersion = process.env.PUBLIC_SANITY_API_VERSION ?? "2024-01-01";
const siteUrl = process.env.PUBLIC_SITE_URL ?? "http://localhost:4321";

if (!projectId || !dataset) {
  console.warn("generate-event-ics: missing PUBLIC_SANITY_PROJECT_ID or PUBLIC_SANITY_DATASET — skipping");
  process.exit(0);
}

const client = createClient({ projectId, dataset, apiVersion, useCdn: true });

type EventRow = {
  locale: string;
  title: string;
  slug: string | null;
  startDateTime: string;
  endDateTime: string;
  timezone: string;
  location?: string | null;
  joinUrl?: string | null;
  description?: unknown;
};

const events = await client.fetch<EventRow[]>(allEventsForIcs);
const outRoot = join(webRoot, "public", "calendar");

for (const e of events) {
  if (!e.slug) continue;
  const dir = join(outRoot, e.locale);
  mkdirSync(dir, { recursive: true });
  const body = buildEventIcs({
    slug: e.slug,
    locale: e.locale,
    title: e.title,
    startDateTime: e.startDateTime,
    endDateTime: e.endDateTime,
    location: e.location,
    joinUrl: e.joinUrl,
    description: e.description,
    siteUrl,
  });
  writeFileSync(join(dir, `${e.slug}.ics`), body, "utf8");
}

console.log(`generate-event-ics: wrote ${events.filter((x) => x.slug).length} files under public/calendar/`);
