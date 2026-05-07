import { defineConfig } from "sanity";

import { schemaTypes } from "./schemas";

const projectId = process.env.SANITY_PROJECT_ID || "";
const dataset = process.env.SANITY_DATASET || "";

export default defineConfig({
  name: "default",
  title: "BRTU Studio",

  projectId,
  dataset,

  schema: {
    types: schemaTypes,
  },
});
