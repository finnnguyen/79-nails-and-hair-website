import Stars from "@/components/Stars";
import type { Review } from "@/lib/reviews-data";

const DATE_LABEL = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
});

export default function ReviewsList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return (
      <p className="border border-dashed border-border p-8 text-center text-sm text-muted">
        No reviews yet — be the first to share your experience.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border border-t border-border">
      {reviews.map((r) => (
        <li key={r.id} className="py-7">
          <div className="flex items-center justify-between gap-4">
            <Stars value={r.rating} />
            <time dateTime={r.createdAt} className="text-xs text-muted">
              {DATE_LABEL.format(new Date(r.createdAt))}
            </time>
          </div>
          {r.comment && (
            <p className="mt-4 font-display text-xl leading-snug text-foreground">
              {r.comment}
            </p>
          )}
          <p className="mt-3 text-sm text-muted">
            <span className="text-foreground">{r.customerName}</span>
            {r.staffName && <> &middot; service by {r.staffName}</>}
          </p>
          {r.websiteComment && (
            <p className="mt-3 text-sm text-muted">
              On booking online: {r.websiteComment}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
