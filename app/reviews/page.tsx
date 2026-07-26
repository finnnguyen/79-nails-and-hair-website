import { getApprovedReviews } from "@/lib/reviews-data";
import { getStaff } from "@/lib/staff-data";
import ReviewsList from "@/components/ReviewsList";
import ReviewForm from "@/components/ReviewForm";

// Same reasoning as app/services/page.tsx — otherwise a newly-approved
// review would never appear on the live site until the next deploy.
export const revalidate = 60;

export default async function ReviewsPage() {
  const [reviews, staff] = await Promise.all([getApprovedReviews(), getStaff()]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="font-display text-4xl text-foreground md:text-5xl">Reviews</h1>
      <p className="mt-3 text-muted">
        Hear from our customers, or share your own experience — with us and with
        booking online.
      </p>

      <div className="mt-10">
        <ReviewForm staff={staff} />
      </div>

      <div className="mt-14">
        <h2 className="font-display text-2xl text-foreground">
          What customers are saying
        </h2>
        <div className="mt-6">
          <ReviewsList reviews={reviews} />
        </div>
      </div>
    </div>
  );
}
