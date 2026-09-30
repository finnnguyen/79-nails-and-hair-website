import Link from "next/link";
import { BUSINESS } from "@/lib/business-info";

export default function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="flex items-baseline gap-2">
            <span className="font-display text-2xl leading-none">79</span>
            <span className="text-[13px] font-medium uppercase tracking-[0.18em]">
              Nails &amp; Hair
            </span>
          </p>
          <p className="mt-4 max-w-xs text-sm text-background/60">
            Nails, hair, and facials in Fullerton, California.
          </p>
        </div>

        <div>
          <FooterHeading>Visit</FooterHeading>
          <a
            href={BUSINESS.addressHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-background/80 hover:text-background"
          >
            {BUSINESS.address}
          </a>
          <a
            href={BUSINESS.phoneHref}
            className="mt-1 block text-sm text-background/80 hover:text-background"
          >
            {BUSINESS.phone}
          </a>
        </div>

        <div>
          <FooterHeading>Hours</FooterHeading>
          <dl className="space-y-1 text-sm">
            {BUSINESS.hours.map((h) => (
              <div key={h.days} className="flex justify-between gap-4 sm:block">
                <dt className="text-background/60">{h.days}</dt>
                <dd className="text-background/80">{h.time}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div>
          <FooterHeading>Explore</FooterHeading>
          <ul className="space-y-1 text-sm">
            <li><Link href="/services" className="text-background/80 hover:text-background">Services &amp; prices</Link></li>
            <li><Link href="/staff" className="text-background/80 hover:text-background">Our team</Link></li>
            <li><Link href="/reviews" className="text-background/80 hover:text-background">Reviews</Link></li>
            <li><Link href="/book" className="text-background/80 hover:text-background">Book online</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-background/10">
        <div className="mx-auto flex max-w-6xl justify-between px-6 py-5 text-xs text-background/50">
          <p>&copy; {new Date().getFullYear()} 79 Nails &amp; Hair Salon</p>
          <Link href="/admin" className="hover:text-background">
            Staff login
          </Link>
        </div>
      </div>
    </footer>
  );
}

function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-background/50">
      {children}
    </p>
  );
}
