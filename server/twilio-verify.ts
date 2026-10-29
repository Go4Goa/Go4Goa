import { fail } from './security.ts';
import type { TwilioVerifyCredentials } from './twilio-credentials.ts';

export async function requestTwilioVerification(
  credentials: TwilioVerifyCredentials,
  path: 'Verifications' | 'VerificationCheck',
  data: Record<string, string>,
  fetcher: typeof fetch = fetch,
) {
  const response = await fetcher(
      `https://verify.twilio.com/v2/Services/${encodeURIComponent(credentials.serviceSid)}/${path}`,
      {
        method: 'POST',
        headers: {
          authorization: `Basic ${Buffer.from(`${credentials.credentialSid}:${credentials.credentialSecret}`).toString('base64')}`,
          'content-type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(data),
        signal: AbortSignal.timeout(12000),
      },
    ).catch(() => fail(502, 'Verification could not be completed. Please try again shortly.'));
  if (!response.ok) fail(response.status === 429 ? 429 : 502, 'Verification could not be completed. Please try again shortly.');
  const body: unknown = await response.json()
    .catch(() => fail(502, 'Verification could not be completed. Please try again shortly.'));
  if (!body || typeof body !== 'object' || typeof (body as { status?: unknown }).status !== 'string') {
    fail(502, 'Verification could not be completed. Please try again shortly.');
  }
  return { status: (body as { status: string }).status };
}
