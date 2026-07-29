"use server";

import { supabase } from "@/lib/supabase/client";

export type BookedRange = { startsAt: string; endsAt: string };

/** Already-taken time ranges for a staff member, read from a narrow public
 * view that excludes customer name/email/phone. */
export async function getBookedRanges(staffId: string): Promise<BookedRange[]> {
  const { data, error } = await supabase
    .from("booked_slots")
    .select("starts_at, ends_at")
    .eq("staff_id", staffId);

  if (error) throw error;

  return data
    .filter((row) => row.starts_at && row.ends_at)
    .map((row) => ({ startsAt: row.starts_at!, endsAt: row.ends_at! }));
}

/** Per-service duration overrides for a staff member, keyed by service id.
 * Services with no entry here should fall back to the service's own default. */
export async function getStaffDurationOverrides(
  staffId: string
): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from("staff_service_durations")
    .select("service_id, duration_minutes")
    .eq("staff_id", staffId);

  if (error) throw error;

  return Object.fromEntries(data.map((row) => [row.service_id, row.duration_minutes]));
}

/** Authoritative total duration for a set of services with a given staff
 * member — always computed server-side (never trust a client-supplied
 * duration here, since it directly gates the no-overlap guarantee). */
export async function getTotalDuration(
  staffId: string,
  serviceIds: string[]
): Promise<number> {
  const [{ data: services, error: servicesError }, { data: overrides, error: overridesError }] =
    await Promise.all([
      supabase.from("services").select("id, duration_minutes").in("id", serviceIds),
      supabase
        .from("staff_service_durations")
        .select("service_id, duration_minutes")
        .eq("staff_id", staffId)
        .in("service_id", serviceIds),
    ]);

  if (servicesError) throw servicesError;
  if (overridesError) throw overridesError;

  const overrideMap = Object.fromEntries(
    overrides.map((row) => [row.service_id, row.duration_minutes])
  );

  return services.reduce(
    (sum, s) => sum + (overrideMap[s.id] ?? s.duration_minutes),
    0
  );
}
