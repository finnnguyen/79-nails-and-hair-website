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
      <div className="mt-2 flex gap-0.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            aria-pressed={n <= value}
            className="p-0.5"
          >
            <svg
              viewBox="0 0 20 20"
              aria-hidden
              className={`h-6 w-6 transition-colors ${
                n <= value ? "fill-brand" : "fill-border hover:fill-brand/40"
              }`}
            >
              <path d="M10 1.5l2.6 5.3 5.9.9-4.25 4.1 1 5.8L10 14.9l-5.25 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
            </svg>
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
      <div className="border border-border bg-surface p-8">
        <h2 className="font-display text-2xl text-foreground">Thank you.</h2>
        <p className="mt-2 text-sm text-muted">
          Your review will appear here once it has been approved.
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
      className="border border-border bg-surface p-7"
    >
      <h2 className="font-display text-2xl text-foreground">Leave a review</h2>
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
            className="rounded-sm border border-border bg-surface px-3 py-2.5 text-foreground outline-none transition-colors placeholder:text-muted/60 focus:border-foreground"
            placeholder="Your name"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-foreground">Who did your service? (optional)</span>
          <select
            value={staffId}
            onChange={(e) => setStaffId(e.target.value)}
            className="rounded-sm border border-border bg-surface px-3 py-2.5 text-foreground outline-none transition-colors placeholder:text-muted/60 focus:border-foreground"
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
            className="rounded-sm border border-border bg-surface px-3 py-2.5 text-foreground outline-none transition-colors placeholder:text-muted/60 focus:border-foreground"
            placeholder="What did you love? What could be better?"
          />
        </label>

        <hr className="border-border" />

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
            className="rounded-sm border border-border bg-surface px-3 py-2.5 text-foreground outline-none transition-colors placeholder:text-muted/60 focus:border-foreground"
            placeholder="Was it easy to find a time and book?"
          />
        </label>

        {error && <p className="text-sm text-red-600">Something went wrong: {error}</p>}

        <button
          type="submit"
          disabled={!canSubmit || submitting}
          className="rounded-sm bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-brand disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting ? "Submitting…" : "Submit review"}
        </button>
      </div>
    </form>
  );
}
