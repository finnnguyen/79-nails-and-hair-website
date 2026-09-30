import { describe, expect, it } from "vitest";
import { getOpenStatus, salonClock } from "@/lib/open-status";

describe("getOpenStatus", () => {
  it("is open mid-day Tuesday, closing at 7", () => {
    expect(getOpenStatus(2, 12 * 60)).toEqual({ open: true, closesAt: "7:00 PM" });
  });

  it("closes at 6 on Sunday", () => {
    expect(getOpenStatus(0, 17 * 60 + 59)).toEqual({ open: true, closesAt: "6:00 PM" });
    expect(getOpenStatus(0, 18 * 60)).toMatchObject({ open: false });
  });

  it("before opening says it opens later today", () => {
    expect(getOpenStatus(3, 8 * 60)).toEqual({
      open: false,
      opensAt: "9:10 AM",
      opensDay: "today",
    });
  });

  it("skips closed Monday when looking for the next opening", () => {
    // Sunday evening -> Monday closed -> Tuesday
    expect(getOpenStatus(0, 20 * 60)).toEqual({
      open: false,
      opensAt: "9:10 AM",
      opensDay: "Tuesday",
    });
    expect(getOpenStatus(1, 12 * 60)).toMatchObject({ opensDay: "tomorrow" });
  });
});

describe("salonClock", () => {
  it("converts to Pacific time", () => {
    // 2026-07-28T19:30Z is Tuesday 12:30 PM PDT
    expect(salonClock(new Date("2026-07-28T19:30:00Z"))).toEqual({ day: 2, minutes: 12 * 60 + 30 });
  });
});
