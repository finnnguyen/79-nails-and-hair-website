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
    <li className="py-4">
      <div className="flex items-baseline gap-3">
        <span className="text-foreground">{service.name}</span>
        <span
          aria-hidden
          className="flex-1 translate-y-[-3px] border-b border-dotted border-muted/40"
        />
        <span className="whitespace-nowrap tabular-nums text-foreground">
          ${service.price}
          {service.startingAt && "+"}
        </span>
      </div>
      {shownSubtitle && (
        <p className="mt-1 text-sm text-muted">{shownSubtitle}</p>
      )}
    </li>
  );
}
