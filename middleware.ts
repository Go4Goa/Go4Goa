import { next } from '@vercel/functions';

export default function middleware() {
  if (process.env.GO_GOA_QA !== 'true') return next();
  const headers = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow, noarchive' };
  return next({ headers });
}
