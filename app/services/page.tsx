import ServicesBrowser from "@/components/ServicesBrowser";
import { getServices } from "@/lib/services-data";

// Without this, Next.js prerenders this page once at build time and never
// refetches — service/price edits made in Supabase would never show up on
// the live site until the next deploy.
export const revalidate = 60;

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      <h1 className="font-display text-4xl text-foreground md:text-5xl">
        Services
      </h1>
      <p className="mt-3 text-muted">
        Prices marked <span className="text-brand">+</span> start at the
        listed amount — your stylist will confirm before starting.
      </p>

      <div className="mt-10">
        <ServicesBrowser services={services} />
      </div>
    </div>
  );
}
