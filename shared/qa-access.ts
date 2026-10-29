/** Authorizes shared QA test-account creation, never public page access. */
export async function qaAuthorized(authorization: string | null, code: string | undefined) {
  if (!code || code.length < 24 || !authorization?.startsWith('Basic ')) return false;
  let supplied: string;
  try { supplied = atob(authorization.slice(6)); } catch { return false; }
  const digest = async (value: string) => new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)));
  const [actual, expected] = await Promise.all([digest(supplied), digest('qa:' + code)]);
  let difference = 0;
  for (let i = 0; i < expected.length; i++) difference |= actual[i] ^ expected[i];
  return difference === 0;
}
