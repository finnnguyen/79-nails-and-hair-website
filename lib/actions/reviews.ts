"use server";

import { randomUUID } from "node:crypto";
import { supabase } from "@/lib/supabase/client";

export type ReviewInput = {
  name: string;
  rating: number;
  comment: string;
  websiteRating: number | null;
  websiteComment: string;
  staffId: string | null;
};

export type ReviewResult = { success: true } | { success: false; error: string };

export async function submitReview(input: ReviewInput): Promise<ReviewResult> {
  // Same RLS constraint as bookings: new reviews start unapproved, and the
  // public SELECT policy only exposes approved=true rows, so INSERT ...
  // RETURNING (via .select()) would be rejected. No need for the id back anyway.
  const { error } = await supabase.from("reviews").insert({
    id: randomUUID(),
    customer_name: input.name,
    rating: input.rating,
    comment: input.comment || null,
    website_rating: input.websiteRating,
    website_comment: input.websiteComment || null,
    staff_id: input.staffId,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
