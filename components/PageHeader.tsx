import type { ReactNode } from "react";

export default function PageHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <header className="border-b border-border pb-10">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
        {eyebrow}
      </p>
      <h1 className="mt-3 font-display text-4xl tracking-tight text-foreground md:text-5xl">
        {title}
      </h1>
      {children && (
        <div className="mt-4 max-w-xl text-muted">{children}</div>
      )}
    </header>
  );
}
