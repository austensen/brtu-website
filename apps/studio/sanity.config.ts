import { defineConfig } from "sanity";

import { schemaTypes } from "./schemas";

export default defineConfig({
  name: "default",
  title: "BRTU Studio",

  projectId: process.env.SANITY_PROJECT_ID || "",
  dataset: process.env.SANITY_DATASET || "",

  schema: {
    types: schemaTypes,
  },
});
