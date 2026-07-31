import "server-only";
import { headers } from "next/headers";
import { supabase } from "@/lib/supabase/client";

/** Best-effort anti-abuse limiter backed by Postgres (see the check_rate_limit
 * function) — approximate under concurrent requests, which is fine for
 * anti-abuse purposes. Fails open (allows the request) if the check itself
 * errors, so a DB hiccup never blocks a legitimate customer from booking or
 * leaving a review. */
export async function checkRateLimit(
  scope: string,
  { maxCount, windowMinutes }: { maxCount: number; windowMinutes: number }
): Promise<boolean> {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  const { data, error } = await supabase.rpc("check_rate_limit", {
    p_key: `${scope}:${ip}`,
    p_max_count: maxCount,
    p_window_minutes: windowMinutes,
  });

  if (error) {
    console.error("Rate limit check failed (failing open):", error);
    return true;
  }

  return data ?? true;
}
