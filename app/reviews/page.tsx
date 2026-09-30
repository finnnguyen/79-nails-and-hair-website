import { getApprovedReviews } from "@/lib/reviews-data";
import { getStaff } from "@/lib/staff-data";
import PageHeader from "@/components/PageHeader";
import ReviewsList from "@/components/ReviewsList";
import ReviewForm from "@/components/ReviewForm";
import Stars from "@/components/Stars";

// Same reasoning as app/services/page.tsx — otherwise a newly-approved
// review would never appear on the live site until the next deploy.
export const revalidate = 60;

export const metadata = { title: "Reviews" };

export default async function ReviewsPage() {
  const [reviews, staff] = await Promise.all([getApprovedReviews(), getStaff()]);
  const average = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : null;

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
      <PageHeader eyebrow="Reviews" title="From our clients">
        {average !== null ? (
          <span className="flex items-center gap-3">
            <Stars value={Math.round(average)} className="h-4 w-4" />
            <span>
              <span className="text-foreground">{average.toFixed(1)}</span> out of 5
              from {reviews.length} review{reviews.length === 1 ? "" : "s"}
            </span>
          </span>
        ) : (
          "Been in recently? We'd love to hear how it went."
        )}
      </PageHeader>

      <div className="mt-12 grid gap-14 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
        <ReviewsList reviews={reviews} />
        <div className="lg:sticky lg:top-24 lg:self-start">
          <ReviewForm staff={staff} />
        </div>
      </div>
    </div>
  );
}
