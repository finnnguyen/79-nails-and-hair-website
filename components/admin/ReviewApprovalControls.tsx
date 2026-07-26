"use client";

import { useTransition } from "react";
import { setReviewApproval, deleteReview } from "@/lib/actions/reviews-admin";

export default function ReviewApprovalControls({
  reviewId,
  approved,
}: {
  reviewId: string;
  approved: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex shrink-0 gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => setReviewApproval(reviewId, !approved))}
        className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:border-brand/40 disabled:opacity-50"
      >
        {approved ? "Unapprove" : "Approve"}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (confirm("Delete this review permanently?")) {
            startTransition(() => deleteReview(reviewId));
          }
        }}
        className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-red-600 hover:border-red-300 disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  );
}
