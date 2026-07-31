"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import "./globals.css";

// Catches errors in the root layout itself — the rarest error path, and the
// only one that can't rely on Header/Footer rendering, since this replaces
// the whole document when it fires. Keep this self-contained.
export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-2xl font-semibold text-foreground">Something went wrong</h1>
        <p className="text-sm text-muted">
          Sorry about that — please try again, or come back in a few minutes.
        </p>
        {error.digest && (
          <p className="font-mono text-xs text-muted/70">Reference: {error.digest}</p>
        )}
        <button
          onClick={() => unstable_retry()}
          className="mt-4 rounded-full bg-brand px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
