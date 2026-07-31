import { defineConfig } from "vitest/config";

// Pure-logic unit tests only (no React component rendering), so no jsdom or
// React Testing Library — keep the test setup as light as what's actually
// being tested.
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    // Business-hours logic in booking-availability.ts is timezone-sensitive
    // (open/close times, which weekday "today" is) — pin to the salon's own
    // timezone so date-boundary tests are deterministic regardless of what
    // timezone the machine running them is in.
    env: { TZ: "America/Los_Angeles" },
  },
});
