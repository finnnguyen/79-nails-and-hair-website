"use server";

import { randomUUID } from "node:crypto";
import { z } from "zod";
import { supabase } from "@/lib/supabase/client";

const reviewInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(2000),
  websiteRating: z.number().int().min(1).max(5).nullable(),
  websiteComment: z.string().trim().max(2000),
  staffId: z.string().trim().min(1).nullable(),
});

export type ReviewInput = z.infer<typeof reviewInputSchema>;

export type ReviewResult = { success: true } | { success: false; error: string };

export async function submitReview(rawInput: ReviewInput): Promise<ReviewResult> {
  const parsed = reviewInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid review" };
  }
  const input = parsed.data;

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
