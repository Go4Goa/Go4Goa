import { next } from '@vercel/functions';
import { qaAuthorized } from './shared/qa-access.ts';

export default async function middleware(request: Request) {
  if (process.env.GO_GOA_QA !== 'true') return next();
  const headers = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow, noarchive' };
  if (!await qaAuthorized(request.headers.get('authorization'), process.env.QA_ACCESS_CODE)) {
    return new Response('Private GO-GOA QA. Use the shared QA credentials.', {
      status: 401,
      headers: { ...headers, 'WWW-Authenticate': 'Basic realm="GO-GOA QA", charset="UTF-8"' },
    });
  }
  return next({ headers });
}
