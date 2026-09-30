"use client";

import { useMemo, useState } from "react";
import type { DayAvailability } from "@/lib/booking-availability";

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const MONTH_LABEL = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});

function dateKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

function monthKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}`;
}

function buildWeeks(year: number, month: number): (Date | null)[][] {
  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];

  for (let i = 0; i < firstOfMonth.getDay(); i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(new Date(year, month, day));
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

export default function CalendarPicker({
  availability,
  selectedDate,
  onSelect,
}: {
  availability: DayAvailability[];
  selectedDate: string | null;
  onSelect: (date: string) => void;
}) {
  const availableSet = useMemo(
    () => new Set(availability.map((d) => d.date)),
    [availability]
  );
  const today = useMemo(() => new Date(), []);
  const [viewDate, setViewDate] = useState(() => {
    const first = availability[0] ? new Date(availability[0].date) : today;
    return new Date(first.getFullYear(), first.getMonth(), 1);
  });

  const minMonth = availability[0] ? monthKey(new Date(availability[0].date)) : monthKey(today);
  const maxMonth = availability.length
    ? monthKey(new Date(availability[availability.length - 1].date))
    : monthKey(today);

  const weeks = useMemo(
    () => buildWeeks(viewDate.getFullYear(), viewDate.getMonth()),
    [viewDate]
  );

  const changeMonth = (delta: number) => {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + delta, 1));
  };

  return (
    <div className="w-full max-w-xs border border-border bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-display text-lg text-foreground">
          {MONTH_LABEL.format(viewDate)}
        </p>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            disabled={monthKey(viewDate) <= minMonth}
            aria-label="Previous month"
            className="flex h-8 w-8 items-center justify-center rounded-sm text-foreground hover:bg-background disabled:opacity-30 disabled:hover:bg-transparent"
          >
            &#8249;
          </button>
          <button
            type="button"
            onClick={() => changeMonth(1)}
            disabled={monthKey(viewDate) >= maxMonth}
            aria-label="Next month"
            className="flex h-8 w-8 items-center justify-center rounded-sm text-foreground hover:bg-background disabled:opacity-30 disabled:hover:bg-transparent"
          >
            &#8250;
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label} className="pb-1 text-[11px] uppercase tracking-wider text-muted">
            {label}
          </span>
        ))}

        {weeks.map((week, wi) =>
          week.map((day, di) => {
            if (!day) return <span key={`${wi}-${di}`} />;

            const key = dateKey(day);
            const isAvailable = availableSet.has(key);
            const isSelected = key === selectedDate;
            const isToday = key === dateKey(today);

            return (
              <button
                key={key}
                type="button"
                disabled={!isAvailable}
                onClick={() => onSelect(key)}
                aria-pressed={isSelected}
                className={`mx-auto flex h-9 w-9 items-center justify-center rounded-sm text-sm tabular-nums transition-colors ${
                  isSelected
                    ? "bg-foreground text-background"
                    : isAvailable
                      ? "text-foreground hover:bg-background"
                      : "text-muted/35"
                } ${isToday && !isSelected ? "font-semibold underline underline-offset-4" : ""}`}
              >
                {day.getDate()}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
