import { Router } from 'express';
import sharp from 'sharp';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { pool,tx,audit } from './db.ts';
import { fail,rate,hash,seal,unseal,publicPoint,distance } from './security.ts';
import { requireAccount,requireModerator } from './auth.ts';
import { reportSchema,statusIds,type Point } from '../shared/model.ts';
import { derivative,putAsset,getAsset,deleteAsset,hashDistance } from './storage.ts';
import { incidentSelect,incidentView,resourceView,eventSelect,eventView } from './projections.ts';
import { matchResources } from './actforgoa.ts';
import { publicStates,changeStatus,canMerge,mergeInto } from './incident-actions.ts';
import { scheduleReview,runPendingReviews,aiReviewEnabled,RUBRIC_VERSION } from './ai-review.ts';
export const incidents=Router(), moderation=Router(),mediaRoutes=Router();
let uploads=0;
incidents.post('/',requireAccount,async(req,res)=>{
 await rate('report:'+req.account!.id,8,3600);if(uploads>=2)fail(503,'Uploads are busy. Keep this page open and retry shortly.');
 const key=z.uuid().parse(req.headers['idempotency-key']);if(!Buffer.isBuffer(req.body))fail(415,'Choose a photo and submit the form.');uploads++;
 let assets:string[]=[];
 try {
  const form=await new Request('http://localhost',{method:'POST',headers:{'content-type':req.headers['content-type']||''},body:new Uint8Array(req.body)}).formData();
  const draft=reportSchema.parse(JSON.parse(String(form.get('report'))));const file=form.get('photo');if(!(file instanceof File))fail(400,'Add one photo of the issue.');
  const enabled=await pool.query('SELECT 1 FROM taxonomy WHERE id=$1 AND enabled',[draft.category]);if(!enabled.rowCount)fail(400,'This category is not available.');
  const photo=await derivative(Buffer.from(await (file as File).arrayBuffer()));const fingerprint=hash(JSON.stringify(draft)+photo.hash);
  const old=(await pool.query('SELECT * FROM idempotency_keys WHERE user_id=$1 AND key=$2',[req.account!.id,key])).rows[0];if(old){if(old.fingerprint!==fingerprint)fail(409,'This retry has changed. Start a new submission.');res.json({id:old.incident_id,accepted:true});return;}
  const id=randomUUID(),mediaId=randomUUID(),blur=draft.privacy==='blurred'||draft.category==='electrical',point=publicPoint(draft.point,blur);assets=[mediaId+'.webp',mediaId+'-thumb.webp'];await putAsset(assets[0],photo.bytes);await putAsset(assets[1],photo.thumb);
  await tx(async db=>{
   await db.query('INSERT INTO incidents(id,reporter_id,category,description,location_label,public_lat,public_lng,privacy) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',[id,req.account!.id,draft.category,blur?'':draft.description,blur?'Approximate location, Goa':draft.locationLabel,point.lat,point.lng,blur?'blurred':'exact']);
   await db.query('INSERT INTO incident_private VALUES ($1,$2,$3,$4)',[id,seal(draft.point),draft.description,draft.locationLabel]);
   await db.query('INSERT INTO media(id,incident_id,asset_key,thumb_key,sha256,dhash,alt,width,height) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',[mediaId,id,assets[0],assets[1],photo.hash,photo.dhash,blur?'Civic issue. Location is approximate.':draft.alt,photo.width,photo.height]);
   await db.query('INSERT INTO idempotency_keys VALUES ($1,$2,$3,$4)',[req.account!.id,key,fingerprint,id]);await audit(db,req.account!.id,'incident.submitted',id,null,{status:'new',privacy:blur?'blurred':'exact'});await matchResources(db,id,draft.category);
  });assets=[];res.status(201).json({id,accepted:true});scheduleReview(id);
 }catch(e){for(const asset of assets)await deleteAsset(asset).catch(()=>{});if((e as {code?:string}).code==='23505'){const prior=(await pool.query('SELECT * FROM idempotency_keys WHERE user_id=$1 AND key=$2',[req.account!.id,key])).rows[0];if(prior)fail(409,'This report was already received. Open your profile to view it.');}throw e;}finally{uploads--;}
});
incidents.get('/:id',async(req,res)=>{
 const id=z.uuid().parse(req.params.id);const r=(await pool.query(incidentSelect+' WHERE i.id=$1',[id])).rows[0];if(!r||(!publicStates.includes(r.status)&&r.reporter_id!==req.account?.id&&!['moderator','admin'].includes(req.account?.role||'')))fail(404,'Report not found.');
 const resources=(await pool.query('SELECT r.*,m.rationale FROM resources r JOIN resource_matches m ON m.resource_id=r.id WHERE m.incident_id=$1 AND r.active ORDER BY m.manual DESC LIMIT 8',[id])).rows.map(resourceView);
 const own=r.reporter_id===req.account?.id;const nearby=(await pool.query(eventSelect+` WHERE e.status='published' AND e.ends_at>now() AND goa_distance_m(e.public_lat,e.public_lng,$1,$2)<15000 ORDER BY e.starts_at LIMIT 3`,[r.public_lat,r.public_lng])).rows.map(eventView);
 const history=(await pool.query(`SELECT action,actor_id,after_state,reason,created_at FROM audit_log WHERE target_id=$1 AND action IN ('incident.status','incident.merged') ORDER BY id`,[id])).rows.map(h=>({action:h.action,status:h.after_state?.status,at:h.created_at,
  // Only automated decisions carry a reporter-facing reason; moderator reasons stay internal notes.
  reason:own&&h.actor_id===null&&h.reason?h.reason:undefined}));res.json({incident:incidentView(r),resources,events:nearby,history,own});
});
mediaRoutes.get('/:id',async(req,res)=>{
 const id=z.uuid().parse(req.params.id);const r=(await pool.query('SELECT m.*,i.status,i.reporter_id FROM media m JOIN incidents i ON i.id=m.incident_id WHERE m.id=$1',[id])).rows[0];
 const privileged=r&&(r.reporter_id===req.account?.id||['moderator','admin'].includes(req.account?.role||''));if(!r||r.state==='withheld'||(!privileged&&(!publicStates.includes(r.status)||!['approved','redacted'].includes(r.state))))fail(404,'Photo not available.');
 res.set({'Cache-Control':'private, no-store','Content-Type':'image/webp','Content-Disposition':'inline; filename="civic-photo.webp"'});res.send(await getAsset(req.query.size==='thumb'?r.thumb_key:r.asset_key));
});
moderation.use(requireModerator);
moderation.get('/incidents',async(req,res)=>{const filter=z.enum(statusIds).catch('new').parse(req.query.status);const rows=(await pool.query(incidentSelect+' WHERE i.status=$1 ORDER BY i.created_at LIMIT 50',[filter])).rows;const ai=new Map((await pool.query('SELECT incident_id,decision,reason,unavailable FROM ai_reviews WHERE incident_id=ANY($1::uuid[]) AND rubric_version=$2',[rows.map(r=>r.id),RUBRIC_VERSION])).rows.map(a=>[a.incident_id,{decision:a.decision,reason:a.reason,unavailable:a.unavailable}]));res.json({incidents:rows.map(r=>({...incidentView(r),aiReview:ai.get(r.id)||null}))});});
moderation.get('/incidents/:id',async(req,res)=>{
 const id=z.uuid().parse(req.params.id);const r=(await pool.query(incidentSelect+' WHERE i.id=$1',[id])).rows[0];if(!r)fail(404,'Report not found.');const priv=(await pool.query('SELECT * FROM incident_private WHERE incident_id=$1',[id])).rows[0];
 const possible=(await pool.query(incidentSelect+` JOIN incident_private ip ON ip.incident_id=i.id WHERE i.id<>$1 AND i.category=$2 AND i.created_at>now()-interval '30 days' AND i.status NOT IN ('rejected','duplicate','closed') AND goa_distance_m(i.public_lat,i.public_lng,$3,$4)<2500 LIMIT 30`,[id,r.category,r.public_lat,r.public_lng])).rows;
 const point=unseal<Point>(priv.location_cipher);const currentMedia=(await pool.query('SELECT dhash FROM media WHERE incident_id=$1',[id])).rows[0];const duplicates=[];
 for(const p of possible){const hidden=(await pool.query('SELECT location_cipher FROM incident_private WHERE incident_id=$1',[p.id])).rows[0];const meters=distance(point,unseal<Point>(hidden.location_cipher));const m=(await pool.query('SELECT dhash FROM media WHERE incident_id=$1',[p.id])).rows[0];const similar=!!m&&!!currentMedia&&hashDistance(m.dhash,currentMedia.dhash)<=10;if(meters<100||similar)duplicates.push({...incidentView(p),distance:Math.round(meters),imageSimilar:similar});}
 await audit(pool,req.account!.id,'incident.private_viewed',id,null,{purpose:'moderation'});
 const aiReview=(await pool.query('SELECT model,rubric_version,decision,confidence,reason,unavailable,created_at FROM ai_reviews WHERE incident_id=$1 ORDER BY id DESC LIMIT 1',[id])).rows[0]||null;
 res.json({incident:incidentView(r),aiReview,privatePoint:point,privateDescription:priv.private_description,privateLocation:priv.private_location_label,duplicates,audit:(await pool.query('SELECT action,reason,created_at,before_state,after_state FROM audit_log WHERE target_id=$1 ORDER BY id DESC LIMIT 50',[id])).rows});
});
moderation.patch('/incidents/:id',async(req,res)=>{
 const id=z.uuid().parse(req.params.id),v=z.object({status:z.enum(statusIds),version:z.number().int(),reason:z.string().trim().min(5).max(500),description:z.string().max(1000),locationLabel:z.string().min(2).max(120),responsibleBody:z.string().max(150).nullable(),photoSafe:z.boolean()}).strict().parse(req.body);
 await tx(async db=>{const r=(await db.query('SELECT * FROM incidents WHERE id=$1 FOR UPDATE',[id])).rows[0];if(!r)fail(404,'Report not found.');if(r.version!==v.version)fail(409,'This report changed. Reload before saving.');if(v.status==='duplicate')fail(400,'Use the merge action for duplicate reports.');if(publicStates.includes(v.status)&&!v.photoSafe)fail(400,'Review the photo and confirm it is safe before publishing.');
  await changeStatus(db,req.account!.id,r,v,v.reason);
 });res.json({ok:true});
});
moderation.post('/incidents/:id/merge',async(req,res)=>{
 const id=z.uuid().parse(req.params.id),v=z.object({into:z.uuid(),version:z.number().int(),reason:z.string().min(5).max(500)}).parse(req.body);if(id===v.into)fail(400,'Choose another report.');
 await tx(async db=>{const rows=(await db.query('SELECT * FROM incidents WHERE id=ANY($1::uuid[]) ORDER BY id FOR UPDATE',[[id,v.into]])).rows;const r=rows.find(r=>r.id===id),target=rows.find(r=>r.id===v.into);if(!canMerge(r,target))fail(400,'Choose an active report of the same category.');if(r!.version!==v.version)fail(409,'This report changed. Reload first.');await mergeInto(db,req.account!.id,r!,target!,v.reason);});res.json({ok:true});
});
moderation.post('/incidents/:id/privacy',async(req,res)=>{
 const id=z.uuid().parse(req.params.id),v=z.object({version:z.number().int(),reason:z.string().min(10).max(500),precision:z.enum(['blurred','exact'])}).parse(req.body);
 await tx(async db=>{const r=(await db.query('SELECT * FROM incidents WHERE id=$1 FOR UPDATE',[id])).rows[0];if(!r||r.version!==v.version)fail(409,'Reload this report first.');if(v.precision==='exact'&&(req.account!.role!=='admin'||r.privacy==='blurred'))fail(403,'A blurred reporter location cannot be made exact in this release.');const priv=(await db.query('SELECT location_cipher FROM incident_private WHERE incident_id=$1',[id])).rows[0];const p=publicPoint(unseal<Point>(priv.location_cipher),v.precision==='blurred');await db.query('UPDATE incidents SET public_lat=$2,public_lng=$3,privacy=$4,location_label=$5,description=$6,version=version+1,updated_at=now() WHERE id=$1',[id,p.lat,p.lng,v.precision,v.precision==='blurred'?'Approximate location, Goa':r.location_label,v.precision==='blurred'?'':r.description]);await audit(db,req.account!.id,'incident.precision',id,{privacy:r.privacy},{privacy:v.precision},v.reason);});res.json({ok:true});
});
moderation.post('/incidents/:id/photo/withhold',async(req,res)=>{const id=z.uuid().parse(req.params.id);const reason=z.string().min(5).max(500).parse(req.body.reason);await tx(async db=>{await db.query(`UPDATE media SET state='withheld' WHERE incident_id=$1`,[id]);await db.query(`UPDATE incidents SET status='new',version=version+1,updated_at=now() WHERE id=$1`,[id]);await audit(db,req.account!.id,'photo.withheld',id,null,{state:'withheld',status:'new'},reason);});res.json({ok:true});});
moderation.post('/incidents/:id/photo/redact',async(req,res)=>{
 const id=z.uuid().parse(req.params.id),v=z.object({version:z.number().int(),reason:z.string().min(5).max(500),box:z.object({x:z.number().min(0).max(1),y:z.number().min(0).max(1),width:z.number().min(.005).max(1),height:z.number().min(.005).max(1)})}).parse(req.body);
 await rate('redaction:'+req.account!.id,30,3600);const m=(await pool.query('SELECT * FROM media WHERE incident_id=$1 LIMIT 1',[id])).rows[0];if(!m)fail(404,'Photo not found.');const old=await getAsset(m.asset_key),meta=await sharp(old).metadata();const w=meta.width!,h=meta.height!,left=Math.min(w-1,Math.floor(v.box.x*w)),top=Math.min(h-1,Math.floor(v.box.y*h)),width=Math.min(w-left,Math.max(1,Math.ceil(v.box.width*w))),height=Math.min(h-top,Math.max(1,Math.ceil(v.box.height*h)));
 // Opaque redaction prevents recognition even for tiny regions where blur is insufficient.
 const mask=await sharp({create:{width,height,channels:3,background:'#193e32'}}).png().toBuffer();const redacted=await derivative(await sharp(old).composite([{input:mask,left,top}]).webp().toBuffer());const key=randomUUID();const assets=[key+'.webp',key+'-thumb.webp'];await putAsset(assets[0],redacted.bytes);await putAsset(assets[1],redacted.thumb);
 try{await tx(async db=>{const r=(await db.query('SELECT version FROM incidents WHERE id=$1 FOR UPDATE',[id])).rows[0];if(!r||r.version!==v.version)fail(409,'This report changed. Reload before redacting.');await db.query(`UPDATE media SET asset_key=$2,thumb_key=$3,state='redacted' WHERE id=$1`,[m.id,assets[0],assets[1]]);await db.query(`UPDATE incidents SET version=version+1,status='new',updated_at=now() WHERE id=$1`,[id]);await audit(db,req.account!.id,'photo.redacted',id,{state:m.state},{state:'redacted',box:v.box},v.reason);});}catch(e){for(const key of assets)await deleteAsset(key);throw e;}await deleteAsset(m.asset_key);await deleteAsset(m.thumb_key);res.json({ok:true});
});
// Manual retry for reports the automatic trigger missed (for example a timed-out serverless run).
moderation.post('/ai-review/run',async(req,res)=>{if(!aiReviewEnabled())fail(503,'Automated review is not enabled.');const limit=z.coerce.number().int().min(1).max(5).catch(2).parse(req.body?.limit);res.json({results:await runPendingReviews(limit,0)});});
moderation.post('/incidents/:id/resources',async(req,res)=>{const id=z.uuid().parse(req.params.id),v=z.object({resourceId:z.string().max(200),rationale:z.string().min(5).max(500)}).parse(req.body);await tx(async db=>{const r=(await db.query('SELECT * FROM resources WHERE id=$1 AND active',[v.resourceId])).rows[0];if(!r)fail(404,'Resource not found.');await db.query(`INSERT INTO resource_matches(incident_id,resource_id,rationale,source_url,source_label,verified_at,manual) VALUES ($1,$2,$3,$4,$5,$6,true) ON CONFLICT(incident_id,resource_id) DO UPDATE SET rationale=excluded.rationale,manual=true`,[id,v.resourceId,v.rationale,r.source_url,r.source_label,r.verified_at]);await audit(db,req.account!.id,'resource.match',id,null,v,v.rationale);});res.json({ok:true});});
