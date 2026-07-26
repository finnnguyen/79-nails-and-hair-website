import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div>
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-6">
          <span className="font-display text-lg text-foreground">Staff Admin</span>
          <nav className="flex gap-4 text-sm">
            <Link href="/admin/bookings" className="text-foreground hover:text-brand">
              Bookings
            </Link>
            <Link href="/admin/reviews" className="text-foreground hover:text-brand">
              Reviews
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted">{user.email}</span>
          <form action={signOut}>
            <button type="submit" className="text-brand hover:text-brand-dark">
              Sign out
            </button>
          </form>
        </div>
      </div>
      {children}
    </div>
  );
}
