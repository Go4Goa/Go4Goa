import { randomBytes } from 'node:crypto';
import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const production = process.env.NODE_ENV === 'production';
const demo = !production && process.env.GO_GOA_DEMO !== 'false';
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
  production, demo, local, dataKey,
  port: Number(process.env.PORT || 4311), origin: process.env.PUBLIC_ORIGIN || 'http://127.0.0.1:4310',
  database: process.env.DATABASE_URL || 'postgresql:///go_goa?host=/tmp',
  afgOrigin: 'https://actforgoa-field-guide.vercel.app',
  twilioSid: process.env.TWILIO_ACCOUNT_SID || '', twilioToken: process.env.TWILIO_AUTH_TOKEN || '',
  verifySid: process.env.TWILIO_VERIFY_SERVICE_SID || '', messagingSid: process.env.TWILIO_MESSAGING_SERVICE_SID || '',
  resend: process.env.RESEND_API_KEY || '', emailFrom: process.env.RESEND_FROM || '', resendWebhook: process.env.RESEND_WEBHOOK_SECRET || '',
  s3Bucket: process.env.S3_BUCKET || '', s3Endpoint: process.env.S3_ENDPOINT || '', s3Region: process.env.S3_REGION || 'auto',
  mapKey: process.env.MAPTILER_KEY || '',
};
if (production && (process.env.GO_GOA_DEMO === 'true' || !process.env.DATABASE_URL || !config.s3Bucket || !config.mapKey || !config.origin.startsWith('https://') || !config.verifySid || !config.twilioSid || !config.twilioToken)) {
  throw new Error('Production requires dedicated database, HTTPS origin, private object storage, map provider and Twilio Verify. Demo mode is forbidden.');
}
