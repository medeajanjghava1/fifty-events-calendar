import { dayKey, mondayIndexUTC } from "./dates";

export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export type RecurrenceRule = {
  enabled: boolean;
  weekdays: Weekday[] | null;
  intervalWeeks: number | null;
  until: string | null; // "YYYY-MM-DD"
  exceptions: string[] | null; // "YYYY-MM-DD" dates to skip
} | null;

const WEEKDAY_ORDER: Weekday[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

/**
 * Expands a recurring event into one occurrence per matching day inside
 * [rangeStart, rangeEnd). Georgia has had no DST since 2017, so preserving
 * the anchor's UTC time-of-day for every occurrence is safe.
 */
export function expandRecurringEvent<
  T extends { _id: string; date: string; endDate: string | null; recurrence: RecurrenceRule },
>(event: T, rangeStart: Date, rangeEnd: Date): (T & { seriesId: string })[] {
  const rec = event.recurrence;
  if (!rec?.enabled || !rec.weekdays?.length) return [];

  const interval = Math.max(1, rec.intervalWeeks ?? 1);
  const anchor = new Date(event.date);
  const anchorMidnight = new Date(
    Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth(), anchor.getUTCDate())
  );
  const anchorWeekStart = new Date(anchorMidnight);
  anchorWeekStart.setUTCDate(anchorMidnight.getUTCDate() - mondayIndexUTC(anchorMidnight));

  const until = rec.until ? new Date(`${rec.until}T23:59:59Z`) : null;
  const exceptions = new Set(rec.exceptions ?? []);
  const durationMs = event.endDate ? new Date(event.endDate).getTime() - anchor.getTime() : null;

  const windowStart = new Date(Math.max(rangeStart.getTime(), anchorMidnight.getTime()));
  windowStart.setUTCHours(0, 0, 0, 0);

  const occurrences: (T & { seriesId: string })[] = [];
  for (
    const cursor = new Date(windowStart);
    cursor < rangeEnd;
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  ) {
    const weekday = WEEKDAY_ORDER[mondayIndexUTC(cursor)];
    if (!rec.weekdays.includes(weekday)) continue;
    if (until && cursor > until) continue;
    if (exceptions.has(dayKey(cursor))) continue;

    const weekStart = new Date(cursor);
    weekStart.setUTCDate(cursor.getUTCDate() - mondayIndexUTC(cursor));
    const weeksSinceAnchor = Math.round(
      (weekStart.getTime() - anchorWeekStart.getTime()) / (7 * 86_400_000)
    );
    if (weeksSinceAnchor < 0 || weeksSinceAnchor % interval !== 0) continue;

    const occurStart = new Date(
      Date.UTC(
        cursor.getUTCFullYear(),
        cursor.getUTCMonth(),
        cursor.getUTCDate(),
        anchor.getUTCHours(),
        anchor.getUTCMinutes(),
        anchor.getUTCSeconds()
      )
    );
    const occurEnd = durationMs != null ? new Date(occurStart.getTime() + durationMs) : null;

    occurrences.push({
      ...event,
      _id: `${event._id}-${dayKey(cursor)}`,
      seriesId: event._id,
      date: occurStart.toISOString(),
      endDate: occurEnd ? occurEnd.toISOString() : null,
      recurrence: null,
    });
  }
  return occurrences;
}
