import { Router } from 'express';
import { createHmac } from 'node:crypto';
import { z } from 'zod';
import { config } from './config.ts';
import { pool,tx,audit } from './db.ts';
import { unseal,signedToken,equal,fail } from './security.ts';
import { requireModerator } from './auth.ts';
import { queueUpdate } from './events.ts';
export const notificationRoutes=Router();
export const optOutToken=(id:string,channel:string)=>signedToken('opt-out:'+id+':'+channel);
notificationRoutes.get('/unsubscribe',async(req,res)=>{
 const user=z.uuid().parse(req.query.user),channel=z.enum(['email','sms']).parse(req.query.channel);if(!equal(String(req.query.token||''),optOutToken(user,channel)))fail(403,'Invalid opt-out link.');
 await tx(async db=>{await db.query(`UPDATE users_private SET ${channel==='sms'?'sms_opt_in':'email_opt_in'}=false WHERE id=$1`,[user]);await db.query(`UPDATE rsvps SET ${channel==='sms'?'sms_consent':'email_consent'}=false WHERE user_id=$1`,[user]);await db.query(`UPDATE notifications SET status='suppressed',error='Opted out',updated_at=now() WHERE user_id=$1 AND channel=$2 AND status='pending'`,[user,channel]);await audit(db,user,'notifications.opted_out',user,null,{channel});});
 res.type('text/plain').send(`You have opted out of GO-GOA ${channel==='sms'?'SMS':'email'} updates. You can change this in your profile.`);
});
notificationRoutes.get('/deliveries',requireModerator,async(_req,res)=>res.json({deliveries:(await pool.query('SELECT id,event_id,channel,status,attempts,error,created_at,updated_at FROM notifications ORDER BY created_at DESC LIMIT 100')).rows}));
notificationRoutes.post('/twilio-status',async(req,res)=>{
 if(!config.twilioToken)fail(503,'Provider unavailable.');const url=config.origin+'/api/notifications/twilio-status';const payload=req.body as Record<string,string>;const canonical=url+Object.keys(payload).sort().map(k=>k+payload[k]).join('');const signature=createHmac('sha1',config.twilioToken).update(canonical).digest('base64');if(!equal(String(req.headers['x-twilio-signature']||''),signature)||payload.AccountSid!==config.twilioSid)fail(403,'Invalid signature.');const status=payload.MessageStatus==='delivered'?'delivered':['failed','undelivered'].includes(payload.MessageStatus)?'failed':'accepted';await pool.query(`UPDATE notifications SET status=$2,error=$3,updated_at=now() WHERE provider_id=$1 AND channel='sms' AND status<>'delivered'`,[payload.MessageSid,status,payload.ErrorCode||null]);res.status(204).end();
});
notificationRoutes.post('/resend-status',async(req,res)=>{
 if(!config.resendWebhook||!Buffer.isBuffer(req.body))fail(503,'Provider unavailable.');const id=String(req.headers['svix-id']||''),stamp=String(req.headers['svix-timestamp']||'');if(Math.abs(Date.now()/1000-Number(stamp))>300)fail(403,'Expired callback.');const expected=createHmac('sha256',Buffer.from(config.resendWebhook.replace(/^whsec_/,''),'base64')).update(id+'.'+stamp+'.'+req.body.toString('utf8')).digest('base64');const signatures=String(req.headers['svix-signature']||'').split(' ').map(s=>s.split(',')[1]||'');if(!signatures.some(s=>equal(s,expected)))fail(403,'Invalid signature.');const data=JSON.parse(req.body.toString('utf8'));const status=data.type==='email.delivered'?'delivered':['email.bounced','email.failed','email.complained'].includes(data.type)?'failed':null;if(status)await pool.query(`UPDATE notifications SET status=$2,error=$3,updated_at=now() WHERE provider_id=$1 AND channel='email'`,[data.data?.email_id,status,status==='failed'?data.type:null]);if(data.type==='email.complained'||data.type==='email.bounced')await pool.query(`UPDATE users_private SET email_opt_in=false WHERE id IN (SELECT user_id FROM notifications WHERE provider_id=$1)`,[data.data?.email_id]);res.status(204).end();
});
export async function scheduleReminders() {
 await tx(async db=>{const es=(await db.query(`SELECT id,title,version FROM events WHERE status='published' AND starts_at>now() AND starts_at<now()+interval '24 hours'`)).rows;for(const e of es)await queueUpdate(db,e.id,'Meetup reminder',`${e.title} is coming up. Open GO-GOA to check the current meetup details.`,`reminder:${e.id}:${e.version}`);});
}
export async function deliverOne(fetcher:typeof fetch=fetch) {
 const job=await tx(async db=>{const j=(await db.query(`SELECT * FROM notifications WHERE status='pending' ORDER BY created_at FOR UPDATE SKIP LOCKED LIMIT 1`)).rows[0];if(!j)return null;await db.query(`UPDATE notifications SET status='processing',attempts=attempts+1,updated_at=now() WHERE id=$1`,[j.id]);return j;});if(!job)return false;
 const u=(await pool.query(`SELECT u.*,r.status AS rsvp_status,r.email_consent,r.sms_consent FROM users_private u JOIN rsvps r ON r.user_id=u.id AND r.event_id=$2 WHERE u.id=$1`,[job.user_id,job.event_id])).rows[0];
 let status='failed',providerId:string|null=null,error:string|null=null;
 const consent=u&&!u.deleted_at&&u.rsvp_status==='confirmed'&&u[job.channel+'_opt_in']&&u[job.channel+'_consent']&&u[job.channel==='sms'?'phone_verified':'email_verified'];
 if(!consent){status='suppressed';error='Consent or RSVP no longer active';}
 else if(u.demo||config.demo){status='suppressed';error='Local demo: no message sent';}
 else {
  const optout=`${config.origin}/api/notifications/unsubscribe?user=${u.id}&channel=${job.channel}&token=${optOutToken(u.id,job.channel)}`;
  try {
   let response:Response;
   if(job.channel==='email'){
    if(!config.resend||!config.emailFrom)throw new Error('Email provider not configured');
    response=await fetcher('https://api.resend.com/emails',{method:'POST',headers:{authorization:'Bearer '+config.resend,'content-type':'application/json','idempotency-key':job.id},body:JSON.stringify({from:config.emailFrom,to:[unseal<string>(u.email_cipher)],subject:job.subject,text:job.body+'\n\n'+config.origin+'/events/'+job.event_id+'\nStop email updates: '+optout}),signal:AbortSignal.timeout(12000)});
   }else{
    if(!config.messagingSid||!config.twilioSid||!config.twilioToken)throw new Error('SMS provider not configured');
    response=await fetcher(`https://api.twilio.com/2010-04-01/Accounts/${config.twilioSid}/Messages.json`,{method:'POST',headers:{authorization:'Basic '+Buffer.from(config.twilioSid+':'+config.twilioToken).toString('base64'),'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({To:unseal<string>(u.phone_cipher),MessagingServiceSid:config.messagingSid,Body:job.body+'\nStop updates: '+optout,StatusCallback:config.origin+'/api/notifications/twilio-status',ContentRetention:'discard',AddressRetention:'obfuscate'}),signal:AbortSignal.timeout(12000)});
   }
   if(!response.ok)throw new Error('Provider HTTP '+response.status);const result=await response.json() as {id?:string;sid?:string};providerId=result.id||result.sid||null;if(!providerId){status='unknown';error='Provider response did not include an identifier';}else status='accepted';
  }catch(e){error=e instanceof Error?e.message:'Delivery failed';status=error.includes('not configured')||error.startsWith('Provider HTTP 4')?'failed':'unknown';}
 }
 await tx(async db=>{await db.query('UPDATE notifications SET status=$2,provider_id=$3,error=$4,updated_at=now() WHERE id=$1',[job.id,status,providerId,error]);await audit(db,null,'notification.outcome',job.id,{status:'processing'},{status,error});});return true;
}
