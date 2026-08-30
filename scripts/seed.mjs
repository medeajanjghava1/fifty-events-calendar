#!/usr/bin/env node
/**
 * Creates the same events used in demo mode (src/lib/sampleEvents.ts) as
 * real documents in your connected Sanity project — for the September
 * 2026 launch content: two "Community Party" nights, "Drinks at Fifty"
 * (biweekly in September, then every Fri/Sat in October except the 31st),
 * the "FIFTY Investors Gathering", and the "Halloween Party" on Oct 31.
 *
 * Usage (after `npx sanity@latest init --env`, so NEXT_PUBLIC_SANITY_* are
 * set in .env.local):
 *
 *   1. Create a write token: sanity.io/manage → your project → API →
 *      Tokens → Add API token, role "Editor".
 *   2. SANITY_API_WRITE_TOKEN=sk... node --env-file=.env.local scripts/seed.mjs
 *
 * Safe to re-run — documents use fixed IDs, so this updates them in place
 * rather than creating duplicates.
 */
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_WRITE_TOKEN;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-01-01";

if (!projectId || projectId === "demo0000") {
  console.error(
    "NEXT_PUBLIC_SANITY_PROJECT_ID is missing or still the placeholder.\n" +
      "Run `npx sanity@latest init --env` first, then re-run this script."
  );
  process.exit(1);
}
if (!token) {
  console.error(
    "Missing SANITY_API_WRITE_TOKEN.\n" +
      "Create one at sanity.io/manage → your project → API → Tokens (role: Editor),\n" +
      "then run: SANITY_API_WRITE_TOKEN=sk... node --env-file=.env.local scripts/seed.mjs"
  );
  process.exit(1);
}

const events = [
  {
    _id: "event-community-party-1",
    _type: "event",
    title: "Community Party",
    date: "2026-09-02T16:00:00.000Z", // 20:00 Asia/Tbilisi
    location: "FIFTY, Tbilisi",
    description: "An open night for the FIFTY community — drinks, music, and new faces.",
    color: "blue",
  },
  {
    _id: "event-community-party-2",
    _type: "event",
    title: "Community Party",
    date: "2026-09-05T16:00:00.000Z",
    location: "FIFTY, Tbilisi",
    description: "An open night for the FIFTY community — drinks, music, and new faces.",
    color: "blue",
  },
  {
    _id: "event-investors-gathering",
    _type: "event",
    title: "FIFTY Investors Gathering",
    date: "2026-09-19T14:30:00.000Z", // 18:30 Asia/Tbilisi
    location: "FIFTY, Tbilisi",
    description: "A gathering of Fifty's investors to connect, meet each other, discuss our plans and ideas, and explore how everyone can get more involved in Fifty's next chapter.",
    color: "green",
  },
  {
    _id: "event-drinks-at-fifty",
    _type: "event",
    title: "Drinks at Fifty",
    date: "2026-09-11T15:00:00.000Z", // Fri 19:00 Asia/Tbilisi — first occurrence
    location: "FIFTY, Tbilisi",
    description: "Standing drinks night, open to members and their guests.",
    color: "orange",
    recurrence: {
      _type: "object",
      enabled: true,
      weekdays: ["fri", "sat"],
      intervalWeeks: 2,
      until: "2026-09-30", // September only — see the weekly series below
    },
  },
  {
    _id: "event-drinks-at-fifty-weekly",
    _type: "event",
    title: "Drinks at Fifty",
    date: "2026-10-02T15:00:00.000Z", // Fri 19:00 Asia/Tbilisi — first occurrence
    location: "FIFTY, Tbilisi",
    description: "Standing drinks night, open to members and their guests.",
    color: "orange",
    recurrence: {
      _type: "object",
      enabled: true,
      weekdays: ["fri", "sat"],
      intervalWeeks: 1, // every Friday and Saturday, open-ended from October on
      until: null,
      exceptions: ["2026-10-31"], // Halloween Party takes that night instead
    },
  },
  {
    _id: "event-halloween-party",
    _type: "event",
    title: "Halloween Party",
    date: "2026-10-31T16:00:00.000Z", // 20:00 Asia/Tbilisi
    location: "FIFTY, Tbilisi",
    description: "FIFTY's Halloween night — costumes encouraged.",
    color: "red",
  },
];

const endpoint = `https://${projectId}.api.sanity.io/v${apiVersion}/data/mutate/${dataset}`;
const mutations = events.map((doc) => ({ createOrReplace: doc }));

const res = await fetch(endpoint, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({ mutations }),
});

const body = await res.json();
if (!res.ok) {
  console.error("Seed failed:", JSON.stringify(body, null, 2));
  process.exit(1);
}

console.log(`Seeded ${events.length} events into ${projectId}/${dataset}.`);
console.log("Open /admin to review, or /events to see them on the calendar.");
