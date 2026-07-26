import type { Review } from "@/lib/reviews-data";

function Stars({ value }: { value: number }) {
  return (
    <span className="text-brand" aria-label={`${value} out of 5 stars`}>
      {"★".repeat(value)}
      <span className="text-border">{"★".repeat(5 - value)}</span>
    </span>
  );
}

export default function ReviewsList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted">
        No reviews yet — be the first to share your experience.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {reviews.map((r) => (
        <li key={r.id} className="rounded-xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <span className="font-medium text-foreground">{r.customerName}</span>
            <Stars value={r.rating} />
          </div>
          {r.staffName && (
            <p className="mt-0.5 text-xs text-muted">Service by {r.staffName}</p>
          )}
          {r.comment && <p className="mt-2 text-sm text-foreground">{r.comment}</p>}
          {r.websiteComment && (
            <p className="mt-3 border-t border-border/70 pt-2 text-xs text-muted">
              On booking online: {r.websiteComment}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
