import { Router, type Request, type RequestHandler, type Response } from 'express';
import { randomBytes, randomUUID, randomInt } from 'node:crypto';
import { z } from 'zod';
import { config } from './config.ts';
import { pool, tx, audit } from './db.ts';
import { clientIp, fail, hash, lookupHash, seal, unseal, rate, equal } from './security.ts';
import type { Account } from '../shared/model.ts';
import { qaAuthorized } from '../shared/qa-access.ts';

declare global { namespace Express { interface Request { account?: Account } } }
export const auth = Router();
const phoneSchema=z.string().regex(/^\+[1-9]\d{7,14}$/,'Include a country code, for example +91.');
const usernameSchema=z.string().trim().toLowerCase().regex(/^[a-z][a-z0-9_]{2,23}$/,'Use 3–24 lowercase letters, numbers or underscores.').refine(v=>!['admin','moderator','go_goa','actforgoa','support','deleted'].includes(v),'Choose another username.');
export const loadAccount: RequestHandler=async(req,_res,next)=>{
 try {const token=req.cookies?.go_goa_session; if(typeof token==='string') {const {rows}=await pool.query(`SELECT u.id,p.username,u.role,u.phone_verified,u.email_verified,u.sms_opt_in,u.email_opt_in,u.demo,s.csrf FROM sessions s JOIN users_private u ON u.id=s.user_id JOIN profiles p ON p.id=u.id WHERE s.token_hash=$1 AND s.expires_at>now() AND u.deleted_at IS NULL`,[hash(token)]);const r=rows[0];if(r)req.account={id:r.id,username:r.username,role:r.role,verified:r.phone_verified,emailVerified:r.email_verified,smsOptIn:r.sms_opt_in,emailOptIn:r.email_opt_in,demo:r.demo,csrf:r.csrf};}next();}catch(e){next(e);}
};
export const requireAccount: RequestHandler=(req,_res,next)=>{ if(!req.account)return next(Object.assign(new Error('Sign in to continue.'),{status:401})); if(!['GET','HEAD'].includes(req.method)&&!equal(String(req.headers['x-csrf-token']||''),req.account.csrf))return next(Object.assign(new Error('Refresh the page and try again.'),{status:403}));next(); };
export const requireModerator: RequestHandler=(req,res,next)=>requireAccount(req,res,e=>{if(e)return next(e);if(!['moderator','admin'].includes(req.account!.role))return next(Object.assign(new Error('Moderator access is required.'),{status:403}));next();});
async function session(res:Response,user:string) { const token=randomBytes(32).toString('base64url'),csrf=randomBytes(24).toString('base64url');await pool.query('INSERT INTO sessions(token_hash,user_id,csrf) VALUES ($1,$2,$3)',[hash(token),user,csrf]);res.cookie('go_goa_session',token,{httpOnly:true,secure:config.production,sameSite:'strict',path:'/',maxAge:14*86400000}); }
async function verifyApi(path:string,data:Record<string,string>) {
 if(config.qa||!config.verifySid||!config.twilioSid||!config.twilioToken) fail(503,'Phone verification is not configured yet.');
 const response=await fetch(`https://verify.twilio.com/v2/Services/${config.verifySid}/${path}`,{method:'POST',headers:{authorization:'Basic '+Buffer.from(config.twilioSid+':'+config.twilioToken).toString('base64'),'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams(data),signal:AbortSignal.timeout(12000)});
 if(!response.ok) fail(response.status===429?429:502,'Verification could not be completed. Please try again shortly.');
 return response.json() as Promise<{status:string}>;
}
auth.get('/me',(req,res)=>res.json({account:req.account||null}));
// Each public-preview visitor gets a separate resident identity without signing in.
auth.post('/guest',async(req,res)=>{
 if(!config.qa)fail(404,'Not found.');
 z.object({}).strict().parse(req.body||{});
 if(req.account){res.json({ok:true});return;}
 await rate('guest:'+clientIp(req),40,3600);
 const id=randomUUID();
 await tx(async db=>{
  await db.query("INSERT INTO users_private(id,role,demo) VALUES ($1,'resident',true)",[id]);
  await db.query('INSERT INTO profiles(id,username) VALUES ($1,$2)',[id,'guest_'+id.replaceAll('-','').slice(0,16)]);
 });
 await session(res,id);res.json({ok:true});
});
auth.post('/request-code',async(req,res)=>{
 const {phone}=z.object({phone:phoneSchema}).strict().parse(req.body);await rate('otp-ip:'+clientIp(req),10,600);await rate('otp-phone:'+phone,3,600);
 await verifyApi('Verifications',{To:phone,Channel:'sms'});
 const id=randomUUID();await pool.query(`INSERT INTO verification_challenges(id,kind,destination_hash,destination_cipher) VALUES ($1,'phone',$2,$3)`,[id,lookupHash(phone),seal(phone)]);res.json({challenge:id});
});
auth.post('/verify-code',async(req,res)=>{
 const v=z.object({challenge:z.uuid(),code:z.string().regex(/^\d{6}$/),username:usernameSchema}).strict().parse(req.body);await rate('otp-check-ip:'+clientIp(req),20,600);
 const {rows}=await pool.query(`SELECT * FROM verification_challenges WHERE id=$1 AND kind='phone' AND expires_at>now() AND consumed_at IS NULL`,[v.challenge]);const ch=rows[0];if(!ch)fail(400,'This code has expired. Request a new one.');await rate('otp-check:'+ch.destination_hash,5,600);
 const result=await verifyApi('VerificationCheck',{To:unseal<string>(ch.destination_cipher),Code:v.code});if(result.status!=='approved')fail(400,'That code was not accepted. Check it and try again.');
 const id=await tx(async db=>{const locked=await db.query('SELECT id FROM verification_challenges WHERE id=$1 AND consumed_at IS NULL FOR UPDATE',[v.challenge]);if(!locked.rowCount)fail(409,'This code has already been used.');const existing=(await db.query('SELECT id,deleted_at FROM users_private WHERE phone_hash=$1',[ch.destination_hash])).rows[0];let id=existing?.id;if(existing?.deleted_at)fail(403,'This account has been deleted.');if(!id){id=randomUUID();await db.query('INSERT INTO users_private(id,phone_hash,phone_cipher,phone_verified) VALUES ($1,$2,$3,true)',[id,ch.destination_hash,ch.destination_cipher]);await db.query('INSERT INTO profiles(id,username) VALUES ($1,$2)',[id,v.username]);await audit(db,id,'account.created',id,null,{username:v.username});}await db.query('UPDATE verification_challenges SET consumed_at=now() WHERE id=$1',[v.challenge]);return id as string;});await session(res,id);res.json({ok:true});
});
auth.post('/demo',async(req,res)=>{
 if(!config.demo||(!config.qa&&(config.production||!['127.0.0.1','::1','::ffff:127.0.0.1'].includes(req.socket.remoteAddress||''))))fail(404,'Not found.');
 // Public browsing must not grant a shared resident or moderator identity.
 if(config.qa&&!await qaAuthorized(req.get('authorization')||null,config.qaAccessCode))fail(403,'Shared test accounts are reserved for automated verification.');
 const role=z.enum(['resident','organizer','moderator']).parse(req.body.role);await rate('demo:'+clientIp(req),30,600);const user=(await pool.query('SELECT id FROM users_private WHERE demo=true AND role=$1 ORDER BY created_at LIMIT 1',[role])).rows[0];if(!user)fail(503,'Run the local seed command first.');await session(res,user.id);res.json({ok:true});
});
auth.post('/logout',requireAccount,async(req,res)=>{await pool.query('DELETE FROM sessions WHERE token_hash=$1',[hash(req.cookies.go_goa_session)]);res.clearCookie('go_goa_session',{path:'/'});res.json({ok:true});});
auth.patch('/preferences',requireAccount,async(req,res)=>{
 const v=z.object({sms:z.boolean(),email:z.boolean()}).strict().parse(req.body);if(v.sms&&!req.account!.verified)fail(400,'Verify your phone before enabling SMS.');if(v.email&&!req.account!.emailVerified)fail(400,'Verify your email before enabling email updates.');
 await tx(async db=>{await db.query('UPDATE users_private SET sms_opt_in=$2,email_opt_in=$3 WHERE id=$1',[req.account!.id,v.sms,v.email]);await audit(db,req.account!.id,'preferences.changed',req.account!.id,{sms:req.account!.smsOptIn,email:req.account!.emailOptIn},v);});res.json({ok:true});
});
auth.post('/email/request',requireAccount,async(req,res)=>{
 const email=z.email().max(254).parse(req.body.email).toLowerCase();await rate('email:'+req.account!.id,3,600);if(config.qa||!config.resend||!config.emailFrom)fail(503,'Email verification is not configured yet.');
 const id=randomUUID(),code=String(randomInt(100000,1000000));await pool.query(`INSERT INTO verification_challenges(id,kind,destination_hash,destination_cipher,code_hash,user_id) VALUES ($1,'email',$2,$3,$4,$5)`,[id,lookupHash(email),seal(email),lookupHash(code+id),req.account!.id]);
 const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{authorization:`Bearer ${config.resend}`,'content-type':'application/json','idempotency-key':id},body:JSON.stringify({from:config.emailFrom,to:[email],subject:'Your GO-GOA email code',text:`Your code is ${code}. It expires in 10 minutes. Verifying your email does not turn on notifications.`}),signal:AbortSignal.timeout(12000)});
 if(!response.ok)fail(502,'Email could not be sent. Please try again later.');res.json({challenge:id});
});
auth.post('/email/verify',requireAccount,async(req,res)=>{
 const v=z.object({challenge:z.uuid(),code:z.string().regex(/^\d{6}$/)}).strict().parse(req.body);await rate('email-check:'+req.account!.id,5,600);
 await tx(async db=>{const r=(await db.query(`SELECT * FROM verification_challenges WHERE id=$1 AND user_id=$2 AND kind='email' AND consumed_at IS NULL AND expires_at>now() FOR UPDATE`,[v.challenge,req.account!.id])).rows[0];if(!r||!equal(r.code_hash,lookupHash(v.code+v.challenge)))fail(400,'That code is invalid or expired.');await db.query('UPDATE users_private SET email_hash=$2,email_cipher=$3,email_verified=true,email_opt_in=false WHERE id=$1',[req.account!.id,r.destination_hash,r.destination_cipher]);await db.query('UPDATE verification_challenges SET consumed_at=now() WHERE id=$1',[v.challenge]);await audit(db,req.account!.id,'email.verified',req.account!.id,null,{verified:true});});res.json({ok:true});
});
