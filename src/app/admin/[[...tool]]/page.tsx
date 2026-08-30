/**
 * Catch-all route that mounts Sanity Studio at /admin — this is the
 * add/edit/delete panel for events. Keeping it inside the Next.js app
 * (rather than a separate Studio deployment) puts it on fifty.ge's own
 * domain once this is merged in.
 */
"use client";

import { NextStudio } from "next-sanity/studio";

import config from "../../../../sanity.config";

export default function AdminPage() {
  return <NextStudio config={config} />;
}
