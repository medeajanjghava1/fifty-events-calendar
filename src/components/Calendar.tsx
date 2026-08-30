"use client";

import Link from "next/link";
import { useState } from "react";

import { formatTime } from "@/lib/dates";
import type { CalendarEvent } from "@/lib/events";

import EventDetail from "./EventDetail";

const MAX_VISIBLE_PER_DAY = 2;

export type CalendarCell = {
  key: string;
  dayNumber: number;
  inMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function Calendar({
  weeks,
  title,
  prevHref,
  nextHref,
}: {
  weeks: CalendarCell[][];
  title: string;
  prevHref: string;
  nextHref: string;
}) {
  const [selected, setSelected] = useState<CalendarCell | null>(null);
  const flatCells = weeks.flat();
  const isEmptyMonth = flatCells.every((c) => c.events.length === 0);

  return (
    <div className="calendar">
      <div className="calendar-head">
        <h1>{title}</h1>
        <nav className="calendar-nav" aria-label="Change month">
          <Link href={prevHref} aria-label="Previous month">
            ‹
          </Link>
          <Link href={nextHref} aria-label="Next month">
            ›
          </Link>
        </nav>
      </div>

      <div className="calendar-grid" role="grid">
        {WEEKDAYS.map((d) => (
          <div className="dow" key={d} role="columnheader">
            {d}
          </div>
        ))}
        {flatCells.map((cell) => {
          const hasEvents = cell.events.length > 0;
          const visible = cell.events.slice(0, MAX_VISIBLE_PER_DAY);
          const overflow = cell.events.length - visible.length;
          return (
            <button
              key={cell.key}
              type="button"
              role="gridcell"
              className={[
                "cell",
                !cell.inMonth && "cell-outside",
                cell.isToday && "cell-today",
                hasEvents && "cell-has-events",
              ]
                .filter(Boolean)
                .join(" ")}
              disabled={!hasEvents}
              onClick={() => setSelected(cell)}
            >
              <span className="cell-num">{cell.dayNumber}</span>
              {hasEvents && (
                <span className="cell-events">
                  {visible.map((event) => (
                    <span
                      className={`cell-event cell-event-${event.color ?? "blue"}`}
                      key={event._id}
                    >
                      <span className="cell-event-time">{formatTime(event.date)}</span>{" "}
                      <span className="cell-event-title">{event.title}</span>
                    </span>
                  ))}
                  {overflow > 0 && <span className="cell-more">+{overflow} more</span>}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {isEmptyMonth && (
        <p className="calendar-empty">Nothing on the calendar this month yet.</p>
      )}

      {selected && <EventDetail cell={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
