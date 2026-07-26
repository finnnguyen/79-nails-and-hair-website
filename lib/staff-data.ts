import type { ServiceCategory } from "@/lib/services-data";
import { supabase } from "@/lib/supabase/client";

export type StaffRole = "Nail Tech" | "Hair Stylist" | "Hair Stylist & Nail Tech";

export type Specialty = {
  label: string;
  /** Links straight to a specific service id when the specialty maps 1:1 to one. */
  serviceId?: string;
  /** Links to a service category when the specialty spans multiple services. */
  category?: ServiceCategory;
};

export type Staff = {
  id: string;
  name: string;
  role: StaffRole;
  /** Categories this staff member can be booked for. */
  categories: ServiceCategory[];
  specialties: Specialty[];
  photoUrl?: string;
};

export async function getStaff(): Promise<Staff[]> {
  const { data, error } = await supabase
    .from("staff")
    .select(
      "id, name, role, categories, photo_url, staff_specialties(label, service_id, category, sort_order)"
    )
    .order("sort_order", { ascending: true })
    .order("sort_order", { ascending: true, referencedTable: "staff_specialties" });

  if (error) throw error;

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    role: row.role,
    categories: row.categories,
    photoUrl: row.photo_url ?? undefined,
    specialties: row.staff_specialties.map((s) => ({
      label: s.label,
      serviceId: s.service_id ?? undefined,
      category: s.category ?? undefined,
    })),
  }));
}
