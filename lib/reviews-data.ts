import { supabase } from "@/lib/supabase/client";

export type Review = {
  id: string;
  customerName: string;
  rating: number;
  comment: string | null;
  websiteRating: number | null;
  websiteComment: string | null;
  staffName: string | null;
  createdAt: string;
};

export async function getApprovedReviews(): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("id, customer_name, rating, comment, website_rating, website_comment, created_at, staff:staff_id(name)")
    .eq("approved", true)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data.map((row) => ({
    id: row.id,
    customerName: row.customer_name,
    rating: row.rating,
    comment: row.comment,
    websiteRating: row.website_rating,
    websiteComment: row.website_comment,
    staffName: row.staff?.name ?? null,
    createdAt: row.created_at,
  }));
}
