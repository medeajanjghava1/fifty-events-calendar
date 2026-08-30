"use client";

import Image from "next/image";
import { useEffect } from "react";

import { formatDayTime } from "@/lib/dates";
import { urlForImage } from "@/lib/sanity/image";

import type { CalendarCell } from "./Calendar";

export default function EventDetail({
  cell,
  onClose,
}: {
  cell: CalendarCell;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="event-overlay" onClick={onClose}>
      <div
        className="event-panel"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="event-panel-close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <div className="event-list">
          {cell.events.map((event) => (
            <article
              className={`event-item event-accent-${event.color ?? "blue"}`}
              key={event._id}
            >
              {event.cover && (
                <Image
                  src={urlForImage(event.cover).width(640).height(360).fit("crop").url()}
                  alt=""
                  width={640}
                  height={360}
                  className="event-cover"
                />
              )}
              <h2>{event.title}</h2>
              <p className="event-when">
                {formatDayTime(event.date)}
                {event.endDate ? ` – ${formatDayTime(event.endDate)}` : ""}
              </p>
              {event.location && <p className="event-where">{event.location}</p>}
              {event.description && <p className="event-desc">{event.description}</p>}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
