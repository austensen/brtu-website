import { dashboardTool } from "@sanity/dashboard";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { netlifyWidget } from "sanity-plugin-dashboard-widget-netlify";

import { editorChecklistAction } from "./actions/editorChecklistAction";
import { schemaTypes } from "./schemas";
import { structure } from "./structure";

const projectId = process.env.SANITY_PROJECT_ID || process.env.SANITY_STUDIO_PROJECT_ID || "";
const dataset = process.env.SANITY_DATASET || process.env.SANITY_STUDIO_DATASET || "";
const apiVersion = process.env.SANITY_API_VERSION || "2024-01-01";

const netlifySiteName = process.env.SANITY_STUDIO_NETLIFY_SITE_NAME || "";
const netlifySiteApiId = process.env.SANITY_STUDIO_NETLIFY_SITE_API_ID || "";
const netlifyBuildHookId = process.env.SANITY_STUDIO_NETLIFY_BUILD_HOOK_ID || "";
const publicSiteUrl = process.env.SANITY_STUDIO_PUBLIC_SITE_URL || "";

const netlifySitesConfigured =
  netlifySiteName && netlifySiteApiId && netlifyBuildHookId
    ? [
        {
          title: "Public website",
          name: netlifySiteName,
          apiId: netlifySiteApiId,
          buildHookId: netlifyBuildHookId,
          ...(publicSiteUrl ? { url: publicSiteUrl } : {}),
        },
      ]
    : [];

if (
  (netlifySiteName || netlifySiteApiId || netlifyBuildHookId) &&
  netlifySitesConfigured.length === 0
) {
  console.warn(
    "BRTU Studio: Netlify deploy widget disabled — set all of SANITY_STUDIO_NETLIFY_SITE_NAME, SANITY_STUDIO_NETLIFY_SITE_API_ID, and SANITY_STUDIO_NETLIFY_BUILD_HOOK_ID.",
  );
}

if (!projectId || !dataset) {
  throw new Error(
    "Sanity Studio configuration error: missing SANITY_PROJECT_ID/SANITY_DATASET (or SANITY_STUDIO_PROJECT_ID/SANITY_STUDIO_DATASET).",
  );
}

const plugins = [structureTool({ structure })];

if (netlifySitesConfigured.length > 0) {
  plugins.push(
    dashboardTool({
      widgets: [
        netlifyWidget({
          title: "Deploy public website",
          sites: netlifySitesConfigured,
        }),
      ],
    }),
  );
}

export default defineConfig({
  name: "default",
  title: "BRTU Studio",

  projectId,
  dataset,
  apiVersion,

  plugins,

  schema: {
    types: schemaTypes,
  },

  document: {
    actions: (prev) => [...prev, editorChecklistAction],
  },
});
