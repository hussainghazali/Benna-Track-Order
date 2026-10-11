// Analytics shim — the real module forwards to Clarity/Meta/Algolia insights.
// Standalone build: no-op (events are non-critical).
export const trackEvent = {
  submitBOQ: (_projectType?: string) => {},
  search: (_query?: string) => {},
};
