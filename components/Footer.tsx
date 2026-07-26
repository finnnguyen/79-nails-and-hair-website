import { BUSINESS } from "@/lib/business-info";

export default function Footer() {
  return (
    <footer className="border-t border-border/70 bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 text-sm text-muted md:flex-row md:items-center md:justify-between">
        <p className="font-display text-lg text-brand">79 Nails &amp; Hair</p>
        <div className="flex flex-col gap-1 md:flex-row md:gap-6">
          <a
            href={BUSINESS.addressHref}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-brand"
          >
            {BUSINESS.address}
          </a>
          <a href={BUSINESS.phoneHref} className="hover:text-brand">
            {BUSINESS.phone}
          </a>
          <span>Tue–Sat 9:10am–7pm · Sun 9:10am–6pm · Closed Mon</span>
        </div>
        <p>&copy; {new Date().getFullYear()} 79 Nails &amp; Hair Salon</p>
      </div>
    </footer>
  );
}
