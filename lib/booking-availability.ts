export type DayAvailability = {
  date: string; // YYYY-MM-DD
  label: string; // e.g. "Tue, Jul 28"
  times: string[]; // e.g. ["9:15 AM", "9:30 AM", "9:45 AM", ...]
};

const DAY_LABEL = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
});

function formatTime(totalMinutes: number): string {
  const hour24 = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  const period = hour24 >= 12 ? "PM" : "AM";
  const displayHour = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${displayHour}:${minute.toString().padStart(2, "0")} ${period}`;
}

/** Inverse of formatTime — "9:15 AM" -> 555 (minutes since midnight). */
export function parseTimeToMinutes(time: string): number {
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) throw new Error(`Unparseable time: ${time}`);
  const [, hourStr, minuteStr, period] = match;
  let hour = Number(hourStr) % 12;
  if (period.toUpperCase() === "PM") hour += 12;
  return hour * 60 + Number(minuteStr);
}

const PACIFIC_PARTS = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Los_Angeles",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/** Converts a UTC ISO timestamp into salon-local (Pacific) wall-clock date +
 * minutes-since-midnight, so it's directly comparable with getAvailability's
 * output. DST-safe via Intl's timezone database — no date library needed. */
export function toPacificDateAndMinutes(isoString: string): {
  date: string;
  minutes: number;
} {
  const parts = PACIFIC_PARTS.formatToParts(new Date(isoString));
  const get = (type: string) => parts.find((p) => p.type === type)!.value;
  // formatToParts gives 24 -> "24" for midnight in some environments; normalize.
  const hour = Number(get("hour")) % 24;
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    minutes: hour * 60 + Number(get("minute")),
  };
}

function timesForDay(dayOfWeek: number, durationMinutes: number): string[] {
  // Closed Monday
  if (dayOfWeek === 1) return [];
  // Open 9:10, so slots start at 9:15. Sunday closes at 6, otherwise 7.
  const closeMinutes = (dayOfWeek === 0 ? 18 : 19) * 60;
  // The appointment must finish by close, so it can't start any later than
  // close minus how long it actually takes.
  const lastStart = closeMinutes - durationMinutes;

  const times: string[] = [];
  for (let mins = 9 * 60 + 15; mins <= lastStart; mins += 15) {
    times.push(formatTime(mins));
  }
  return times;
}

/** Removes already-booked slots (and start times that would overlap one) from
 * a base availability list — the actual "is this slot bookable" guarantee on
 * the client side. `bookedRanges` are ISO start/end timestamps for a single
 * staff member; existing bookings never span midnight in this salon's hours,
 * so each range's start/end always fall on the same Pacific-local date. */
export function filterAvailability(
  baseAvailability: DayAvailability[],
  bookedRanges: { startsAt: string; endsAt: string }[],
  durationMinutes: number
): DayAvailability[] {
  const rangesByDate = new Map<string, { start: number; end: number }[]>();
  for (const range of bookedRanges) {
    const start = toPacificDateAndMinutes(range.startsAt);
    const end = toPacificDateAndMinutes(range.endsAt);
    const list = rangesByDate.get(start.date) ?? [];
    list.push({ start: start.minutes, end: end.minutes });
    rangesByDate.set(start.date, list);
  }

  return baseAvailability
    .map((day) => {
      const busy = rangesByDate.get(day.date) ?? [];
      const times = day.times.filter((t) => {
        const candidateStart = parseTimeToMinutes(t);
        const candidateEnd = candidateStart + durationMinutes;
        return !busy.some((b) => candidateStart < b.end && candidateEnd > b.start);
      });
      return { ...day, times };
    })
    .filter((day) => day.times.length > 0);
}

/** Mock availability for the next `days` calendar days, skipping Mondays (closed).
 * `durationMinutes` excludes start times that wouldn't finish before closing. */
export function getAvailability(days = 14, durationMinutes = 30): DayAvailability[] {
  const result: DayAvailability[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; result.length < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dayOfWeek = date.getDay();
    const times = timesForDay(dayOfWeek, durationMinutes);
    if (times.length === 0) continue;

    result.push({
      date: date.toISOString().slice(0, 10),
      label: DAY_LABEL.format(date),
      times,
    });
  }

  return result;
}
