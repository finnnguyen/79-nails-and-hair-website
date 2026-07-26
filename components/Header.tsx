import Link from "next/link";

const NAV_LINKS = [
  { href: "/services", label: "Services" },
  { href: "/staff", label: "Staff" },
  { href: "/reviews", label: "Reviews" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="font-display text-xl tracking-tight text-brand"
        >
          79 Nails &amp; Hair
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-foreground/80 transition-colors hover:text-brand"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/book"
          className="rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
        >
          Book Now
        </Link>
      </div>
    </header>
  );
}
