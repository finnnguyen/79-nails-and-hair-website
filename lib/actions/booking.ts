"use server";

import { randomUUID } from "node:crypto";
import { supabase } from "@/lib/supabase/client";
import { sendBookingEmails } from "@/lib/email";

export type BookingInput = {
  name: string;
  email: string;
  phone: string;
  staffId: string;
  staffName: string;
  date: string;
  time: string;
  services: { id: string; name: string; price: number }[];
};

export type BookingResult =
  | { success: true; bookingId: string }
  | { success: false; error: string; slotTaken?: boolean };

export async function submitBooking(input: BookingInput): Promise<BookingResult> {
  const total = input.services.reduce((sum, s) => sum + s.price, 0);
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
    total_price: total,
  });

  if (bookingError) {
    // Postgres unique_violation — the bookings_no_double_booking index caught
    // a race: someone else booked this exact staff+date+time first.
    if (bookingError.code === "23505") {
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
