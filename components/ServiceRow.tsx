import type { Service } from "@/lib/services-data";

export default function ServiceRow({
  service,
  subtitle,
}: {
  service: Service;
  /** Overrides the service's own note — used to show why an AI search match was suggested. */
  subtitle?: string;
}) {
  const shownSubtitle = subtitle ?? service.note;
  return (
    <li className="flex items-center justify-between gap-4 py-3.5">
      <div className="flex flex-col">
        <span className="text-foreground">{service.name}</span>
        {shownSubtitle && (
          <span className="text-xs text-muted">{shownSubtitle}</span>
        )}
      </div>
      <span className="whitespace-nowrap font-display text-lg text-brand">
        ${service.price}
        {service.startingAt && "+"}
      </span>
    </li>
  );
}
