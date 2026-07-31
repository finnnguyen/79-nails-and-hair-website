import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
};

// org/project/authToken are picked up automatically from the SENTRY_ORG /
// SENTRY_PROJECT / SENTRY_AUTH_TOKEN env vars set by the Vercel integration.
export default withSentryConfig(nextConfig, {
  silent: !process.env.CI,
  widenClientFileUpload: true,
});
