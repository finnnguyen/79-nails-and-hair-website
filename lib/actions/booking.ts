"use server";

import { randomUUID } from "node:crypto";
import { z } from "zod";
import { supabase } from "@/lib/supabase/client";
import { sendBookingEmails } from "@/lib/email";
import { getTotalDuration } from "@/lib/actions/availability";

const bookingInputSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(200),
    email: z.union([z.string().trim().max(320).email("Invalid email"), z.literal("")]),
    phone: z.string().trim().max(30),
    staffId: z.string().trim().min(1, "Choose a staff member"),
    staffName: z.string().trim().min(1),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
    // Matches the format the bookings_set_time_range DB trigger expects
    // (to_timestamp(..., 'HH12:MI AM')) — catch a malformed value here with
    // a clean message instead of a raw Postgres trigger error.
    time: z.string().regex(/^\d{1,2}:\d{2} (AM|PM)$/, "Invalid time"),
    services: z
      .array(
        z.object({
          id: z.string().trim().min(1),
          name: z.string().trim().min(1),
          price: z.number().nonnegative(),
        })
      )
      .min(1, "Choose at least one service"),
  })
  .refine((data) => data.email !== "" || data.phone !== "", {
    message: "Provide an email or phone number",
    path: ["email"],
  });

export type BookingInput = z.infer<typeof bookingInputSchema>;

export type BookingResult =
  | { success: true; bookingId: string }
  | { success: false; error: string; slotTaken?: boolean };

export async function submitBooking(rawInput: BookingInput): Promise<BookingResult> {
  const parsed = bookingInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid booking details" };
  }
  const input = parsed.data;

  const total = input.services.reduce((sum, s) => sum + s.price, 0);
  // Never trust a client-supplied duration — it directly gates the
  // no-overlap database constraint, so it must be computed authoritatively.
  const durationMinutes = await getTotalDuration(
    input.staffId,
    input.services.map((s) => s.id)
  );

  // Bookings has no public SELECT policy (it holds other customers' contact
  // info), so we can't use .select() to read the row back after insert —
  // Postgres RLS rejects INSERT ... RETURNING without a matching SELECT
  // policy. Generate the id up front instead.
  const bookingId = randomUUID();

  const { error: bookingError } = await supabase.from("bookings").insert({
    id: bookingId,
    customer_name: input.name,
    customer_email: input.email || null,
    customer_phone: input.phone || null,
    staff_id: input.staffId,
    appointment_date: input.date,
    appointment_time: input.time,
    duration_minutes: durationMinutes,
    // Overwritten by the bookings_set_time_range_trigger from
    // appointment_date/appointment_time/duration_minutes — placeholders
    // only to satisfy the (required) insert type.
    starts_at: new Date().toISOString(),
    ends_at: new Date().toISOString(),
    total_price: total,
  });

  if (bookingError) {
    // Postgres exclusion_violation — the bookings_no_overlap constraint
    // caught a race: this staff member already has an overlapping booking.
    if (bookingError.code === "23P01") {
      return {
        success: false,
        error: "That time was just booked by someone else — please pick another time.",
        slotTaken: true,
      };
    }
    return { success: false, error: bookingError.message };
  }

  const { error: servicesError } = await supabase.from("booking_services").insert(
    input.services.map((s) => ({
      booking_id: bookingId,
      service_id: s.id,
      service_name: s.name,
      price: s.price,
    }))
  );

  if (servicesError) {
    return { success: false, error: servicesError.message };
  }

  await sendBookingEmails({
    customerName: input.name,
    customerEmail: input.email || null,
    staffName: input.staffName,
    date: input.date,
    time: input.time,
    services: input.services,
    total,
  });

  return { success: true, bookingId };
}
