import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import type { Request } from 'express';
import { config } from './config.ts';
import { pool, type DB } from './db.ts';
export class HttpError extends Error { constructor(public status: number, message: string) { super(message); } }
export const fail = (status: number, message: string): never => { throw new HttpError(status, message); };
export const hash = (s: string|Buffer) => createHash('sha256').update(s).digest('hex');
export const lookupHash = (s: string) => createHmac('sha256', Buffer.from(config.dataKey,'hex')).update('lookup:'+s).digest('hex');
export function seal(value: unknown) { const iv=randomBytes(12); const c=createCipheriv('aes-256-gcm',Buffer.from(config.dataKey,'hex'),iv); const data=Buffer.concat([c.update(JSON.stringify(value),'utf8'),c.final()]); return Buffer.concat([iv,c.getAuthTag(),data]).toString('base64'); }
export function unseal<T>(value: string): T { const b=Buffer.from(value,'base64'); const d=createDecipheriv('aes-256-gcm',Buffer.from(config.dataKey,'hex'),b.subarray(0,12));d.setAuthTag(b.subarray(12,28));return JSON.parse(Buffer.concat([d.update(b.subarray(28)),d.final()]).toString()); }
export function signedToken(value: string) { return createHmac('sha256',Buffer.from(config.dataKey,'hex')).update(value).digest('base64url'); }
export function equal(a: string,b: string) { return timingSafeEqual(Buffer.from(hash(a)),Buffer.from(hash(b))); }
export async function rate(key: string, maximum: number, seconds: number, db: DB=pool) {
  const bucket=Math.floor(Date.now()/1000/seconds); const id=lookupHash(key)+':'+bucket;
  const { rows }=await db.query('INSERT INTO rate_limits(key,hits,expires_at) VALUES ($1,1,now()+$2*interval \'1 second\') ON CONFLICT(key) DO UPDATE SET hits=rate_limits.hits+1 RETURNING hits',[id,seconds*2]);
  if(rows[0].hits>maximum) fail(429,'Too many attempts. Please wait and try again.');
}
export function clientIp(req: Request) { return req.ip || req.socket.remoteAddress || 'unknown'; }
export function assertSameOrigin(req: Request) {
 const localOrigins=!config.production&&!config.qa?['http://127.0.0.1:4310','http://127.0.0.1:4312']:[];
 const origins=[config.origin,...localOrigins,...(config.qa?[process.env.VERCEL_URL,process.env.VERCEL_BRANCH_URL].filter(Boolean).map(host=>'https://'+host):[])];
 if(!origins.includes(String(req.headers.origin)))fail(403,'This page address is not allowed to submit changes. Open the configured GO-GOA app address and try again.');
}
export function publicPoint(point:{lat:number;lng:number},blur:boolean) { return blur ? {lat:Number((Math.floor(point.lat*100)/100+.005).toFixed(3)),lng:Number((Math.floor(point.lng*100)/100+.005).toFixed(3))}:point; }
export function distance(a:{lat:number;lng:number},b:{lat:number;lng:number}) { const r=Math.PI/180;const h=Math.sin((a.lat-b.lat)*r/2)**2+Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin((a.lng-b.lng)*r/2)**2;return 6371000*2*Math.asin(Math.sqrt(Math.min(1,h))); }
