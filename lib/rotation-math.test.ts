import { describe, expect, it } from "vitest";
import {
  MINUTES_PER_TURN,
  REQUEST_RESET_THRESHOLD,
  computeTurnCreditAfterVisit,
  shouldSendRequestToBackOfLine,
} from "./rotation-math";

describe("shouldSendRequestToBackOfLine", () => {
  it("does not reset below the threshold", () => {
    expect(shouldSendRequestToBackOfLine(REQUEST_RESET_THRESHOLD - 1)).toBe(false);
  });

  it("resets at exactly the threshold", () => {
    expect(shouldSendRequestToBackOfLine(REQUEST_RESET_THRESHOLD)).toBe(true);
  });

  it("resets above the threshold", () => {
    expect(shouldSendRequestToBackOfLine(REQUEST_RESET_THRESHOLD + 50)).toBe(true);
  });
});

describe("computeTurnCreditAfterVisit", () => {
  it("accumulates partial credit for a visit under a full turn", () => {
    const result = computeTurnCreditAfterVisit(0, MINUTES_PER_TURN / 2);
    expect(result.sendToBack).toBe(false);
    expect(result.newCredit).toBeCloseTo(0.5);
  });

  it("carries forward existing partial credit across visits", () => {
    const result = computeTurnCreditAfterVisit(0.4, MINUTES_PER_TURN * 0.4);
    expect(result.sendToBack).toBe(false);
    expect(result.newCredit).toBeCloseTo(0.8);
  });

  it("sends to the back of the line once credit reaches exactly a full turn", () => {
    const result = computeTurnCreditAfterVisit(0, MINUTES_PER_TURN);
    expect(result.sendToBack).toBe(true);
    expect(result.newCredit).toBe(0);
  });

  it("sends to the back of the line when a visit pushes credit over a full turn", () => {
    const result = computeTurnCreditAfterVisit(0.9, MINUTES_PER_TURN);
    expect(result.sendToBack).toBe(true);
    expect(result.newCredit).toBe(0);
  });

  it("resets to exactly 0 on completion, never a leftover fractional overflow", () => {
    // A long visit should never leave "extra" credit sitting around after a
    // turn completes — it's a hard reset, not a rolling balance.
    const result = computeTurnCreditAfterVisit(0, MINUTES_PER_TURN * 3);
    expect(result.newCredit).toBe(0);
  });
});
