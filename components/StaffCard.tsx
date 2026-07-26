import Link from "next/link";
import type { Staff } from "@/lib/staff-data";

function specialtyHref(staffId: string, specialty: Staff["specialties"][number]) {
  const params = new URLSearchParams({ staff: staffId });
  if (specialty.serviceId) params.set("service", specialty.serviceId);
  else if (specialty.category) params.set("category", specialty.category);
  return `/book?${params.toString()}`;
}

export default function StaffCard({ staff }: { staff: Staff }) {
  return (
    <div className="flex flex-col items-start gap-4 rounded-2xl border border-border bg-surface p-6">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-tint font-display text-2xl text-brand">
        {staff.name.charAt(0)}
      </span>
      <div>
        <h3 className="font-display text-lg text-foreground">{staff.name}</h3>
        <p className="text-sm text-brand">{staff.role}</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {staff.specialties.map((specialty) => (
          <Link
            key={specialty.label}
            href={specialtyHref(staff.id, specialty)}
            className="rounded-full bg-gold-tint px-3 py-1 text-xs text-brand-dark transition-colors hover:bg-gold hover:text-white"
          >
            {specialty.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
