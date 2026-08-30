import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId } from "../../../sanity/env";

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  // Cached, unauthenticated reads are all the public calendar needs.
  useCdn: true,
});
