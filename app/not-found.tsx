import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-6 py-24 text-center">
      <span className="font-display text-6xl text-brand">404</span>
      <h1 className="font-display text-2xl text-foreground">Page not found</h1>
      <p className="text-sm text-muted">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <Link
        href="/"
        className="mt-4 rounded-full bg-brand px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
      >
        Back to home
      </Link>
    </div>
  );
}
