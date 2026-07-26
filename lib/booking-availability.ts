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

function timesForDay(dayOfWeek: number): string[] {
  // Closed Monday
  if (dayOfWeek === 1) return [];
  // Open 9:10, so slots start at 9:15. Sunday closes at 6, otherwise 7.
  const closeMinutes = (dayOfWeek === 0 ? 18 : 19) * 60;
  const lastStart = closeMinutes - 30; // last appointment must start 30 min before close

  const times: string[] = [];
  for (let mins = 9 * 60 + 15; mins <= lastStart; mins += 15) {
    times.push(formatTime(mins));
  }
  return times;
}

/** Mock availability for the next `days` calendar days, skipping Mondays (closed). */
export function getAvailability(days = 14): DayAvailability[] {
  const result: DayAvailability[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; result.length < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dayOfWeek = date.getDay();
    const times = timesForDay(dayOfWeek);
    if (times.length === 0) continue;

    result.push({
      date: date.toISOString().slice(0, 10),
      label: DAY_LABEL.format(date),
      times,
    });
  }

  return result;
}
