import type { Image } from "sanity";

import { dayKey } from "./dates";
import { expandRecurringEvent, type RecurrenceRule } from "./recurrence";
import { client } from "./sanity/client";

export type EventColor = "blue" | "orange" | "green" | "red";

export type CalendarEvent = {
  _id: string;
  seriesId?: string;
  title: string;
  date: string; // ISO
  endDate: string | null;
  location: string | null;
  description: string | null;
  cover: Image | null;
  color: EventColor | null;
  recurrence: RecurrenceRule;
};

const EVENT_FIELDS = `
  _id,
  title,
  date,
  endDate,
  location,
  description,
  cover,
  color,
  recurrence
`;

/**
 * Events visible within [start, end): one-off events whose range overlaps
 * the window, plus every occurrence of a recurring series that falls in it.
 */
export async function getEventsInRange(
  start: Date,
  end: Date
): Promise<CalendarEvent[]> {
  const docs: CalendarEvent[] = await client.fetch(
    `*[_type == "event" && (
      (recurrence.enabled != true && date < $end && coalesce(endDate, date) >= $start)
      || (recurrence.enabled == true && date < $end && (!defined(recurrence.until) || recurrence.until >= $startDay))
    )] | order(date asc){ ${EVENT_FIELDS} }`,
    { start: start.toISOString(), end: end.toISOString(), startDay: dayKey(start) },
    { next: { revalidate: 300 } }
  );

  const expanded = docs.flatMap((doc) =>
    doc.recurrence?.enabled ? expandRecurringEvent(doc, start, end) : [doc]
  );

  return expanded.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * What the calendar page actually calls: real Sanity data, except in demo
 * mode (NEXT_PUBLIC_DEMO_MODE=true, for reviewing the calendar before a
 * real project is connected), and tolerant of Sanity being unreachable so
 * a CMS outage doesn't take the whole page down for visitors.
 */
export async function getEventsForDisplay(start: Date, end: Date): Promise<CalendarEvent[]> {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
    const { getSampleEventsInRange } = await import("./sampleEvents");
    return getSampleEventsInRange(start, end);
  }
  try {
    return await getEventsInRange(start, end);
  } catch (error) {
    console.error("Failed to load events from Sanity:", error);
    return [];
  }
}

export async function getEvent(id: string): Promise<CalendarEvent | null> {
  return client.fetch(
    `*[_type == "event" && _id == $id][0]{ ${EVENT_FIELDS} }`,
    { id },
    { next: { revalidate: 300 } }
  );
}
