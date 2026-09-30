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
    <div className="flex flex-col bg-surface p-7">
      <div className="flex items-center gap-4">
        {staff.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={staff.photoUrl}
            alt=""
            className="h-14 w-14 shrink-0 object-cover"
          />
        ) : (
          <span className="flex h-14 w-14 shrink-0 items-center justify-center border border-border bg-background font-display text-2xl text-foreground">
            {staff.name.charAt(0)}
          </span>
        )}
        <div>
          <h3 className="font-display text-2xl leading-tight text-foreground">
            {staff.name}
          </h3>
          <p className="text-sm text-muted">{staff.role}</p>
        </div>
      </div>

      {staff.specialties.length > 0 && (
        <div className="mt-6 border-t border-border pt-5">
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
        className="mt-auto pt-7 text-sm font-medium text-foreground underline decoration-border underline-offset-[6px] hover:decoration-foreground"
      >
        Book with {staff.name}
      </Link>
    </div>
  );
}
