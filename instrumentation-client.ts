import * as Sentry from "@sentry/nextjs";
import posthog from "posthog-js";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // Keep this low — it's a low-traffic small-business site, no need to pay
  // for/store a trace on every single page view.
  tracesSampleRate: 0.2,
  debug: false,
});

// Product analytics. Skipped entirely when the key isn't set (local dev,
// previews without the env var), so nothing is sent by accident.
const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
if (posthogKey) {
  try {
    posthog.init(posthogKey, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
      // Captures page views on client-side navigations, not just full loads.
      defaults: "2026-08-30",
      // Anonymous visitors only — customers never log in, so no person
      // profiles are needed.
      person_profiles: "identified_only",
      session_recording: {
        // Customer names, phones, and emails must never land in a replay.
        maskAllInputs: true,
        maskTextSelector: ".ph-no-capture",
      },
      // Staff-only admin pages are not part of the customer funnel.
      before_send: (event) =>
        window.location.pathname.startsWith("/admin") ? null : event,
    });
  } catch (error) {
    Sentry.captureException(error);
  }
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
