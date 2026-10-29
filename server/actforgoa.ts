import { z } from 'zod';
import { Router } from 'express';
import { config } from './config.ts';
import { pool, tx, type DB } from './db.ts';
import { hash, rate, clientIp } from './security.ts';
import { resourceView } from './projections.ts';
import type { Category, Resource } from '../shared/model.ts';

const text=z.string().catch('');
const catalogSchema=z.array(z.object({id:z.string().min(1),title:z.string().min(1),kind:text,summary:text,topics:z.array(z.string()).catch([]),source:text,retrievedAt:text,verification:text,locations:z.array(z.string()).catch([])})).max(15000);
const directorySchema=z.object({version:z.string(),records:z.array(z.object({record_id:z.string().min(1),name:z.string().min(1),record_type:text,collection:text,summary:text,focus_areas:text,goa_location:text,source_urls:text,checked_on:text,verification_status:text,activity_status:text,activity_verification_notes:text})).max(15000)});
const safeUrl=(s:string)=>{try{const u=new URL(s);return ['https:','http:'].includes(u.protocol)?u.href:'';}catch{return '';}};
const clean=(s:string)=>s.replace(/(?<!\d)\+?(?:\d[\s().-]*){10,13}(?!\d)/g,'').replace(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi,'').replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim().slice(0,420);
export function normalizeFeed(source:'catalog'|'directory',input:unknown,revision:string,now=new Date().toISOString()):Resource[] {
 if(source==='catalog')return catalogSchema.parse(input).filter(r=>['resource','organisation','page'].includes(r.kind)).map(r=>({id:'afg:catalog:'+r.id,sourceId:r.id,kind:r.kind==='organisation'?'organisation':'guide',title:clean(r.title),summary:clean(r.summary),topics:r.topics,location:r.locations.join('; '),sourceUrl:safeUrl(r.source),listingUrl:`${config.afgOrigin}/read/${encodeURIComponent(r.id)}`,sourceLabel:'Act For Goa',verifiedAt:null,syncedAt:now,verification:r.verification||'Source listing; current availability unconfirmed',revision}));
 const data=directorySchema.parse(input);return data.records.filter(r=>!['person','volunteer'].includes(r.record_type)&&r.activity_status!=='deceased_historical_record').map(r=>({id:'afg:directory:'+r.record_id,sourceId:r.record_id,kind:r.collection==='government'?'government':r.record_type==='organization'||r.record_type==='network'?'organisation':'contact',title:clean(r.name),summary:clean(r.summary),topics:r.focus_areas.split(' | ').filter(Boolean),location:clean(r.goa_location),sourceUrl:r.source_urls.split(' | ').map(safeUrl).find(Boolean)||'',listingUrl:`${config.afgOrigin}/directory/${encodeURIComponent(r.record_id)}`,sourceLabel:'Act For Goa directory',verifiedAt:/^\d{4}-\d{2}-\d{2}$/.test(r.checked_on)?r.checked_on:null,syncedAt:now,verification:[r.verification_status,r.activity_verification_notes].filter(Boolean).join('. '),revision:data.version+':'+revision}));
}
let inFlight:Promise<unknown>|null=null;
export async function syncResources(fetcher:typeof fetch=fetch) {
 if(inFlight)return inFlight;
 inFlight=(async()=>{
  const lock=await pool.connect();try {
   await lock.query('BEGIN');
   if(!(await lock.query('SELECT pg_try_advisory_xact_lock(43104311) AS locked')).rows[0].locked)return {busy:true};
   for(const source of ['catalog','directory'] as const){
    const state=(await pool.query('SELECT * FROM sync_state WHERE source=$1',[source])).rows[0];
    try{
     await pool.query('INSERT INTO sync_state(source,last_attempt) VALUES ($1,now()) ON CONFLICT(source) DO UPDATE SET last_attempt=now()',[source]);
     const response=await fetcher(config.afgOrigin+(source==='catalog'?'/data/catalog.json':'/data/crm.json'),{headers:{accept:'application/json',...(state?.etag?{'if-none-match':state.etag}:{})},signal:AbortSignal.timeout(15000),redirect:'error'});
     if(response.status===304){await pool.query('UPDATE sync_state SET last_success=now(),last_error=NULL WHERE source=$1',[source]);await pool.query('UPDATE resources SET synced_at=now() WHERE id LIKE $1',['afg:'+source+':%']);await pool.query(`INSERT INTO sync_runs(source,status,revision,records) VALUES ($1,'unchanged',$2,$3)`,[source,state?.revision,state?.record_count]);continue;}
     if(!response.ok)throw new Error('Upstream HTTP '+response.status);
     if(Number(response.headers.get('content-length')||0)>20*1024*1024)throw new Error('Upstream response too large');
     const reader=response.body!.getReader();let bytes=0;const chunks:Uint8Array[]=[];while(true){const {done,value}=await reader.read();if(done)break;bytes+=value.length;if(bytes>20*1024*1024){await reader.cancel();throw new Error('Upstream response too large');}chunks.push(value);}
     const body=Buffer.concat(chunks).toString('utf8'),revision=hash(body);const records=normalizeFeed(source,JSON.parse(body),revision);if(!records.length)throw new Error('Empty snapshot rejected');
     await tx(async db=>{await db.query('UPDATE resources SET active=false WHERE id LIKE $1',['afg:'+source+':%']);
      await db.query(`INSERT INTO resources(id,source_id,kind,title,summary,topics,location,source_url,listing_url,source_label,verified_at,verification,revision,synced_at,active)
        SELECT id,"sourceId",kind,title,summary,topics,location,"sourceUrl","listingUrl","sourceLabel","verifiedAt",verification,revision,now(),true
        FROM jsonb_to_recordset($1::jsonb) AS r(id text,"sourceId" text,kind text,title text,summary text,topics text[],location text,"sourceUrl" text,"listingUrl" text,"sourceLabel" text,"verifiedAt" text,verification text,revision text)
        ON CONFLICT(id) DO UPDATE SET kind=excluded.kind,title=excluded.title,summary=excluded.summary,topics=excluded.topics,location=excluded.location,source_url=excluded.source_url,listing_url=excluded.listing_url,source_label=excluded.source_label,verified_at=excluded.verified_at,verification=excluded.verification,revision=excluded.revision,synced_at=now(),active=true`,[JSON.stringify(records)]);
      await db.query('UPDATE sync_state SET etag=$2,revision=$3,last_success=now(),last_error=NULL,record_count=$4 WHERE source=$1',[source,response.headers.get('etag'),revision,records.length]);await db.query(`INSERT INTO sync_runs(source,status,revision,records) VALUES ($1,'success',$2,$3)`,[source,revision,records.length]);
     });
    }catch(error){const message=error instanceof z.ZodError?'Upstream schema changed':error instanceof Error?error.message:'Sync failed';await pool.query('UPDATE sync_state SET last_error=$2 WHERE source=$1',[source,message]);await pool.query(`INSERT INTO sync_runs(source,status,error) VALUES ($1,'error',$2)`,[source,message]);}
   }
   return {ok:true};
  }finally{await lock.query('ROLLBACK');lock.release();}
 })().finally(()=>{inFlight=null;});return inFlight;
}
export const matchTerms:Record<Category,string[]>={trash:['waste','recycl','cleanup'],pothole:['public works','road','mobility'],streetlight:['electric','streetlight'],water:['water','public works'],electrical:['electric','emergency'],other:['civic','municipal','panchayat']};
export async function matchResources(db:DB,incidentId:string,category:Category) {
 const terms=matchTerms[category].map(s=>'%'+s+'%');const {rows}=await db.query(`SELECT * FROM resources WHERE active AND (lower(title||' '||array_to_string(topics,' ')||' '||summary) LIKE ANY($1::text[])) ORDER BY CASE kind WHEN 'government' THEN 0 WHEN 'organisation' THEN 1 ELSE 2 END,verified_at DESC NULLS LAST LIMIT 6`,[terms]);
 for(const r of rows)await db.query(`INSERT INTO resource_matches(incident_id,resource_id,rationale,source_url,source_label,verified_at) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT(incident_id,resource_id) DO NOTHING`,[incidentId,r.id,`Related to ${matchTerms[category][0]}; confirm local coverage with the source.`,r.source_url,r.source_label,r.verified_at]);
}
export const resourceRoutes=Router();
resourceRoutes.get('/',async(req,res)=>{const q=String(req.query.q||'').trim().slice(0,200);const category=z.enum(['all',...Object.keys(matchTerms) as Category[]]).catch('all').parse(req.query.category);const action=z.enum(['all','government','organisation','guide','contact']).catch('all').parse(req.query.action);const params:unknown[]=[];const conditions=['active'];if(q){params.push('%'+q.replace(/[%_\\]/g,'')+'%');conditions.push(`lower(title||' '||summary||' '||location||' '||array_to_string(topics,' ')) LIKE lower($${params.length})`);}if(category!=='all'){params.push(matchTerms[category as Category].map(s=>'%'+s+'%'));conditions.push(`lower(title||' '||summary||' '||array_to_string(topics,' ')) LIKE ANY($${params.length}::text[])`);}if(action!=='all'){params.push(action);conditions.push(`kind=$${params.length}`);}const rows=(await pool.query(`SELECT * FROM resources WHERE ${conditions.join(' AND ')} ORDER BY verified_at DESC NULLS LAST,title LIMIT 40`,params)).rows;const state=(await pool.query('SELECT source,last_success,last_error,record_count FROM sync_state')).rows;res.json({resources:rows.map(resourceView),sync:state,stale:!state.length||state.some(s=>!s.last_success||Date.now()-new Date(s.last_success).getTime()>86400000)});});
resourceRoutes.post('/refresh',async(req,res)=>{await rate('resources-refresh',1,300);await rate('resources:'+clientIp(req),3,3600);await syncResources();res.json({ok:true});});
