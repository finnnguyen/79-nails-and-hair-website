"use server";

import { supabase } from "@/lib/supabase/client";

export type BookedSlot = { date: string; time: string };

/** Already-taken (date, time) slots for a staff member, read from a narrow
 * public view that excludes customer name/email/phone. */
export async function getBookedSlots(staffId: string): Promise<BookedSlot[]> {
  const { data, error } = await supabase
    .from("booked_slots")
    .select("appointment_date, appointment_time")
    .eq("staff_id", staffId);

  if (error) throw error;

  return data
    .filter((row) => row.appointment_date && row.appointment_time)
    .map((row) => ({ date: row.appointment_date!, time: row.appointment_time! }));
}
