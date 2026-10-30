// Workbox matches these against pathname + search, so every document
// exclusion must also match a query string (for example campaign links).
export const appNavigationDenylist = [
  /^\/api\//,
  /^\/(?:\?|$)/,
  /^\/(?:index|credits)\.html(?:\?|$)/,
];
