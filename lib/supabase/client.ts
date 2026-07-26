import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

/** Shared client scoped to the anon/publishable key — reads and public inserts only, per RLS policies. */
export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
