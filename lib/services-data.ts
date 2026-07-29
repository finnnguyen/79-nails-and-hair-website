import { supabase } from "@/lib/supabase/client";

export type ServiceCategory = "Nail Services" | "Hair Services" | "Facial Services";

export type Service = {
  id: string;
  name: string;
  category: ServiceCategory;
  price: number;
  startingAt?: boolean;
  note?: string;
  /** Nail add-ons (gel, design, polish change...) — always paired with a core nail service. */
  addon?: boolean;
  /** Default duration; a specific staff member may override this — see getEffectiveDuration. */
  durationMinutes: number;
};

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  "Nail Services",
  "Hair Services",
  "Facial Services",
];

export async function getServices(): Promise<Service[]> {
  const { data, error } = await supabase
    .from("services")
    .select("id, name, category, price, starting_at, note, addon, duration_minutes")
    .order("sort_order", { ascending: true });

  if (error) throw error;

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    category: row.category,
    price: Number(row.price),
    startingAt: row.starting_at || undefined,
    note: row.note ?? undefined,
    addon: row.addon || undefined,
    durationMinutes: row.duration_minutes,
  }));
}
