import Link from "next/link";
import { formatDuration, type Service } from "@/lib/services-data";

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
    <li>
      <Link
        href={`/book?service=${service.id}`}
        className="group -mx-3 block rounded-sm px-3 py-4 transition-colors hover:bg-surface"
      >
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
        <div className="mt-1 flex items-baseline justify-between gap-4 text-sm text-muted">
          <span>
            {formatDuration(service.durationMinutes)}
            {shownSubtitle && <> &middot; {shownSubtitle}</>}
          </span>
          <span className="whitespace-nowrap text-xs font-medium text-brand opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
            Book &rarr;
          </span>
        </div>
      </Link>
    </li>
  );
}
