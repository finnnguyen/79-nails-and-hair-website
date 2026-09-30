import Link from "next/link";
import OpenStatus from "@/components/OpenStatus";
import Reveal from "@/components/Reveal";
import Stars from "@/components/Stars";
import { BUSINESS } from "@/lib/business-info";
import { getApprovedReviews } from "@/lib/reviews-data";
import {
  CATEGORY_LABELS,
  formatDuration,
  getServices,
  SERVICE_CATEGORIES,
} from "@/lib/services-data";
import { getStaff } from "@/lib/staff-data";

// Same reasoning as app/services/page.tsx — prices, staff, and approved
// reviews shown here come from Supabase.
export const revalidate = 60;

const BOOKING_STEPS = [
  {
    title: "Choose your services",
    body: "Combine a manicure with a pedicure, or add gel and design — you'll see the total as you go.",
  },
  {
    title: "Pick your person",
    body: "Only staff who do everything you've picked are shown, so there's no back-and-forth.",
  },
  {
    title: "Grab a time",
    body: "Open slots update live. We'll reach out by phone or email to confirm.",
  },
];

const FAQS = [
  {
    q: "Do you take walk-ins?",
    a: "Yes. Walk-ins are seen in order as staff free up. Booking online holds a specific time for you, so it's the better choice on busy days.",
  },
  {
    q: "What does the + after a price mean?",
    a: "It's a starting price. Length, design, or extra product can change the final amount — your stylist will confirm the price before starting.",
  },
  {
    q: "Can I book several services at once?",
    a: "Yes. Select everything you'd like in step one and we'll show the staff who can do all of it in a single visit.",
  },
  {
    q: "How is my appointment confirmed?",
    a: `After you request a time, we'll reach out by phone or email to confirm. Need to change something? Call us at ${BUSINESS.phone}.`,
  },
];

export default async function Home() {
  const [services, staff, reviews] = await Promise.all([
    getServices(),
    getStaff(),
    getApprovedReviews(),
  ]);

  const coreServices = services.filter((s) => !s.addon);
  const categories = SERVICE_CATEGORIES.map((category) => {
    const core = coreServices.filter((s) => s.category === category);
    return {
      category,
      count: services.filter((s) => s.category === category).length,
      from: core.length ? Math.min(...core.map((s) => s.price)) : null,
      examples: core.slice(0, 4),
    };
  }).filter((c) => c.examples.length > 0);

  const popular = SERVICE_CATEGORIES.flatMap((category) =>
    coreServices.filter((s) => s.category === category).slice(0, 2)
  ).slice(0, 5);

  const featuredReviews = reviews.filter((r) => r.comment).slice(0, 3);
  const averageRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : null;
  const openDays = BUSINESS.schedule.filter(Boolean).length;

  const stats = [
    averageRating !== null && {
      value: averageRating.toFixed(1),
      label: `Average from ${reviews.length} review${reviews.length === 1 ? "" : "s"}`,
    },
    { value: String(services.length), label: "Services on the menu" },
    { value: String(staff.length), label: "Nail techs & stylists" },
    { value: String(openDays), label: "Days a week, closed Mondays" },
  ].filter((s): s is { value: string; label: string } => Boolean(s));

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-foreground text-background">
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -right-10 select-none font-display text-[22rem] leading-none text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.08)] md:text-[34rem]"
        >
          79
        </span>
        <div className="relative mx-auto grid max-w-6xl gap-14 px-6 pb-20 pt-14 md:grid-cols-[1.25fr_1fr] md:items-center md:pb-28 md:pt-24">
          <div>
            <OpenStatus className="rounded-sm border border-background/15 px-3 py-1.5 text-xs text-background/80" />
            <h1 className="mt-7 font-display text-5xl leading-[1.02] tracking-tight md:text-7xl">
              Nail and hair care,{" "}
              <em className="text-[#d9a7ae]">done with care.</em>
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-background/65">
              Manicures, pedicures, cuts, and color on N Raymond Ave in
              Fullerton. Walk in, or book your time online in about a minute.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/book"
                className="group inline-flex items-center gap-2 rounded-sm bg-background px-6 py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-brand-tint"
              >
                Book an appointment
                <span className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
              </Link>
              <a
                href={BUSINESS.phoneHref}
                className="rounded-sm border border-background/20 px-6 py-3.5 text-sm font-medium text-background transition-colors hover:border-background/60"
              >
                Call {BUSINESS.phone}
              </a>
            </div>
            {averageRating !== null && (
              <p className="mt-10 flex items-center gap-3 text-sm text-background/60">
                <Stars value={Math.round(averageRating)} />
                <span>
                  <span className="text-background">{averageRating.toFixed(1)}</span> from{" "}
                  {reviews.length} client review{reviews.length === 1 ? "" : "s"}
                </span>
              </p>
            )}
          </div>

          <div className="rounded-sm bg-surface p-7 text-foreground shadow-2xl shadow-black/40">
            <div className="flex items-baseline justify-between">
              <p className="font-display text-2xl">Popular right now</p>
              <Link href="/services" className="text-xs text-muted hover:text-foreground">
                Full menu
              </Link>
            </div>
            <ul className="mt-5 divide-y divide-border border-y border-border">
              {popular.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/book?service=${s.id}`}
                    className="group flex items-center justify-between gap-4 py-3.5"
                  >
                    <span>
                      <span className="block text-sm text-foreground group-hover:text-brand">
                        {s.name}
                      </span>
                      <span className="text-xs text-muted">
                        {formatDuration(s.durationMinutes)}
                      </span>
                    </span>
                    <span className="flex items-center gap-3">
                      <span className="text-sm tabular-nums text-foreground">
                        ${s.price}
                        {s.startingAt && "+"}
                      </span>
                      <span className="text-xs text-muted transition-colors group-hover:text-brand">
                        Book &rarr;
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-muted">
              Tap a service to start booking with it selected.
            </p>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="overflow-hidden border-b border-brand-dark bg-brand py-4 text-white" aria-hidden>
        <div className="animate-marquee flex w-max gap-10 whitespace-nowrap font-display text-xl italic">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex gap-10">
              {coreServices.map((s) => (
                <span key={`${copy}-${s.id}`} className="flex items-center gap-10">
                  {s.name}
                  <span className="text-white/40">&#10022;</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <section className="border-b border-border bg-surface">
        <dl className="mx-auto grid max-w-6xl grid-cols-2 px-6 md:grid-cols-4 md:divide-x md:divide-border">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col-reverse py-8 md:px-8 md:py-10 md:first:pl-0">
              <dt className="mt-2 text-sm text-muted">{s.label}</dt>
              <dd className="font-display text-4xl tracking-tight text-foreground md:text-5xl">
                {s.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Services */}
      <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <Reveal>
          <SectionHeading
            eyebrow="The menu"
            title="Everything under one roof"
            link={{ href: "/services", label: "See all prices" }}
          />
        </Reveal>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {categories.map(({ category, count, from, examples }, i) => (
            <Reveal key={category} delay={i * 100}>
              <Link
                href={`/book?category=${encodeURIComponent(category)}`}
                className="group flex h-full flex-col rounded-sm border border-border bg-surface p-7 transition-all duration-300 hover:-translate-y-1 hover:border-foreground hover:bg-foreground hover:text-background"
              >
                <div className="flex items-center justify-between text-xs text-muted transition-colors group-hover:text-background/60">
                  <span className="tabular-nums">0{i + 1}</span>
                  <span>{count} services</span>
                </div>
                <h3 className="mt-10 font-display text-3xl tracking-tight">
                  {CATEGORY_LABELS[category]}
                </h3>
                {from !== null && (
                  <p className="mt-1 text-sm text-muted transition-colors group-hover:text-background/60">
                    Starting at ${from}
                  </p>
                )}
                <ul className="mt-8 space-y-2 border-t border-border pt-6 text-sm transition-colors group-hover:border-background/15">
                  {examples.map((s) => (
                    <li key={s.id} className="flex justify-between gap-4">
                      <span>{s.name}</span>
                      <span className="tabular-nums text-muted transition-colors group-hover:text-background/60">
                        ${s.price}
                        {s.startingAt && "+"}
                      </span>
                    </li>
                  ))}
                </ul>
                <span className="mt-auto flex items-center justify-between pt-10 text-sm font-medium">
                  Book {CATEGORY_LABELS[category].toLowerCase()}
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-border transition-all group-hover:border-background group-hover:bg-background group-hover:text-foreground">
                    &rarr;
                  </span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* How booking works */}
      <section className="border-y border-border bg-brand-tint/60">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <Reveal>
            <SectionHeading eyebrow="Booking online" title="Three steps, about a minute" />
          </Reveal>
          <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
            {BOOKING_STEPS.map((step, i) => (
              <li key={step.title}>
                <Reveal delay={i * 100} className="relative">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border border-foreground font-display text-xl">
                    {i + 1}
                  </span>
                  {i < BOOKING_STEPS.length - 1 && (
                    <span
                      aria-hidden
                      className="absolute left-16 right-0 top-6 hidden border-t border-dashed border-foreground/30 md:block"
                    />
                  )}
                  <h3 className="mt-6 font-display text-2xl text-foreground">{step.title}</h3>
                  <p className="mt-2 max-w-xs text-muted">{step.body}</p>
                </Reveal>
              </li>
            ))}
          </ol>
          <Link
            href="/book"
            className="mt-12 inline-flex rounded-sm bg-foreground px-6 py-3.5 text-sm font-medium text-background transition-colors hover:bg-brand"
          >
            Start booking
          </Link>
        </div>
      </section>

      {/* Team */}
      {staff.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <Reveal>
            <SectionHeading
              eyebrow="The team"
              title="Book with someone you trust"
              link={{ href: "/staff", label: "Meet everyone" }}
            />
          </Reveal>
          <ul
            style={{ "--cols": Math.min(staff.length, 7) } as React.CSSProperties}
            className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-[repeat(var(--cols),minmax(0,1fr))]"
          >
            {staff.map((member, i) => (
              <li key={member.id}>
                <Reveal delay={i * 60}>
                  <Link href={`/book?staff=${member.id}`} className="group block">
                    <span className="flex aspect-[4/5] items-end overflow-hidden rounded-sm bg-gold-tint p-4 transition-colors duration-300 group-hover:bg-brand">
                      <span className="font-display text-7xl leading-none text-foreground/15 transition-colors duration-300 group-hover:text-white/40">
                        {member.name.charAt(0)}
                      </span>
                    </span>
                    <span className="mt-3 block font-display text-xl text-foreground">
                      {member.name}
                    </span>
                    <span className="block text-xs text-muted">{member.role}</span>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Reviews */}
      {featuredReviews.length > 0 && (
        <section className="bg-foreground text-background">
          <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-background/50">
                    Reviews
                  </p>
                  <h2 className="mt-3 font-display text-4xl tracking-tight md:text-5xl">
                    What clients say
                  </h2>
                </div>
                <Link
                  href="/reviews"
                  className="text-sm font-medium underline decoration-background/30 underline-offset-[6px] hover:decoration-background"
                >
                  Read all or leave one
                </Link>
              </div>
            </Reveal>
            <div
              className={`mt-12 grid gap-5 ${
                featuredReviews.length >= 3 ? "md:grid-cols-3" : "md:grid-cols-2"
              }`}
            >
              {featuredReviews.map((r, i) => (
                <Reveal key={r.id} delay={i * 100} className="h-full">
                  <figure className="flex h-full flex-col rounded-sm border border-background/10 bg-background/[0.04] p-8">
                    <span aria-hidden className="font-display text-6xl leading-none text-[#d9a7ae]">
                      &ldquo;
                    </span>
                    <blockquote className="mt-2 font-display text-2xl leading-snug">
                      {r.comment}
                    </blockquote>
                    <figcaption className="mt-auto flex items-center justify-between gap-4 pt-8 text-sm text-background/60">
                      <span>
                        <span className="text-background">{r.customerName}</span>
                        {r.staffName && <> &middot; with {r.staffName}</>}
                      </span>
                      <Stars value={r.rating} />
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Visit + FAQ */}
      <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Visit</p>
            <h2 className="mt-3 font-display text-4xl tracking-tight text-foreground md:text-5xl">
              Find us on Raymond
            </h2>
            <div className="mt-8 overflow-hidden rounded-sm border border-border">
              <iframe
                title={`Map of ${BUSINESS.address}`}
                src={BUSINESS.mapEmbedSrc}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-64 w-full grayscale-[0.6] md:h-72"
              />
              <div className="grid gap-6 bg-surface p-6 sm:grid-cols-[1fr_1.5fr]">
                <div>
                  <p className="text-sm text-foreground">{BUSINESS.address}</p>
                  <a href={BUSINESS.phoneHref} className="mt-1 block text-sm text-muted hover:text-foreground">
                    {BUSINESS.phone}
                  </a>
                  <a
                    href={BUSINESS.addressHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-block text-sm font-medium text-foreground underline decoration-border underline-offset-[6px] hover:decoration-foreground"
                  >
                    Get directions
                  </a>
                </div>
                <dl className="space-y-1.5 text-sm">
                  {BUSINESS.hours.map((h) => (
                    <div key={h.days} className="flex justify-between gap-4">
                      <dt className="whitespace-nowrap text-muted">{h.days}</dt>
                      <dd className="whitespace-nowrap text-foreground">{h.time}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">FAQ</p>
            <h2 className="mt-3 font-display text-4xl tracking-tight text-foreground md:text-5xl">
              Good to know
            </h2>
            <div className="mt-8 divide-y divide-border border-y border-border">
              {FAQS.map((f) => (
                <details key={f.q} className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-foreground">
                    <span className="font-medium">{f.q}</span>
                    <span
                      aria-hidden
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border text-muted transition-transform group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="-mt-1 pb-5 pr-12 text-muted">{f.a}</p>
                </details>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-20 md:pb-28">
        <Reveal>
          <div className="relative mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 overflow-hidden rounded-sm bg-brand px-8 py-14 text-white md:flex-row md:items-center md:px-14">
            <span
              aria-hidden
              className="pointer-events-none absolute -right-6 -top-16 font-display text-[14rem] leading-none text-white/[0.06]"
            >
              79
            </span>
            <div className="relative">
              <h2 className="font-display text-4xl tracking-tight md:text-5xl">
                Ready when you are.
              </h2>
              <OpenStatus className="mt-3 text-sm text-white/70" />
            </div>
            <Link
              href="/book"
              className="relative shrink-0 rounded-sm bg-white px-7 py-4 text-sm font-medium text-brand-dark transition-colors hover:bg-brand-tint"
            >
              Book an appointment
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}

function SectionHeading({
  eyebrow,
  title,
  link,
}: {
  eyebrow: string;
  title: string;
  link?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">{eyebrow}</p>
        <h2 className="mt-3 font-display text-4xl tracking-tight text-foreground md:text-5xl">
          {title}
        </h2>
      </div>
      {link && (
        <Link
          href={link.href}
          className="text-sm font-medium text-foreground underline decoration-border underline-offset-[6px] hover:decoration-foreground"
        >
          {link.label}
        </Link>
      )}
    </div>
  );
}
