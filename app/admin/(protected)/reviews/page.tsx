import { createClient } from "@/lib/supabase/server";
import ReviewApprovalControls from "@/components/admin/ReviewApprovalControls";

export default async function AdminReviewsPage() {
  const supabase = await createClient();

  const { data: reviews, error } = await supabase
    .from("reviews")
    .select(
      "id, customer_name, rating, comment, website_rating, website_comment, approved, created_at, staff:staff_id(name)"
    )
    .order("approved", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10">
        <p className="text-sm text-red-600">Failed to load reviews: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="font-display text-2xl text-foreground">Reviews</h1>

      <ul className="mt-6 flex flex-col gap-4">
        {reviews.map((r) => (
          <li key={r.id} className="rounded-xl border border-border bg-surface p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{r.customer_name}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      r.approved
                        ? "bg-brand-tint text-brand-dark"
                        : "border border-border text-muted"
                    }`}
                  >
                    {r.approved ? "Approved" : "Pending"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-brand">
                  {"★".repeat(r.rating)}
                  <span className="text-border">{"★".repeat(5 - r.rating)}</span>
                </p>
                {r.staff?.name && (
                  <p className="text-xs text-muted">Service by {r.staff.name}</p>
                )}
              </div>
              <ReviewApprovalControls reviewId={r.id} approved={r.approved} />
            </div>

            {r.comment && <p className="mt-3 text-sm text-foreground">{r.comment}</p>}

            {(r.website_rating || r.website_comment) && (
              <div className="mt-3 border-t border-border/70 pt-2 text-xs text-muted">
                {r.website_rating && (
                  <p>
                    Website rating: {"★".repeat(r.website_rating)}
                    {"★".repeat(5 - r.website_rating)}
                  </p>
                )}
                {r.website_comment && <p className="mt-1">{r.website_comment}</p>}
              </div>
            )}
          </li>
        ))}
      </ul>

      {reviews.length === 0 && <p className="mt-6 text-sm text-muted">No reviews yet.</p>}
    </div>
  );
}
