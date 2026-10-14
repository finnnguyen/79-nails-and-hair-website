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
    <div className="group grid grid-cols-[4.5rem_1fr] items-center gap-x-4 rounded-sm border border-border bg-surface p-4 transition-colors hover:border-foreground/40 sm:flex sm:flex-col sm:items-stretch sm:p-5">
      {staff.photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={staff.photoUrl}
          alt={staff.name}
          className="aspect-square w-full rounded-sm object-cover sm:aspect-[4/3]"
        />
      ) : (
        <span className="flex aspect-square items-end rounded-sm bg-gold-tint p-2 transition-colors duration-300 group-hover:bg-brand sm:aspect-[4/3] sm:p-5">
          <span className="font-display text-5xl leading-none sm:text-8xl text-foreground/15 transition-colors duration-300 group-hover:text-white/40">
            {staff.name.charAt(0)}
          </span>
        </span>
      )}
      <div className="min-w-0 sm:mt-5 sm:px-2">
        <h3 className="font-display text-xl leading-tight text-foreground sm:text-2xl">
          {staff.name}
        </h3>
        <p className="text-sm text-muted">{staff.role}</p>
      </div>

      {staff.specialties.length > 0 && (
        <div className="col-span-2 mt-4 border-t border-border pt-4 sm:mx-2 sm:mt-5 sm:pt-5">
          <p className="sr-only text-xs font-medium uppercase tracking-[0.16em] text-muted sm:not-sr-only">
            Specialties
          </p>
          <ul className="flex flex-wrap gap-1.5 sm:mt-3">
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
        className="col-span-2 mt-4 text-sm font-medium sm:mx-2 sm:mb-2 sm:mt-auto sm:pt-7 text-foreground underline decoration-border underline-offset-[6px] hover:decoration-foreground"
      >
        Book with {staff.name}
      </Link>
    </div>
  );
}
