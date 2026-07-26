"use client";

import { useState } from "react";
import ServiceRow from "@/components/ServiceRow";
import {
  SERVICE_CATEGORIES,
  type Service,
  type ServiceCategory,
} from "@/lib/services-data";

export default function ServicesBrowser({
  services,
}: {
  services: Service[];
}) {
  const [active, setActive] = useState<ServiceCategory>(
    SERVICE_CATEGORIES[0]
  );

  const items = services.filter((s) => s.category === active);
  const coreItems = items.filter((s) => !s.addon);
  const addonItems = items.filter((s) => s.addon);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {SERVICE_CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActive(category)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              active === category
                ? "bg-brand text-white"
                : "border border-border bg-surface text-foreground hover:border-brand/40 hover:text-brand"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <ul className="mt-8 divide-y divide-border/70">
        {coreItems.map((service) => (
          <ServiceRow key={service.id} service={service} />
        ))}
      </ul>

      {addonItems.length > 0 && (
        <>
          <p className="mb-1 mt-8 text-xs font-medium uppercase tracking-wide text-muted">
            Add-ons
          </p>
          <ul className="divide-y divide-border/70">
            {addonItems.map((service) => (
              <ServiceRow key={service.id} service={service} />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
