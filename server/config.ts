import { randomBytes } from 'node:crypto';
import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const production = process.env.NODE_ENV === 'production';
const qa = process.env.GO_GOA_QA === 'true';
const demo = qa || (!production && process.env.GO_GOA_DEMO !== 'false');
const phoneVerificationRequested = process.env.GO_GOA_PHONE_VERIFICATION === 'true';
const local = resolve('.local');
if (!production) mkdirSync(local, { recursive: true, mode: 0o700 });
function key() {
  if (process.env.DATA_KEY) return process.env.DATA_KEY;
  if (production) throw new Error('DATA_KEY is required.');
  const file = resolve(local, 'data-key');
  if (!existsSync(file)) writeFileSync(file, randomBytes(32).toString('hex'), { mode: 0o600, flag: 'wx' });
  return readFileSync(file, 'utf8').trim();
}
const dataKey = key();
if (!/^[a-f\d]{64}$/i.test(dataKey)) throw new Error('DATA_KEY must be 32 bytes encoded as 64 hex characters.');
export const config = {
  production, qa, demo, local, dataKey, phoneVerificationRequested,
  qaAccessCode: process.env.QA_ACCESS_CODE || '', blobToken: process.env.BLOB_READ_WRITE_TOKEN || '',
  port: Number(process.env.PORT || 4311), origin: process.env.PUBLIC_ORIGIN || 'http://127.0.0.1:4310',
  database: process.env.DATABASE_URL || 'postgresql:///go_goa?host=/tmp',
  afgOrigin: 'https://actforgoa-field-guide.vercel.app',
  twilioSid: process.env.TWILIO_ACCOUNT_SID || '', twilioToken: process.env.TWILIO_AUTH_TOKEN || '',
  verifySid: process.env.TWILIO_VERIFY_SERVICE_SID || '', messagingSid: process.env.TWILIO_MESSAGING_SERVICE_SID || '',
  resend: process.env.RESEND_API_KEY || '', emailFrom: process.env.RESEND_FROM || '', resendWebhook: process.env.RESEND_WEBHOOK_SECRET || '',
  s3Bucket: process.env.S3_BUCKET || '', s3Endpoint: process.env.S3_ENDPOINT || '', s3Region: process.env.S3_REGION || 'auto',
  mapKey: process.env.MAPTILER_KEY || '',
  // Reuse explicitly authorized for local development. Hosted deployments use
  // their own server secret; this value is never returned by /api/config.
  placesKey: process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY || '',
};
export const phoneVerificationCredentials = {
  accountSid: config.twilioSid,
  authToken: config.twilioToken,
  serviceSid: config.verifySid,
};
export function placesApiKey() {
  if (config.placesKey) return config.placesKey;
  const file = resolve(local, 'google-places-key');
  return !production && existsSync(file) ? readFileSync(file, 'utf8').trim() : '';
}
if (production && !qa && (process.env.GO_GOA_DEMO === 'true' || !process.env.DATABASE_URL || !config.s3Bucket || !config.mapKey || !config.origin.startsWith('https://') || !phoneVerificationRequested || !config.verifySid || !config.twilioSid || !config.twilioToken)) {
  throw new Error('Production requires dedicated database, HTTPS origin, private object storage, map provider and Twilio Verify. Demo mode is forbidden.');
}

if (qa && (!process.env.DATABASE_URL || !process.env.DATA_KEY || !config.blobToken || config.qaAccessCode.length < 24 || !config.origin.startsWith('https://'))) {
  throw new Error('Hosted QA requires a dedicated database, encryption key, private Blob store, HTTPS origin and strong access code.');
}
