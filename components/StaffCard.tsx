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
    <div className="group flex flex-col rounded-sm border border-border bg-surface p-5 transition-colors hover:border-foreground/40">
      {staff.photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={staff.photoUrl}
          alt={staff.name}
          className="aspect-[4/3] w-full rounded-sm object-cover"
        />
      ) : (
        <span className="flex aspect-[4/3] items-end rounded-sm bg-gold-tint p-5 transition-colors duration-300 group-hover:bg-brand">
          <span className="font-display text-8xl leading-none text-foreground/15 transition-colors duration-300 group-hover:text-white/40">
            {staff.name.charAt(0)}
          </span>
        </span>
      )}
      <div className="mt-5 px-2">
        <h3 className="font-display text-2xl leading-tight text-foreground">
          {staff.name}
        </h3>
        <p className="text-sm text-muted">{staff.role}</p>
      </div>

      {staff.specialties.length > 0 && (
        <div className="mx-2 mt-5 border-t border-border pt-5">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
            Specialties
          </p>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {staff.specialties.map((specialty) => (
              <li key={specialty.label}>
                <Link
                  href={specialtyHref(staff.id, specialty)}
                  className="block rounded-sm border border-border px-2.5 py-1 text-xs text-foreground transition-colors hover:border-foreground"
                >
                  {specialty.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Link
        href={`/book?staff=${staff.id}`}
        className="mx-2 mb-2 mt-auto pt-7 text-sm font-medium text-foreground underline decoration-border underline-offset-[6px] hover:decoration-foreground"
      >
        Book with {staff.name}
      </Link>
    </div>
  );
}
