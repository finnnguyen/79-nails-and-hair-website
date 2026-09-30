export const BUSINESS = {
  phone: "(714) 879-8229",
  phoneHref: "tel:+17148798229",
  address: "149 N Raymond Ave, Fullerton, CA",
  addressHref: "https://maps.google.com/?q=149+N+Raymond+Ave,+Fullerton,+CA",
  // Where new-booking notifications go. While Resend is in sandbox mode
  // (no verified domain), this MUST be the email the Resend account was
  // signed up with, or sends to it will bounce.
  notificationEmail: "tanthien@csu.fullerton.edu",
  mapEmbedSrc:
    "https://www.google.com/maps?q=149+N+Raymond+Ave,+Fullerton,+CA&output=embed",
  hours: [
    { days: "Tuesday – Saturday", time: "9:10 AM – 7:00 PM" },
    { days: "Sunday", time: "9:10 AM – 6:00 PM" },
    { days: "Monday", time: "Closed" },
  ],
  /** Machine-readable version of `hours`, indexed by day of week (0 = Sunday).
   * Minutes since midnight, salon-local (Pacific) time; null = closed. */
  schedule: [
    { open: 9 * 60 + 10, close: 18 * 60 },
    null,
    { open: 9 * 60 + 10, close: 19 * 60 },
    { open: 9 * 60 + 10, close: 19 * 60 },
    { open: 9 * 60 + 10, close: 19 * 60 },
    { open: 9 * 60 + 10, close: 19 * 60 },
    { open: 9 * 60 + 10, close: 19 * 60 },
  ],
  timeZone: "America/Los_Angeles",
} as const;
