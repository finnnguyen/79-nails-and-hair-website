import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // Keep this low — it's a low-traffic small-business site, no need to pay
  // for/store a trace on every single page view.
  tracesSampleRate: 0.2,
  debug: false,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
