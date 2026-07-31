"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function Error({
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
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-6 py-24 text-center">
      <h1 className="font-display text-2xl text-foreground">Something went wrong</h1>
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
    </div>
  );
}
