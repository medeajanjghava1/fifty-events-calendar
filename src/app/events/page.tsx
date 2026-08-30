import Calendar, { type CalendarCell } from "@/components/Calendar";
import { buildMonthGrid, eventDayKeys, formatMonthTitle } from "@/lib/dates";
import { getEventsForDisplay } from "@/lib/events";

export const revalidate = 300;

function parseMonth(sp: { y?: string; m?: string }) {
  const now = new Date();
  const year = sp.y ? parseInt(sp.y, 10) : now.getUTCFullYear();
  const monthIndex = sp.m ? parseInt(sp.m, 10) - 1 : now.getUTCMonth();
  return { year, monthIndex };
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ y?: string; m?: string }>;
}) {
  const sp = await searchParams;
  const { year, monthIndex } = parseMonth(sp);
  const grid = buildMonthGrid(year, monthIndex);

  const rangeStart = grid[0][0].date;
  const rangeEnd = new Date(grid[grid.length - 1][6].date);
  rangeEnd.setUTCDate(rangeEnd.getUTCDate() + 1);

  const events = await getEventsForDisplay(rangeStart, rangeEnd);

  const eventsByDay = new Map<string, typeof events>();
  for (const event of events) {
    for (const key of eventDayKeys(event.date, event.endDate)) {
      const list = eventsByDay.get(key) ?? [];
      list.push(event);
      eventsByDay.set(key, list);
    }
  }

  const weeks: CalendarCell[][] = grid.map((week) =>
    week.map((cell) => ({
      key: cell.key,
      dayNumber: cell.date.getUTCDate(),
      inMonth: cell.inMonth,
      isToday: cell.isToday,
      events: eventsByDay.get(cell.key) ?? [],
    }))
  );

  const prevDate = new Date(Date.UTC(year, monthIndex - 1, 1));
  const nextDate = new Date(Date.UTC(year, monthIndex + 1, 1));

  return (
    <main className="events-page">
      <p className="events-eyebrow">FIFTY · What&rsquo;s on</p>
      <Calendar
        weeks={weeks}
        title={formatMonthTitle(year, monthIndex)}
        prevHref={`/events?y=${prevDate.getUTCFullYear()}&m=${prevDate.getUTCMonth() + 1}`}
        nextHref={`/events?y=${nextDate.getUTCFullYear()}&m=${nextDate.getUTCMonth() + 1}`}
      />
    </main>
  );
}
