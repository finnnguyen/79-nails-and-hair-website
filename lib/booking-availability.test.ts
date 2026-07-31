import { afterEach, describe, expect, it, vi } from "vitest";
import {
  filterAvailability,
  getAvailability,
  parseTimeToMinutes,
  toPacificDateAndMinutes,
} from "./booking-availability";

describe("parseTimeToMinutes", () => {
  it("parses AM/PM times to minutes since midnight", () => {
    expect(parseTimeToMinutes("9:15 AM")).toBe(9 * 60 + 15);
    expect(parseTimeToMinutes("12:00 AM")).toBe(0); // midnight
    expect(parseTimeToMinutes("12:00 PM")).toBe(12 * 60); // noon
    expect(parseTimeToMinutes("1:00 PM")).toBe(13 * 60);
  });

  it("throws on an unparseable time", () => {
    expect(() => parseTimeToMinutes("not a time")).toThrow();
  });
});

describe("toPacificDateAndMinutes", () => {
  it("converts a UTC timestamp to Pacific wall-clock date + minutes", () => {
    // 2026-07-31 16:15 UTC = 2026-07-31 09:15 Pacific (PDT, UTC-7)
    const result = toPacificDateAndMinutes("2026-07-31T16:15:00.000Z");
    expect(result.date).toBe("2026-07-31");
    expect(result.minutes).toBe(9 * 60 + 15);
  });
});

describe("getAvailability", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("never includes Monday (closed)", () => {
    const days = getAvailability(30);
    expect(days).toHaveLength(30);
    for (const day of days) {
      const [y, m, d] = day.date.split("-").map(Number);
      const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
      expect(weekday).not.toBe(1);
    }
  });

  it("starts at 9:15 AM and closes by 7pm on a weekday", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-03T12:00:00")); // Monday -> skipped
    const [tuesday] = getAvailability(1, 30);
    expect(tuesday.date).toBe("2026-08-04");
    expect(tuesday.times[0]).toBe("9:15 AM");
    expect(tuesday.times.at(-1)).toBe("6:30 PM");
  });

  it("closes earlier (6pm) on Sunday", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-09T12:00:00")); // Sunday
    const [sunday] = getAvailability(1, 30);
    expect(sunday.date).toBe("2026-08-09");
    expect(sunday.times.at(-1)).toBe("5:30 PM");
  });

  it("excludes start times that wouldn't finish before closing, for a longer service", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-03T12:00:00")); // -> first result is Tuesday
    const [tuesday] = getAvailability(1, 120); // 2-hour service
    expect(tuesday.times.at(-1)).toBe("5:00 PM"); // 7pm close - 120min
  });
});

describe("filterAvailability", () => {
  const baseAvailability = [
    {
      date: "2026-08-04",
      label: "Tue, Aug 4",
      times: ["9:15 AM", "9:30 AM", "9:45 AM", "10:00 AM"],
    },
  ];

  it("removes slots that overlap an existing booking", () => {
    // Booking: 9:15-9:45 AM Pacific
    const bookedRanges = [
      { startsAt: "2026-08-04T16:15:00.000Z", endsAt: "2026-08-04T16:45:00.000Z" },
    ];
    const result = filterAvailability(baseAvailability, bookedRanges, 15);
    expect(result[0].times).toEqual(["9:45 AM", "10:00 AM"]);
  });

  it("keeps a slot that ends exactly when a booking starts (adjacent, not overlapping)", () => {
    // Booking: 9:30-10:00 AM Pacific
    const bookedRanges = [
      { startsAt: "2026-08-04T16:30:00.000Z", endsAt: "2026-08-04T17:00:00.000Z" },
    ];
    const result = filterAvailability(baseAvailability, bookedRanges, 15);
    // 9:15 candidate ends 9:30, exactly when the booking starts — not an overlap.
    expect(result[0].times).toContain("9:15 AM");
    expect(result[0].times).not.toContain("9:30 AM");
  });

  it("drops a day entirely once every slot is booked out", () => {
    const bookedRanges = [
      { startsAt: "2026-08-04T16:15:00.000Z", endsAt: "2026-08-04T17:15:00.000Z" },
    ];
    const result = filterAvailability(baseAvailability, bookedRanges, 15);
    expect(result).toHaveLength(0);
  });

  it("ignores bookings on a different date", () => {
    const bookedRanges = [
      { startsAt: "2026-08-05T16:15:00.000Z", endsAt: "2026-08-05T16:45:00.000Z" },
    ];
    const result = filterAvailability(baseAvailability, bookedRanges, 15);
    expect(result[0].times).toEqual(baseAvailability[0].times);
  });
});
