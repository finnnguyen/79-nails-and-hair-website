import Link from "next/link";
import Stars from "@/components/Stars";
import { BUSINESS } from "@/lib/business-info";
import { getApprovedReviews } from "@/lib/reviews-data";
import { CATEGORY_LABELS, getServices, SERVICE_CATEGORIES } from "@/lib/services-data";
import { getStaff } from "@/lib/staff-data";

// Same reasoning as app/services/page.tsx — prices, staff, and approved
// reviews shown here come from Supabase.
export const revalidate = 60;

export default async function Home() {
  const [services, staff, reviews] = await Promise.all([
    getServices(),
    getStaff(),
    getApprovedReviews(),
  ]);

  const categories = SERVICE_CATEGORIES.map((category) => {
    const core = services.filter((s) => s.category === category && !s.addon);
    return {
      category,
      from: core.length ? Math.min(...core.map((s) => s.price)) : null,
      examples: core.slice(0, 5),
    };
  }).filter((c) => c.examples.length > 0);

  const featuredReviews = reviews.filter((r) => r.comment).slice(0, 3);
  const averageRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : null;

  return (
    <>
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 pb-16 pt-14 md:grid-cols-[1.4fr_1fr] md:gap-16 md:pb-24 md:pt-24">
          <div className="flex flex-col justify-center">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
              Nails &middot; Hair &middot; Facials &mdash; Fullerton, CA
            </p>
            <h1 className="mt-5 font-display text-5xl leading-[1.05] tracking-tight text-foreground md:text-7xl">
              Nail and hair care on Raymond Avenue.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">
              Manicures, pedicures, cuts, and color from a small team that
              takes its time. Walk in, or book online in about a minute.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
              <Link
                href="/book"
                className="rounded-sm bg-foreground px-6 py-3.5 text-sm font-medium text-background transition-colors hover:bg-brand"
              >
                Book an appointment
              </Link>
              <Link
                href="/services"
                className="text-sm font-medium text-foreground underline decoration-border decoration-1 underline-offset-[6px] transition-colors hover:decoration-foreground"
              >
                See services &amp; prices
              </Link>
            </div>
          </div>

          <aside className="self-center border border-border bg-surface p-7">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
              Hours
            </p>
            <dl className="mt-4 divide-y divide-border text-sm">
              {BUSINESS.hours.map((h) => (
                <div key={h.days} className="flex justify-between gap-4 py-2.5">
                  <dt className="text-foreground">{h.days}</dt>
                  <dd className="text-muted">{h.time}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-7 text-xs font-medium uppercase tracking-[0.16em] text-muted">
              Location
            </p>
            <a
              href={BUSINESS.addressHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 block text-sm text-foreground hover:text-brand"
            >
              {BUSINESS.address}
            </a>
            <a
              href={BUSINESS.phoneHref}
              className="mt-1 block text-sm text-muted hover:text-brand"
            >
              {BUSINESS.phone}
            </a>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20 md:py-24">
        <SectionHeading
          title="Services"
          link={{ href: "/services", label: "Full price list" }}
        />
        <div className="mt-10 grid gap-px overflow-hidden border border-border bg-border md:grid-cols-3">
          {categories.map(({ category, from, examples }) => (
            <Link
              key={category}
              href={`/book?category=${encodeURIComponent(category)}`}
              className="group flex flex-col bg-surface p-7 transition-colors hover:bg-background"
            >
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="font-display text-2xl text-foreground">
                  {CATEGORY_LABELS[category]}
                </h3>
                {from !== null && (
                  <span className="text-sm text-muted">from ${from}</span>
                )}
              </div>
              <ul className="mt-6 space-y-1.5 border-t border-border pt-5 text-sm text-foreground">
                {examples.map((s) => (
                  <li key={s.id}>{s.name}</li>
                ))}
              </ul>
              <span className="mt-auto pt-8 text-sm font-medium text-foreground">
                Book {CATEGORY_LABELS[category].toLowerCase()}{" "}
                <span className="inline-block transition-transform group-hover:translate-x-1">
                  &rarr;
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {staff.length > 0 && (
        <section className="border-y border-border bg-surface">
          <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-[1fr_2fr] md:py-24">
            <div>
              <h2 className="font-display text-3xl tracking-tight text-foreground md:text-4xl">
                The team
              </h2>
              <p className="mt-4 max-w-xs text-muted">
                Book with someone you already know, or let us match you with
                whoever is free.
              </p>
              <Link
                href="/staff"
                className="mt-6 inline-block text-sm font-medium text-foreground underline decoration-border underline-offset-[6px] hover:decoration-foreground"
              >
                Meet everyone
              </Link>
            </div>
            <ul className="grid gap-x-10 sm:grid-cols-2">
              {staff.map((member) => (
                <li key={member.id} className="border-b border-border">
                  <Link
                    href={`/book?staff=${member.id}`}
                    className="group flex items-baseline justify-between gap-4 py-4"
                  >
                    <span className="font-display text-xl text-foreground group-hover:text-brand">
                      {member.name}
                    </span>
                    <span className="text-sm text-muted">{member.role}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {featuredReviews.length > 0 && averageRating !== null && (
        <section className="mx-auto max-w-6xl px-6 py-20 md:py-24">
          <SectionHeading
            title="What clients say"
            link={{ href: "/reviews", label: `All ${reviews.length} reviews` }}
          >
            <span className="flex items-center gap-2 text-sm text-muted">
              <Stars value={Math.round(averageRating)} />
              {averageRating.toFixed(1)} average
            </span>
          </SectionHeading>
          <div className="mt-10 grid gap-10 md:grid-cols-3">
            {featuredReviews.map((r) => (
              <figure key={r.id} className="border-t border-foreground pt-6">
                <Stars value={r.rating} />
                <blockquote className="mt-4 font-display text-xl leading-snug text-foreground">
                  &ldquo;{r.comment}&rdquo;
                </blockquote>
                <figcaption className="mt-5 text-sm text-muted">
                  {r.customerName}
                  {r.staffName && <> &middot; with {r.staffName}</>}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      <section className="bg-brand text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-6 py-16 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-3xl tracking-tight md:text-4xl">
              Ready when you are.
            </h2>
            <p className="mt-3 text-white/70">
              Pick a service and a time online, or call us at{" "}
              <a href={BUSINESS.phoneHref} className="text-white underline underline-offset-4">
                {BUSINESS.phone}
              </a>
              .
            </p>
          </div>
          <Link
            href="/book"
            className="shrink-0 rounded-sm bg-white px-6 py-3.5 text-sm font-medium text-brand-dark transition-colors hover:bg-brand-tint"
          >
            Book an appointment
          </Link>
        </div>
      </section>
    </>
  );
}

function SectionHeading({
  title,
  link,
  children,
}: {
  title: string;
  link: { href: string; label: string };
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
        <h2 className="font-display text-3xl tracking-tight text-foreground md:text-4xl">
          {title}
        </h2>
        {children}
      </div>
      <Link
        href={link.href}
        className="text-sm font-medium text-foreground underline decoration-border underline-offset-[6px] hover:decoration-foreground"
      >
        {link.label}
      </Link>
    </div>
  );
}
