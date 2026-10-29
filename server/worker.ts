import { syncResources } from './actforgoa.ts';
import { deliverOne,scheduleReminders } from './notifications.ts';
import { pool } from './db.ts';
import { aiReviewEnabled,runPendingReviews } from './ai-review.ts';
let stopping=false,lastSync=0;
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{stopping=true;});
while(!stopping){try{if(Date.now()-lastSync>3600000){await syncResources();lastSync=Date.now();}await scheduleReminders();await pool.query(`UPDATE notifications SET status='unknown',error='Worker interrupted after claiming; inspect provider before retry',updated_at=now() WHERE status='processing' AND updated_at<now()-interval '5 minutes'`);for(let i=0;i<20&&await deliverOne();i++){}if(aiReviewEnabled())await runPendingReviews(5);await pool.query('DELETE FROM rate_limits WHERE expires_at<now()');await pool.query('DELETE FROM sessions WHERE expires_at<now()');await pool.query('DELETE FROM verification_challenges WHERE expires_at<now()');}catch(e){console.error('Worker iteration failed',e instanceof Error?e.name:'unknown');}if(!stopping)await new Promise(r=>setTimeout(r,30000));}
await pool.end();
