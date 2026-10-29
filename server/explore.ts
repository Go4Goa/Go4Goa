import { Router } from 'express';
import { z } from 'zod';
import { pool } from './db.ts';
import { incidentSelect,incidentView,eventSelect,eventView } from './projections.ts';
import { categoryIds } from '../shared/model.ts';
import { fail } from './security.ts';
export const explore=Router();
explore.get('/',async(req,res)=>{
 const mode=z.enum(['all','incidents','events']).catch('all').parse(req.query.mode);const category=z.enum(['all','infrastructure',...categoryIds]).catch('all').parse(req.query.category);
 const statuses=z.enum(['all','verified','in_progress','resolved']).catch('all').parse(req.query.status);const dates=z.enum(['all','today','week']).catch('all').parse(req.query.dates);
 const q=String(req.query.q||'').trim().slice(0,100).replace(/[%_\\]/g,'');const bounds=req.query.bounds?String(req.query.bounds).split(',').map(Number):[73.6,14.8,74.4,15.85];if(bounds.length!==4||bounds.some(n=>!Number.isFinite(n))||bounds[0]>=bounds[2]||bounds[1]>=bounds[3])fail(400,'Invalid map area.');
 const near=req.query.near?String(req.query.near).split(',').map(Number):null;const radius=Number(req.query.radius||10000);if(near&&(near.length!==2||near.some(n=>!Number.isFinite(n))||near[0]<14.8||near[0]>15.85||near[1]<73.6||near[1]>74.4||radius<100||radius>100000))fail(400,'Choose a location in Goa and a radius up to 100 km.');
 const result=[];
 for(const kind of ['incident','event'] as const){if(kind==='incident'&&mode==='events'||kind==='event'&&mode==='incidents')continue;const a=kind==='incident'?'i':'e';const p:unknown[]=[bounds[0],bounds[1],bounds[2],bounds[3]];const where=[`${a}.public_lng BETWEEN $1 AND $3`,`${a}.public_lat BETWEEN $2 AND $4`,kind==='incident'?`i.status IN ('verified','in_progress','resolved')`:`e.status='published' AND e.ends_at>now()`];
  if(near){p.push(near[0],near[1],radius);where.push(`goa_distance_m(${a}.public_lat,${a}.public_lng,$5,$6)<$7`);}
  if(kind==='incident'&&category!=='all'){if(category==='infrastructure')where.push(`i.category<>'trash'`);else{p.push(category);where.push(`i.category=$${p.length}`);}}if(kind==='incident'&&statuses!=='all'){p.push(statuses);where.push(`i.status=$${p.length}`);}
  if(kind==='event'&&dates!=='all')where.push(dates==='today'?`(e.starts_at AT TIME ZONE 'Asia/Kolkata')::date=(now() AT TIME ZONE 'Asia/Kolkata')::date`:`e.starts_at<now()+interval '7 days'`);
  if(q){p.push('%'+q+'%');where.push(`lower(${a}.location_label||' '||${kind==='incident'?'i.category':'e.title'}) LIKE lower($${p.length})`);}
  let select=kind==='incident'?incidentSelect:eventSelect;if(near)select=select.replace('SELECT ',`SELECT goa_distance_m(${a}.public_lat,${a}.public_lng,$5,$6) AS distance, `);
  const rows=(await pool.query(select+' WHERE '+where.join(' AND ')+' ORDER BY '+(near?'distance, ':'')+(kind==='incident'?'i.created_at DESC':'e.starts_at')+' LIMIT 101',p)).rows;
  result.push({kind,rows});
 }
 res.json({items:result.flatMap(r=>r.rows.slice(0,100).map(r.kind==='incident'?incidentView:eventView as any)),limited:result.some(r=>r.rows.length>100)});
});
