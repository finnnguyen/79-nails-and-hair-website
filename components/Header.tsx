"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BUSINESS } from "@/lib/business-info";

const NAV_LINKS = [
  { href: "/services", label: "Services" },
  { href: "/staff", label: "Team" },
  { href: "/reviews", label: "Reviews" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-baseline gap-2 text-foreground"
          onClick={() => setMenuOpen(false)}
        >
          <span className="font-display text-2xl leading-none">79</span>
          <span className="text-[13px] font-medium uppercase tracking-[0.18em]">
            Nails &amp; Hair
          </span>
        </Link>

        <nav className="hidden items-center gap-9 md:flex">
          {NAV_LINKS.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`text-sm transition-colors hover:text-foreground ${
                  active ? "text-foreground" : "text-muted"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-5">
          <a
            href={BUSINESS.phoneHref}
            className="hidden text-sm text-muted transition-colors hover:text-foreground lg:block"
          >
            {BUSINESS.phone}
          </a>
          <Link
            href="/book"
            onClick={() => setMenuOpen(false)}
            className="rounded-sm bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-brand"
          >
            Book now
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="-mr-2 flex h-10 w-10 shrink-0 items-center justify-center text-foreground md:hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              className="h-5 w-5"
            >
              {menuOpen ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M4 8h16M4 16h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t border-border bg-background px-6 pb-6 pt-2 md:hidden">
          <ul className="flex flex-col divide-y divide-border">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block py-4 font-display text-2xl text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <a
            href={BUSINESS.phoneHref}
            className="mt-4 block text-sm text-muted"
          >
            Call {BUSINESS.phone}
          </a>
        </nav>
      )}
    </header>
  );
}
