import type { Service } from "@/lib/services-data";

export default function ServiceRow({ service }: { service: Service }) {
  return (
    <li className="flex items-center justify-between gap-4 py-3.5">
      <div className="flex flex-col">
        <span className="text-foreground">{service.name}</span>
        {service.note && (
          <span className="text-xs text-muted">{service.note}</span>
        )}
      </div>
      <span className="whitespace-nowrap font-display text-lg text-brand">
        ${service.price}
        {service.startingAt && "+"}
      </span>
    </li>
  );
}
