import type { CalendarEvent } from "./events";
import { expandRecurringEvent } from "./recurrence";

/**
 * Preview content only — lets the calendar be reviewed for design and
 * behavior before a real Sanity project is connected. Enabled by
 * NEXT_PUBLIC_DEMO_MODE=true (see .env.local); never used as a fallback
 * for a real, misconfigured deployment. Delete this file once fifty.ge's
 * actual events are being managed in Sanity.
 *
 * Assumptions worth double-checking:
 * - September: "Drinks at Fifty" runs biweekly (Sep 11–12, 25–26) on the
 *   Fri/Sat weekends that don't already have Community Party or the
 *   Investors Gathering, rather than doubling up on the same nights.
 * - October: "Drinks at Fifty" runs every Friday and Saturday, except
 *   Oct 31 — that night is Halloween Party only, via the series'
 *   `exceptions` date rather than a second, capped series.
 */
const SAMPLE_EVENTS: Omit<CalendarEvent, "seriesId">[] = [
  {
    _id: "sample-community-party-1",
    title: "Community Party",
    date: "2026-09-02T16:00:00.000Z", // 20:00 Asia/Tbilisi
    endDate: null,
    location: "FIFTY, Tbilisi",
    description: "An open night for the FIFTY community — drinks, music, and new faces.",
    cover: null,
    color: "blue",
    recurrence: null,
  },
  {
    _id: "sample-community-party-2",
    title: "Community Party",
    date: "2026-09-05T16:00:00.000Z",
    endDate: null,
    location: "FIFTY, Tbilisi",
    description: "An open night for the FIFTY community — drinks, music, and new faces.",
    cover: null,
    color: "blue",
    recurrence: null,
  },
  {
    _id: "sample-investors-gathering",
    title: "FIFTY Investors Gathering",
    date: "2026-09-19T14:30:00.000Z", // 18:30 Asia/Tbilisi
    endDate: null,
    location: "FIFTY, Tbilisi",
    description: "A gathering of Fifty's investors to connect, meet each other, discuss our plans and ideas, and explore how everyone can get more involved in Fifty's next chapter.",
    cover: null,
    color: "green",
    recurrence: null,
  },
  {
    _id: "sample-drinks-at-fifty",
    title: "Drinks at Fifty",
    date: "2026-09-11T15:00:00.000Z", // Fri 19:00 Asia/Tbilisi — anchor
    endDate: null,
    location: "FIFTY, Tbilisi",
    description: "Standing drinks night, open to members and their guests.",
    cover: null,
    color: "orange",
    recurrence: {
      enabled: true,
      weekdays: ["fri", "sat"],
      intervalWeeks: 2,
      until: "2026-09-30",
      exceptions: null,
    },
  },
  {
    _id: "sample-drinks-at-fifty-weekly",
    title: "Drinks at Fifty",
    date: "2026-10-02T15:00:00.000Z", // Fri 19:00 Asia/Tbilisi — anchor
    endDate: null,
    location: "FIFTY, Tbilisi",
    description: "Standing drinks night, open to members and their guests.",
    cover: null,
    color: "orange",
    recurrence: {
      enabled: true,
      weekdays: ["fri", "sat"],
      intervalWeeks: 1,
      until: null,
      exceptions: ["2026-10-31"],
    },
  },
  {
    _id: "sample-halloween-party",
    title: "Halloween Party",
    date: "2026-10-31T16:00:00.000Z", // 20:00 Asia/Tbilisi
    endDate: null,
    location: "FIFTY, Tbilisi",
    description: "FIFTY's Halloween night — costumes encouraged.",
    cover: null,
    color: "red",
    recurrence: null,
  },
];

export function getSampleEventsInRange(start: Date, end: Date): CalendarEvent[] {
  const expanded = SAMPLE_EVENTS.flatMap((event) => {
    if (event.recurrence?.enabled) return expandRecurringEvent(event, start, end);
    const overlaps =
      new Date(event.date) < end && new Date(event.endDate ?? event.date) >= start;
    return overlaps ? [event] : [];
  });
  return expanded.sort((a, b) => a.date.localeCompare(b.date));
}
