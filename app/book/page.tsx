import BookingWizard from "@/components/BookingWizard";
import { getServices, SERVICE_CATEGORIES, type ServiceCategory } from "@/lib/services-data";
import { getStaff } from "@/lib/staff-data";

type SearchParams = Promise<{
  service?: string;
  staff?: string;
  category?: string;
}>;

export default async function BookPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const [services, staff] = await Promise.all([getServices(), getStaff()]);

  const initialCategory = SERVICE_CATEGORIES.includes(
    params.category as ServiceCategory
  )
    ? (params.category as ServiceCategory)
    : undefined;

  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <BookingWizard
        services={services}
        staff={staff}
        initialServiceId={params.service}
        initialStaffId={params.staff}
        initialCategory={initialCategory}
      />
    </div>
  );
}
