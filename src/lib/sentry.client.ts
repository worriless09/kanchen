import * as Sentry from '@sentry/nextjs';

Sentry.init({
  // ...
  integrations: [
    Sentry.browserTracingIntegration(), // ✅ Correct integration for v8+
    // ...
  ],
})
