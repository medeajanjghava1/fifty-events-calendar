export const TIME_ZONE = "Asia/Tbilisi";

/** "YYYY-MM-DD" for the given instant, as read in the venue's own timezone. */
export function dayKey(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  // en-CA formats as YYYY-MM-DD, which sorts and compares like an ISO date.
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(d);
}

/** Monday=0 .. Sunday=6, in UTC — used for both grid layout and recurrence math. */
export function mondayIndexUTC(d: Date): number {
  return (d.getUTCDay() + 6) % 7;
}

export type MonthCell = {
  date: Date;
  key: string;
  inMonth: boolean;
  isToday: boolean;
};

/**
 * A Monday-first month grid as weeks of 7 cells, padded with the trailing
 * days of the previous/next month so every week is full.
 */
export function buildMonthGrid(year: number, monthIndex: number): MonthCell[][] {
  const todayKey = dayKey(new Date());
  const firstOfMonth = new Date(Date.UTC(year, monthIndex, 1));

  const start = new Date(firstOfMonth);
  start.setUTCDate(start.getUTCDate() - mondayIndexUTC(firstOfMonth));

  const cells: MonthCell[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    const key = dayKey(d);
    cells.push({
      date: d,
      key,
      inMonth: d.getUTCMonth() === monthIndex,
      isToday: key === todayKey,
    });
  }

  // Drop the trailing week if it's entirely outside the month (keeps most
  // months at 5 rows instead of always reserving 6).
  const weeks: MonthCell[][] = [];
  for (let i = 0; i < 42; i += 7) weeks.push(cells.slice(i, i + 7));
  while (weeks.length > 5 && weeks[weeks.length - 1].every((c) => !c.inMonth)) {
    weeks.pop();
  }
  return weeks;
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatDayTime(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatMonthTitle(year: number, monthIndex: number): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    month: "long",
    year: "numeric",
  }).format(new Date(Date.UTC(year, monthIndex, 15)));
}

/** Every day-key an event touches, so multi-day events mark every date they span. */
export function eventDayKeys(startIso: string, endIso: string | null): string[] {
  const start = new Date(startIso);
  const end = endIso ? new Date(endIso) : start;
  const keys: string[] = [];
  const cursor = new Date(start);
  // Guard against unbounded loops from bad data.
  for (let i = 0; i < 60 && cursor <= end; i++) {
    keys.push(dayKey(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return keys.length ? keys : [dayKey(start)];
}
