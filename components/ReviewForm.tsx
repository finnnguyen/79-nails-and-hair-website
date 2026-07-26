"use client";

import { useState } from "react";
import { submitReview } from "@/lib/actions/reviews";
import type { Staff } from "@/lib/staff-data";

function StarPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <span className="block text-sm text-foreground">{label}</span>
      <div className="mt-1.5 flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            className={`text-2xl leading-none ${
              n <= value ? "text-brand" : "text-border"
            }`}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ReviewForm({ staff }: { staff: Staff[] }) {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [websiteRating, setWebsiteRating] = useState(0);
  const [websiteComment, setWebsiteComment] = useState("");
  const [staffId, setStaffId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = name.trim() !== "" && rating > 0;

  if (submitted) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-8 text-center">
        <h2 className="font-display text-xl text-foreground">Thank you!</h2>
        <p className="mt-2 text-sm text-muted">
          Your feedback helps us improve — we appreciate you taking the time.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!canSubmit) return;
        setSubmitting(true);
        setError(null);
        const result = await submitReview({
          name,
          rating,
          comment,
          websiteRating: websiteRating || null,
          websiteComment,
          staffId: staffId || null,
        });
        setSubmitting(false);
        if (result.success) {
          setSubmitted(true);
        } else {
          setError(result.error);
        }
      }}
      className="rounded-2xl border border-border bg-surface p-6"
    >
      <h2 className="font-display text-xl text-foreground">Leave Feedback</h2>
      <p className="mt-1 text-sm text-muted">
        Tell us about your visit and your experience booking online.
      </p>

      <div className="mt-6 flex flex-col gap-5">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-foreground">Name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2.5 text-foreground outline-none focus:border-brand"
            placeholder="Jane Doe"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-foreground">Who did your service? (optional)</span>
          <select
            value={staffId}
            onChange={(e) => setStaffId(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2.5 text-foreground outline-none focus:border-brand"
          >
            <option value="">Not sure / prefer not to say</option>
            {staff.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>

        <StarPicker label="How was your service?" value={rating} onChange={setRating} />
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-foreground">Tell us more about the service (optional)</span>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="rounded-lg border border-border bg-background px-3 py-2.5 text-foreground outline-none focus:border-brand"
            placeholder="What did you love? What could be better?"
          />
        </label>

        <hr className="border-border/70" />

        <StarPicker
          label="How was booking on our website? (optional)"
          value={websiteRating}
          onChange={setWebsiteRating}
        />
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-foreground">Any feedback on the website itself? (optional)</span>
          <textarea
            value={websiteComment}
            onChange={(e) => setWebsiteComment(e.target.value)}
            rows={3}
            className="rounded-lg border border-border bg-background px-3 py-2.5 text-foreground outline-none focus:border-brand"
            placeholder="Was it easy to find a time and book?"
          />
        </label>

        {error && <p className="text-sm text-red-600">Something went wrong: {error}</p>}

        <button
          type="submit"
          disabled={!canSubmit || submitting}
          className="self-start rounded-full bg-brand px-7 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting ? "Submitting…" : "Submit Feedback"}
        </button>
      </div>
    </form>
  );
}
