import Link from "next/link";
import type { ReactNode } from "react";

type QuickLinkCardProps = {
  href: string;
  title: string;
  description: string;
  icon: ReactNode;
};

export default function QuickLinkCard({
  href,
  title,
  description,
  icon,
}: QuickLinkCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 transition-all hover:-translate-y-1 hover:border-brand/40 hover:shadow-lg hover:shadow-brand/5"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-tint text-brand">
        {icon}
      </span>
      <div>
        <h3 className="font-display text-lg text-foreground">{title}</h3>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </div>
      <span className="mt-auto text-sm font-medium text-brand opacity-0 transition-opacity group-hover:opacity-100">
        Explore &rarr;
      </span>
    </Link>
  );
}
