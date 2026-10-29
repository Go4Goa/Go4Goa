import test from 'node:test';
import assert from 'node:assert/strict';
import { phoneVerificationEnabled, selectTwilioVerifyCredentials } from '../server/twilio-credentials.ts';
import { requestTwilioVerification } from '../server/twilio-verify.ts';

const credentials = {
  credentialSid: 'SK_test',
  credentialSecret: 'secret',
  serviceSid: 'VA_test',
};

test('restricted API keys take priority over main account credentials', () => {
  assert.deepEqual(selectTwilioVerifyCredentials({
    apiKeySid: 'SK_restricted', apiKeySecret: 'restricted-secret',
    accountSid: 'AC_main', authToken: 'main-secret', serviceSid: 'VA_test',
  }), { credentialSid: 'SK_restricted', credentialSecret: 'restricted-secret', serviceSid: 'VA_test' });
  assert.deepEqual(selectTwilioVerifyCredentials({
    apiKeySid: '', apiKeySecret: '', accountSid: 'AC_main', authToken: 'main-secret', serviceSid: 'VA_test',
  }), { credentialSid: 'AC_main', credentialSecret: 'main-secret', serviceSid: 'VA_test' });
});

test('phone verification requires the feature flag and all provider credentials', () => {
  assert.equal(phoneVerificationEnabled(false, credentials), false);
  assert.equal(phoneVerificationEnabled(true, credentials), true);
  assert.equal(phoneVerificationEnabled(true, { ...credentials, credentialSecret: '' }), false);
});

test('Twilio Verify requests use the service endpoint and server credentials', async () => {
  let request: { url: string; init?: RequestInit } | undefined;
  const fetcher: typeof fetch = async (url, init) => {
    request = { url: String(url), init };
    return new Response(JSON.stringify({ status: 'pending' }), {
      status: 201,
      headers: { 'content-type': 'application/json' },
    });
  };

  const result = await requestTwilioVerification(credentials, 'Verifications', {
    To: '+919876543210',
    Channel: 'sms',
  }, fetcher);

  assert.deepEqual(result, { status: 'pending' });
  assert.equal(request?.url, 'https://verify.twilio.com/v2/Services/VA_test/Verifications');
  assert.equal(new Headers(request?.init?.headers).get('authorization'), `Basic ${Buffer.from('SK_test:secret').toString('base64')}`);
  assert.equal(String(request?.init?.body), 'To=%2B919876543210&Channel=sms');
});

test('Twilio Verify maps provider throttling to a retryable client error', async () => {
  const fetcher: typeof fetch = async () => new Response('{}', { status: 429 });
  await assert.rejects(
    requestTwilioVerification(credentials, 'VerificationCheck', { To: '+919876543210', Code: '123456' }, fetcher),
    (error: unknown) => {
      assert.equal((error as { status?: number }).status, 429);
      assert.match((error as Error).message, /try again shortly/i);
      return true;
    },
  );
});

test('Twilio Verify rejects malformed success payloads', async () => {
  const fetcher: typeof fetch = async () => new Response(JSON.stringify({ ok: true }), { status: 200 });
  await assert.rejects(
    requestTwilioVerification(credentials, 'VerificationCheck', { To: '+919876543210', Code: '123456' }, fetcher),
    (error: unknown) => {
      assert.equal((error as { status?: number }).status, 502);
      return true;
    },
  );
});

test('Twilio Verify maps network failures to a provider error', async () => {
  const fetcher: typeof fetch = async () => { throw new Error('socket failure'); };
  await assert.rejects(
    requestTwilioVerification(credentials, 'Verifications', { To: '+919876543210', Channel: 'sms' }, fetcher),
    (error: unknown) => {
      assert.equal((error as { status?: number }).status, 502);
      assert.doesNotMatch((error as Error).message, /socket failure/);
      return true;
    },
  );
});
