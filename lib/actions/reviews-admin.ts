"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function setReviewApproval(reviewId: string, approved: boolean) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("reviews")
    .update({ approved })
    .eq("id", reviewId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/reviews");
  revalidatePath("/reviews");
}

export async function deleteReview(reviewId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("reviews").delete().eq("id", reviewId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/reviews");
  revalidatePath("/reviews");
}
