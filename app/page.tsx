import Link from "next/link";
import QuickLinkCard from "@/components/QuickLinkCard";
import { BUSINESS } from "@/lib/business-info";

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-tint via-background to-background" />
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 py-24 md:py-32">
          <span className="rounded-full border border-gold/40 bg-gold-tint px-4 py-1.5 text-xs font-medium tracking-wide text-brand-dark uppercase">
            Fullerton&apos;s neighborhood nail &amp; hair studio
          </span>
          <h1 className="max-w-2xl font-display text-5xl leading-[1.1] text-foreground md:text-6xl">
            Look good, feel good, at{" "}
            <span className="text-brand">79 Nails &amp; Hair</span>
          </h1>
          <p className="max-w-xl text-lg text-muted">
            From gel manicures to fresh cuts and color, our stylists take
            care of the details so you leave looking — and feeling — your
            best.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href="/book"
              className="rounded-full bg-brand px-7 py-3.5 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
            >
              Book an Appointment
            </Link>
            <Link
              href="/services"
              className="rounded-full border border-border bg-surface px-7 py-3.5 text-sm font-medium text-foreground transition-colors hover:border-brand/40 hover:text-brand"
            >
              View Services
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-[1fr_1.2fr] md:items-center">
          <h2 className="font-display text-3xl text-foreground md:text-4xl">
            A calm space, a skilled team, and results you&apos;ll love.
          </h2>
          <p className="text-muted">
            79 Nails &amp; Hair brings nail care and hair styling together
            under one roof. Whether you&apos;re here for a quick polish
            change or a full color transformation, our team works with you
            to find the look that fits — no rushing, no guesswork.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-display text-2xl text-foreground md:text-3xl">
            Get started
          </h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <QuickLinkCard
            href="/services"
            title="Services"
            description="Browse nail and hair services with pricing."
            icon={<ScissorsIcon />}
          />
          <QuickLinkCard
            href="/staff"
            title="Staff"
            description="Meet our nail techs and stylists."
            icon={<PeopleIcon />}
          />
          <QuickLinkCard
            href="/book"
            title="Book"
            description="Pick a service, stylist, and time."
            icon={<CalendarIcon />}
          />
          <QuickLinkCard
            href="/reviews"
            title="Reviews"
            description="See what clients are saying."
            icon={<StarIcon />}
          />
        </div>
      </section>

      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="mb-8 font-display text-2xl text-foreground md:text-3xl">
            Visit Us
          </h2>
          <div className="grid gap-8 sm:grid-cols-3">
            <div className="flex gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-tint text-brand">
                <PinIcon />
              </span>
              <div>
                <h3 className="font-display text-lg text-foreground">
                  Location
                </h3>
                <a
                  href={BUSINESS.addressHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 block text-sm text-muted hover:text-brand"
                >
                  {BUSINESS.address}
                </a>
              </div>
            </div>

            <div className="flex gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-tint text-brand">
                <PhoneIcon />
              </span>
              <div>
                <h3 className="font-display text-lg text-foreground">
                  Phone
                </h3>
                <a
                  href={BUSINESS.phoneHref}
                  className="mt-1 block text-sm text-muted hover:text-brand"
                >
                  {BUSINESS.phone}
                </a>
              </div>
            </div>

            <div className="flex gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-tint text-brand">
                <ClockIcon />
              </span>
              <div>
                <h3 className="font-display text-lg text-foreground">
                  Hours
                </h3>
                <ul className="mt-1 space-y-0.5 text-sm text-muted">
                  {BUSINESS.hours.map((h) => (
                    <li key={h.days}>
                      {h.days}: {h.time}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function ScissorsIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      className="h-5 w-5"
    >
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="6" cy="18" r="2.5" />
      <line x1="20" y1="4" x2="8.12" y2="15.88" />
      <line x1="14.47" y1="14.48" x2="20" y2="20" />
      <line x1="8.12" y1="8.12" x2="12" y2="12" />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      className="h-5 w-5"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="10" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      className="h-5 w-5"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      className="h-5 w-5"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      className="h-5 w-5"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      className="h-5 w-5"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      className="h-5 w-5"
    >
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15.5 14" />
    </svg>
  );
}
