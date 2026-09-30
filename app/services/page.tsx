import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import ServicesBrowser from "@/components/ServicesBrowser";
import { getServices } from "@/lib/services-data";

// Without this, Next.js prerenders this page once at build time and never
// refetches — service/price edits made in Supabase would never show up on
// the live site until the next deploy.
export const revalidate = 60;

export const metadata = { title: "Services & Prices" };

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 md:py-20">
      <PageHeader eyebrow="Price list" title="Services">
        Prices marked <span className="text-foreground">+</span> are starting
        prices — your stylist will confirm the final price before starting.
      </PageHeader>

      <div className="mt-10">
        <ServicesBrowser services={services} />
      </div>

      <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-8">
        <p className="text-muted">Found what you need?</p>
        <Link
          href="/book"
          className="rounded-sm bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-brand"
        >
          Book an appointment
        </Link>
      </div>
    </div>
  );
}
