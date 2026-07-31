"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { ServiceCategory } from "@/lib/services-data";
import { toPacificDateAndMinutes } from "@/lib/booking-availability";

/** Throws a single clean Error (matching this file's existing throw-on-invalid
 * convention) instead of a raw ZodError. */
function parseOrThrow<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new Error(result.error.issues[0]?.message ?? "Invalid input");
  }
  return result.data;
}

const MINUTES_PER_TURN = 35;
const REQUEST_RESET_THRESHOLD = 30; // $ — by-request visits at/above this reset the stylist to 0

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

async function requireStaff(supabase: SupabaseClient) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Not authenticated");
}

function requireNonNegativeMoney(value: number, field = "Price") {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${field} must be a non-negative number`);
  }
}

export type StaffAvailability =
  | { status: "free" }
  | { status: "busy"; freeAt: string; reason: "walk-in" | "appointment" }
  | { status: "appointment-soon"; freeAt: string };

export type RotationEntry = {
  staffId: string;
  name: string;
  categories: ServiceCategory[];
  turnCredit: number;
  lastTurnAt: string;
  present: boolean;
  queuePosition: number;
  availability: StaffAvailability;
};

async function resetStaleRotationRows() {
  const supabase = await createClient();
  const today = toPacificDateAndMinutes(new Date().toISOString()).date;

  const { data: stale, error } = await supabase
    .from("staff_rotation")
    .select("staff_id, staff:staff_id(sort_order)")
    .lt("rotation_date", today);
  if (error) throw error;

  if (!stale || stale.length === 0) return;

  const resets = await Promise.all(
    stale.map((row) =>
      supabase
        .from("staff_rotation")
        .update({
          turn_credit: 0,
          last_turn_at: new Date().toISOString(),
          rotation_date: today,
          queue_position: row.staff?.sort_order ?? 0,
        })
        .eq("staff_id", row.staff_id)
    )
  );
  const resetError = resets.find((result) => result.error)?.error;
  if (resetError) throw resetError;
}

async function computeAvailability(
  staffIds: string[]
): Promise<Record<string, StaffAvailability>> {
  const supabase = await createClient();
  const now = new Date();
  const soon = new Date(now.getTime() + 30 * 60 * 1000);

  const [{ data: bookings }, { data: activeWalkIns }] = await Promise.all([
    supabase
      .from("bookings")
      .select("staff_id, starts_at, ends_at")
      .in("staff_id", staffIds)
      .neq("status", "cancelled")
      .gt("ends_at", now.toISOString()),
    supabase
      .from("walk_ins")
      .select("staff_id, started_at, duration_minutes")
      .in("staff_id", staffIds)
      .eq("status", "in_progress"),
  ]);

  const result: Record<string, StaffAvailability> = {};
  for (const id of staffIds) result[id] = { status: "free" };

  for (const b of bookings ?? []) {
    if (!b.staff_id) continue;
    const starts = new Date(b.starts_at);
    const ends = new Date(b.ends_at);
    if (starts <= now && now < ends) {
      result[b.staff_id] = { status: "busy", freeAt: b.ends_at, reason: "appointment" };
    } else if (starts > now && starts <= soon) {
      const existing = result[b.staff_id];
      if (existing.status !== "busy") {
        result[b.staff_id] = { status: "appointment-soon", freeAt: b.ends_at };
      }
    }
  }

  for (const w of activeWalkIns ?? []) {
    if (!w.staff_id || !w.started_at) continue;
    const freeAt = new Date(
      new Date(w.started_at).getTime() + w.duration_minutes * 60 * 1000
    );
    result[w.staff_id] = { status: "busy", freeAt: freeAt.toISOString(), reason: "walk-in" };
  }

  return result;
}

export async function getRotationBoard(): Promise<RotationEntry[]> {
  const supabase = await createClient();
  await requireStaff(supabase);
  await resetStaleRotationRows();

  const { data: staff, error: staffError } = await supabase
    .from("staff")
    .select(
      "id, name, categories, sort_order, staff_rotation(turn_credit, last_turn_at, present, queue_position)"
    )
    .order("sort_order", { ascending: true });

  if (staffError) throw staffError;

  const staffIds = staff.map((s) => s.id);
  const availability = await computeAvailability(staffIds);

  const entries: RotationEntry[] = staff.map((s) => {
    const rotation = s.staff_rotation;
    return {
      staffId: s.id,
      name: s.name,
      categories: s.categories,
      turnCredit: rotation?.turn_credit ?? 0,
      lastTurnAt: rotation?.last_turn_at ?? new Date().toISOString(),
      present: rotation?.present ?? true,
      queuePosition: rotation?.queue_position ?? 0,
      availability: availability[s.id] ?? { status: "free" },
    };
  });

  // Queue position is the source of truth for order — it's what "Move
  // Up"/"Move Down" adjust directly, and what completing a full turn resets
  // to the back of. Partial-turn completions leave it untouched, which is
  // exactly the "stays at front until a full turn" behavior.
  entries.sort((a, b) => a.queuePosition - b.queuePosition);

  return entries;
}

/** Swaps a staff member's queue position with their neighbor in the current
 * order — manual override, since the automatic rotation isn't always right. */
async function swapWithNeighbor(staffId: string, direction: "up" | "down") {
  const board = await getRotationBoard();
  const index = board.findIndex((r) => r.staffId === staffId);
  if (index === -1) return;
  const neighborIndex = direction === "up" ? index - 1 : index + 1;
  if (neighborIndex < 0 || neighborIndex >= board.length) return;

  const supabase = await createClient();
  const current = board[index];
  const neighbor = board[neighborIndex];

  await Promise.all([
    supabase
      .from("staff_rotation")
      .update({ queue_position: neighbor.queuePosition })
      .eq("staff_id", current.staffId),
    supabase
      .from("staff_rotation")
      .update({ queue_position: current.queuePosition })
      .eq("staff_id", neighbor.staffId),
  ]);

  revalidatePath("/admin/turns");
}

export async function moveStaffUp(staffId: string) {
  await swapWithNeighbor(staffId, "up");
}

export async function moveStaffDown(staffId: string) {
  await swapWithNeighbor(staffId, "down");
}

export async function setStaffPresence(staffId: string, present: boolean) {
  const supabase = await createClient();
  await requireStaff(supabase);
  const { error } = await supabase
    .from("staff_rotation")
    .update({ present })
    .eq("staff_id", staffId);
  if (error) throw error;
  revalidatePath("/admin/turns");
}

export type WaitingWalkIn = {
  id: string;
  customerName: string | null;
  status: "waiting" | "in_progress";
  requestedAt: string;
  startedAt: string | null;
  staffId: string | null;
  staffName: string | null;
  isRequest: boolean;
  totalPrice: number;
  durationMinutes: number;
  services: string[];
  categories: ServiceCategory[];
};

export async function getWaitingQueue(): Promise<WaitingWalkIn[]> {
  const supabase = await createClient();
  await requireStaff(supabase);
  const { data, error } = await supabase
    .from("walk_ins")
    .select(
      "id, customer_name, status, requested_at, started_at, is_request, total_price, duration_minutes, staff:staff_id(id, name), walk_in_services(service_name, services(category))"
    )
    .in("status", ["waiting", "in_progress"])
    .order("requested_at", { ascending: true });

  if (error) throw error;

  return data.map((w) => ({
    id: w.id,
    customerName: w.customer_name,
    status: w.status as "waiting" | "in_progress",
    requestedAt: w.requested_at,
    startedAt: w.started_at,
    staffId: w.staff?.id ?? null,
    staffName: w.staff?.name ?? null,
    isRequest: w.is_request,
    totalPrice: Number(w.total_price),
    durationMinutes: w.duration_minutes,
    services: w.walk_in_services.map((s) => s.service_name),
    categories: Array.from(
      new Set(
        w.walk_in_services
          .map((s) => s.services?.category)
          .filter((c): c is ServiceCategory => Boolean(c))
      )
    ),
  }));
}

export type CompletedTurn = {
  id: string;
  staffId: string | null;
  staffName: string | null;
  customerName: string | null;
  services: string[];
  totalPrice: number;
  isRequest: boolean;
  completedAt: string;
};

/** Every completed walk-in for the current Pacific calendar day, most recent
 * first — the raw log a front-desk audit ("which turn is wrong?") needs.
 * Daily earnings per staff are just an aggregate over this same list. */
export async function getDailyTurns(): Promise<CompletedTurn[]> {
  const supabase = await createClient();
  await requireStaff(supabase);
  const now = new Date();
  const todayDate = toPacificDateAndMinutes(now.toISOString()).date;
  // A 26h lookback comfortably covers a full Pacific calendar day regardless
  // of UTC offset/DST — the exact boundary is enforced by the date match below.
  const since = new Date(now.getTime() - 26 * 60 * 60 * 1000);

  const { data, error } = await supabase
    .from("walk_ins")
    .select(
      "id, customer_name, total_price, completed_at, is_request, staff:staff_id(id, name), walk_in_services(service_name)"
    )
    .eq("status", "completed")
    .gte("completed_at", since.toISOString())
    .order("completed_at", { ascending: false });
  if (error) throw error;

  return (data ?? [])
    .filter((w) => w.completed_at && toPacificDateAndMinutes(w.completed_at).date === todayDate)
    .map((w) => ({
      id: w.id,
      staffId: w.staff?.id ?? null,
      staffName: w.staff?.name ?? null,
      customerName: w.customer_name,
      services: w.walk_in_services.map((s) => s.service_name),
      totalPrice: Number(w.total_price),
      isRequest: w.is_request,
      completedAt: w.completed_at!,
    }));
}

const checkInInputSchema = z
  .object({
    customerName: z.string().trim().max(200),
    isRequest: z.boolean(),
    requestedStaffId: z.string().trim().min(1).nullable(),
    services: z
      .array(
        z.object({
          id: z.string().trim().min(1),
          name: z.string().trim().min(1),
          price: z.number().nonnegative(),
          durationMinutes: z.number().int().positive(),
        })
      )
      .min(1, "Choose at least one service"),
  })
  .refine((data) => !data.isRequest || data.requestedStaffId, {
    message: "Choose the requested stylist",
    path: ["requestedStaffId"],
  })
  .refine((data) => new Set(data.services.map((s) => s.id)).size === data.services.length, {
    message: "Duplicate services are not allowed",
    path: ["services"],
  });

export type CheckInInput = z.infer<typeof checkInInputSchema>;

export async function checkInWalkIn(rawInput: CheckInInput): Promise<string> {
  const supabase = await createClient();
  await requireStaff(supabase);
  const input = parseOrThrow(checkInInputSchema, rawInput);

  const serviceIds = [...new Set(input.services.map((service) => service.id))];

  const { data: catalogServices, error: catalogError } = await supabase
    .from("services")
    .select("id, name, duration_minutes")
    .in("id", serviceIds);
  if (catalogError) throw catalogError;
  if (catalogServices.length !== serviceIds.length) throw new Error("One or more services are invalid");

  const submittedById = new Map(input.services.map((service) => [service.id, service]));
  const services = catalogServices.map((service) => {
    const submitted = submittedById.get(service.id)!;
    requireNonNegativeMoney(submitted.price);
    return {
      id: service.id,
      name: service.name,
      price: submitted.price,
      durationMinutes: service.duration_minutes,
    };
  });

  const walkInId = randomUUID();
  const durationMinutes = services.reduce((sum, service) => sum + service.durationMinutes, 0);
  const totalPrice = services.reduce((sum, service) => sum + service.price, 0);

  const { error } = await supabase.from("walk_ins").insert({
    id: walkInId,
    customer_name: input.customerName || null,
    status: "waiting",
    is_request: input.isRequest,
    staff_id: input.isRequest ? input.requestedStaffId : null,
    duration_minutes: durationMinutes,
    total_price: totalPrice,
  });
  if (error) throw error;

  const { error: servicesError } = await supabase.from("walk_in_services").insert(
    services.map((s) => ({
      walk_in_id: walkInId,
      service_id: s.id,
      service_name: s.name,
      price: s.price,
    }))
  );
  if (servicesError) throw servicesError;

  revalidatePath("/admin/turns");
  return walkInId;
}

export async function assignWalkIn(walkInId: string, staffId: string) {
  const supabase = await createClient();
  await requireStaff(supabase);
  const { data, error } = await supabase
    .from("walk_ins")
    .update({ staff_id: staffId, status: "in_progress", started_at: new Date().toISOString() })
    .eq("id", walkInId)
    .eq("status", "waiting")
    .select("id")
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("This walk-in is no longer waiting");
  revalidatePath("/admin/turns");
}

export async function cancelWalkIn(walkInId: string) {
  const supabase = await createClient();
  await requireStaff(supabase);
  const { data, error } = await supabase
    .from("walk_ins")
    .update({ status: "cancelled" })
    .eq("id", walkInId)
    .eq("status", "waiting")
    .select("id")
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("This walk-in is no longer waiting");
  revalidatePath("/admin/turns");
}

export async function completeWalkIn(walkInId: string) {
  const supabase = await createClient();
  await requireStaff(supabase);

  const { data: walkIn, error: fetchError } = await supabase
    .from("walk_ins")
    .select("staff_id, duration_minutes, total_price, is_request")
    .eq("id", walkInId)
    .eq("status", "in_progress")
    .single();
  if (fetchError) throw fetchError;

  const { data: completed, error: completeError } = await supabase
    .from("walk_ins")
    .update({ status: "completed", completed_at: new Date().toISOString() })
    .eq("id", walkInId)
    .eq("status", "in_progress")
    .select("id")
    .maybeSingle();
  if (completeError) throw completeError;
  if (!completed) throw new Error("This walk-in has already been completed");

  if (walkIn.staff_id) {
    await applyTurnCredit(walkIn.staff_id, {
      durationMinutes: walkIn.duration_minutes,
      isRequest: walkIn.is_request,
      totalPrice: Number(walkIn.total_price),
    });
  }

  revalidatePath("/admin/turns");
}

export async function updateTurnPrice(walkInId: string, price: number) {
  const supabase = await createClient();
  await requireStaff(supabase);
  requireNonNegativeMoney(price);
  const { error } = await supabase
    .from("walk_ins")
    .update({ total_price: price })
    .eq("id", walkInId)
    .eq("status", "completed");
  if (error) throw error;
  revalidatePath("/admin/turns");
}

/** Removes a completed turn from the log entirely — e.g. it was logged for the
 * wrong staff member or shouldn't have been recorded at all. This only
 * corrects the earnings record; it doesn't try to reverse the turn-credit or
 * queue-position change that completing it applied, since other turns may
 * have already happened since. Use Move Up/Down to fix rotation order if a
 * bad entry threw it off. */
export async function deleteTurn(walkInId: string) {
  const supabase = await createClient();
  await requireStaff(supabase);
  const { error } = await supabase
    .from("walk_ins")
    .delete()
    .eq("id", walkInId)
    .eq("status", "completed");
  if (error) throw error;
  revalidatePath("/admin/turns");
}

const manualTurnInputSchema = z.object({
  staffId: z.string().trim().min(1),
  customerName: z.string().trim().max(200),
  serviceName: z.string().trim().max(200),
  price: z.number().nonnegative(),
  // ISO — lets it slot into the right spot in the log.
  completedAt: z.string().refine((v) => !Number.isNaN(new Date(v).getTime()), {
    message: "Completion time is invalid",
  }),
});

export type ManualTurnInput = z.infer<typeof manualTurnInputSchema>;

/** Directly logs a completed turn that was missed at check-in time — e.g. a
 * walk-in that got done without ever being entered into the queue. Like
 * delete/price-edit, this only writes the log/earnings record; it doesn't
 * touch turn credit or queue position. */
export async function addManualTurn(rawInput: ManualTurnInput) {
  const supabase = await createClient();
  await requireStaff(supabase);
  const input = parseOrThrow(manualTurnInputSchema, rawInput);
  const completedAt = new Date(input.completedAt);
  const walkInId = randomUUID();

  const { error } = await supabase.from("walk_ins").insert({
    id: walkInId,
    customer_name: input.customerName || null,
    status: "completed",
    is_request: false,
    staff_id: input.staffId,
    duration_minutes: 0,
    total_price: input.price,
    requested_at: completedAt.toISOString(),
    started_at: completedAt.toISOString(),
    completed_at: completedAt.toISOString(),
  });
  if (error) throw error;

  const { error: servicesError } = await supabase.from("walk_in_services").insert({
    walk_in_id: walkInId,
    service_name: input.serviceName || "Manual entry",
    price: input.price,
  });
  if (servicesError) throw servicesError;

  revalidatePath("/admin/turns");
}

async function sendToBackOfLine(staffId: string) {
  const supabase = await createClient();
  const { data: maxRow } = await supabase
    .from("staff_rotation")
    .select("queue_position")
    .order("queue_position", { ascending: false })
    .limit(1)
    .single();

  const { error } = await supabase
    .from("staff_rotation")
    .update({
      turn_credit: 0,
      last_turn_at: new Date().toISOString(),
      queue_position: (maxRow?.queue_position ?? 0) + 1,
    })
    .eq("staff_id", staffId);
  if (error) throw error;
}

async function applyTurnCredit(
  staffId: string,
  visit: { durationMinutes: number; isRequest: boolean; totalPrice: number }
) {
  const supabase = await createClient();

  if (visit.isRequest) {
    // Under-threshold requests don't touch rotation at all; at/above it,
    // treat as a completed full turn (reset + back of line), same as
    // normal rotation work.
    if (visit.totalPrice < REQUEST_RESET_THRESHOLD) return;
    await sendToBackOfLine(staffId);
    return;
  }

  const { data: current, error: fetchError } = await supabase
    .from("staff_rotation")
    .select("turn_credit")
    .eq("staff_id", staffId)
    .single();
  if (fetchError) throw fetchError;

  const newCredit = Number(current.turn_credit) + visit.durationMinutes / MINUTES_PER_TURN;

  if (newCredit >= 1) {
    await sendToBackOfLine(staffId);
    return;
  }

  const { error } = await supabase
    .from("staff_rotation")
    .update({ turn_credit: newCredit })
    .eq("staff_id", staffId);
  if (error) throw error;
}
