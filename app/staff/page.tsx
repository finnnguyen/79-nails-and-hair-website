import StaffCard from "@/components/StaffCard";
import { getStaff } from "@/lib/staff-data";

// Same reasoning as app/services/page.tsx — keep this in sync with Supabase.
export const revalidate = 60;

export default async function StaffPage() {
  const staff = await getStaff();

  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <h1 className="font-display text-4xl text-foreground md:text-5xl">
        Staff
      </h1>
      <p className="mt-3 max-w-xl text-muted">
        Meet the nail techs and stylists at 79 Nails &amp; Hair.
      </p>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {staff.map((member) => (
          <StaffCard key={member.id} staff={member} />
        ))}
      </div>
    </div>
  );
}
