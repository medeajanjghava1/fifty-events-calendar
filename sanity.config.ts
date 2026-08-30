/**
 * Sanity Studio config, embedded into the Next.js app at /admin.
 * See src/app/admin/[[...tool]]/page.tsx.
 */
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";

import { apiVersion, dataset, projectId } from "./sanity/env";
import { schemaTypes } from "./sanity/schemaTypes";

export default defineConfig({
  basePath: "/admin",
  name: "fifty-events",
  title: "FIFTY — Events admin",

  projectId,
  dataset,
  apiVersion,

  schema: {
    types: schemaTypes,
  },

  plugins: [structureTool()],
});
