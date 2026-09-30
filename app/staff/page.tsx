import PageHeader from "@/components/PageHeader";
import StaffCard from "@/components/StaffCard";
import { getStaff } from "@/lib/staff-data";

// Same reasoning as app/services/page.tsx — keep this in sync with Supabase.
export const revalidate = 60;

export const metadata = { title: "Our Team" };

export default async function StaffPage() {
  const staff = await getStaff();

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
      <PageHeader eyebrow="Our team" title="Nail techs & stylists">
        Tap a specialty to book it with that person directly.
      </PageHeader>

      <div className="mt-10 grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {staff.map((member) => (
          <StaffCard key={member.id} staff={member} />
        ))}
      </div>
    </div>
  );
}
