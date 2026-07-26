"use client";

import { useTransition } from "react";
import { updateBookingStatus } from "@/lib/actions/bookings-admin";
import type { Enums } from "@/lib/supabase/database.types";

const STATUSES: Enums<"booking_status">[] = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
];

export default function BookingStatusSelect({
  bookingId,
  status,
}: {
  bookingId: string;
  status: Enums<"booking_status">;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      value={status}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value as Enums<"booking_status">;
        startTransition(() => updateBookingStatus(bookingId, next));
      }}
      className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-foreground outline-none focus:border-brand disabled:opacity-50"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
