import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";

import { editorChecklistAction } from "./actions/editorChecklistAction";
import { schemaTypes } from "./schemas";
import { structure } from "./structure";

const projectId = process.env.SANITY_PROJECT_ID || process.env.SANITY_STUDIO_PROJECT_ID || "";
const dataset = process.env.SANITY_DATASET || process.env.SANITY_STUDIO_DATASET || "";
const apiVersion = process.env.SANITY_API_VERSION || "2024-01-01";

if (!projectId || !dataset) {
  throw new Error(
    "Sanity Studio configuration error: missing SANITY_PROJECT_ID/SANITY_DATASET (or SANITY_STUDIO_PROJECT_ID/SANITY_STUDIO_DATASET).",
  );
}

export default defineConfig({
  name: "default",
  title: "BRTU Studio",

  projectId,
  dataset,
  apiVersion,

  plugins: [structureTool({ structure })],

  schema: {
    types: schemaTypes,
  },

  document: {
    actions: (prev) => [...prev, editorChecklistAction],
  },
});
