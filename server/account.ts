import { Router } from 'express';
import { z } from 'zod';
import { pool,tx,audit } from './db.ts';
import { requireAccount } from './auth.ts';
import { incidentSelect,incidentView,eventSelect,eventView } from './projections.ts';
import { fail,rate } from './security.ts';
import { deleteAsset } from './storage.ts';
export const account=Router();account.use(requireAccount);
account.get('/',async(req,res)=>{
 const id=req.account!.id;
 const [reports,organized,participation,bookmarked,points]=await Promise.all([
  pool.query(incidentSelect+' WHERE i.reporter_id=$1 ORDER BY i.created_at DESC',[id]),
  pool.query(eventSelect+' WHERE e.organizer_id=$1 ORDER BY e.starts_at DESC',[id]),
  pool.query(eventSelect+` JOIN rsvps r ON r.event_id=e.id WHERE r.user_id=$1 AND r.status='confirmed' ORDER BY e.starts_at DESC`,[id]),
  pool.query(eventSelect+' JOIN bookmarks b ON b.event_id=e.id WHERE b.user_id=$1 ORDER BY b.created_at DESC',[id]),
  pool.query('SELECT reason,source_id,points,created_at FROM points_ledger WHERE user_id=$1 ORDER BY id DESC',[id]),
 ]);
 const attendance=(await pool.query('SELECT event_id,checked_in_at FROM rsvps WHERE user_id=$1 AND checked_in_at IS NOT NULL',[id])).rows;
 res.json({reports:reports.rows.map(incidentView),organized:organized.rows.map(eventView),rsvps:participation.rows.map(r=>({...eventView(r),checkedIn:attendance.some(a=>a.event_id===r.id)})),bookmarked:bookmarked.rows.map(eventView),points:points.rows,totalPoints:points.rows.reduce((sum,r)=>sum+r.points,0),recognition:points.rows.length?'Community contributor':'Getting started'});
});
account.post('/bookmarks/:id',async(req,res)=>{const id=z.uuid().parse(req.params.id);await rate('bookmark:'+req.account!.id,60,3600);const e=(await pool.query(`SELECT id FROM events WHERE id=$1 AND status<>'pending'`,[id])).rows[0];if(!e)fail(404,'Meetup not found.');await pool.query('INSERT INTO bookmarks(event_id,user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',[id,req.account!.id]);res.json({ok:true});});
account.delete('/bookmarks/:id',async(req,res)=>{await pool.query('DELETE FROM bookmarks WHERE event_id=$1 AND user_id=$2',[z.uuid().parse(req.params.id),req.account!.id]);res.json({ok:true});});
account.get('/export',async(req,res)=>{const id=req.account!.id;await rate('export:'+id,3,3600);const tables=['incidents','events','rsvps','points_ledger','bookmarks'] as const;const data:Record<string,unknown>={profile:{id,username:req.account!.username},exportedAt:new Date().toISOString()};for(const table of tables){const key=table==='incidents'?'reporter_id':table==='events'?'organizer_id':'user_id';data[table]=(await pool.query(`SELECT * FROM ${table} WHERE ${key}=$1`,[id])).rows;}res.set('Content-Disposition','attachment; filename="go-goa-export.json"').json(data);});
account.delete('/',async(req,res)=>{
 if(req.body.confirm!==req.account!.username)fail(400,'Type your username to confirm account deletion.');const id=req.account!.id;await rate('delete:'+id,2,3600);
 const assets=(await pool.query('SELECT m.asset_key,m.thumb_key FROM media m JOIN incidents i ON i.id=m.incident_id WHERE i.reporter_id=$1',[id])).rows;
 await tx(async db=>{await db.query(`UPDATE users_private SET phone_cipher=NULL,phone_hash=NULL,email_cipher=NULL,email_hash=NULL,phone_verified=false,email_verified=false,email_opt_in=false,sms_opt_in=false,deleted_at=now() WHERE id=$1`,[id]);await db.query('UPDATE profiles SET username=$2 WHERE id=$1',[id,'deleted_'+id.replaceAll('-','').slice(0,12)]);await db.query('DELETE FROM sessions WHERE user_id=$1',[id]);await db.query('DELETE FROM verification_challenges WHERE user_id=$1',[id]);await db.query('DELETE FROM incident_private WHERE incident_id IN (SELECT id FROM incidents WHERE reporter_id=$1)',[id]);await db.query(`UPDATE incidents SET status='closed',description='',location_label='Removed',public_lat=15.5,public_lng=73.8 WHERE reporter_id=$1`,[id]);await db.query(`UPDATE media SET state='withheld',alt='Removed' WHERE incident_id IN (SELECT id FROM incidents WHERE reporter_id=$1)`,[id]);await db.query(`UPDATE rsvps SET status='cancelled',sms_consent=false,email_consent=false WHERE user_id=$1`,[id]);await db.query('DELETE FROM bookmarks WHERE user_id=$1',[id]);await db.query(`UPDATE events SET status='cancelled',version=version+1 WHERE organizer_id=$1 AND ends_at>now()`,[id]);await audit(db,id,'account.deleted',id,null,{anonymized:true});});
 for(const a of assets){await deleteAsset(a.asset_key);await deleteAsset(a.thumb_key);}res.clearCookie('go_goa_session',{path:'/'}).json({ok:true});
});
