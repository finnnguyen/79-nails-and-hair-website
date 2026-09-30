import { BUSINESS } from "@/lib/business-info";

type DayHours = { open: number; close: number } | null;

export type OpenStatus =
  | { open: true; closesAt: string }
  | { open: false; opensAt: string; opensDay: string };

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function formatMinutes(total: number): string {
  const h24 = Math.floor(total / 60);
  const m = total % 60;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${h24 >= 12 ? "PM" : "AM"}`;
}

/** Salon-local day of week + minutes since midnight for an instant. */
export function salonClock(now: Date, timeZone: string = BUSINESS.timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)!.value;
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  return { day, minutes: (Number(get("hour")) % 24) * 60 + Number(get("minute")) };
}

export function getOpenStatus(
  day: number,
  minutes: number,
  schedule: readonly DayHours[] = BUSINESS.schedule
): OpenStatus {
  const today = schedule[day];
  if (today && minutes >= today.open && minutes < today.close) {
    return { open: true, closesAt: formatMinutes(today.close) };
  }
  if (today && minutes < today.open) {
    return { open: false, opensAt: formatMinutes(today.open), opensDay: "today" };
  }
  for (let offset = 1; offset <= 7; offset++) {
    const d = (day + offset) % 7;
    const hours = schedule[d];
    if (hours) {
      return {
        open: false,
        opensAt: formatMinutes(hours.open),
        opensDay: offset === 1 ? "tomorrow" : DAY_NAMES[d],
      };
    }
  }
  throw new Error("Schedule has no open days");
}
