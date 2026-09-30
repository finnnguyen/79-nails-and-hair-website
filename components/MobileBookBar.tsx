"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BUSINESS } from "@/lib/business-info";

/** Thumb-reachable Call / Book actions on small screens. */
export default function MobileBookBar() {
  const pathname = usePathname();
  if (pathname.startsWith("/book") || pathname.startsWith("/admin")) return null;

  return (
    <>
      <div className="h-[72px] md:hidden" aria-hidden />
      <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-[auto_1fr] gap-2 border-t border-border bg-background/95 p-3 backdrop-blur-sm md:hidden">
        <a
          href={BUSINESS.phoneHref}
          className="flex items-center justify-center rounded-sm border border-border px-5 text-sm font-medium text-foreground"
        >
          Call
        </a>
        <Link
          href="/book"
          className="flex items-center justify-center rounded-sm bg-foreground py-3 text-sm font-medium text-background"
        >
          Book an appointment
        </Link>
      </div>
    </>
  );
}
