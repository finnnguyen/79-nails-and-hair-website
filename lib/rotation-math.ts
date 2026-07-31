export const MINUTES_PER_TURN = 35;
// $ — by-request visits at/above this reset the stylist to 0.
export const REQUEST_RESET_THRESHOLD = 30;

/** By-request visits under the threshold don't touch rotation at all; at/above
 * it, they count as a completed full turn (reset + back of line). */
export function shouldSendRequestToBackOfLine(totalPrice: number): boolean {
  return totalPrice >= REQUEST_RESET_THRESHOLD;
}

/** Accumulates partial-turn credit for a normal (non-request) visit. Once
 * accrued credit reaches a full turn (>=1), the stylist goes to the back of
 * the line and their credit resets — otherwise the partial credit carries
 * forward to the next visit. */
export function computeTurnCreditAfterVisit(
  currentCredit: number,
  durationMinutes: number
): { sendToBack: boolean; newCredit: number } {
  const newCredit = currentCredit + durationMinutes / MINUTES_PER_TURN;
  if (newCredit >= 1) {
    return { sendToBack: true, newCredit: 0 };
  }
  return { sendToBack: false, newCredit };
}
