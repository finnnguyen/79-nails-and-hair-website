import * as Sentry from "@sentry/nextjs";

// proxy.ts doesn't currently opt into the edge runtime, but this covers it
// if that ever changes — Next.js only loads this when NEXT_RUNTIME is edge.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.2,
  debug: false,
});
