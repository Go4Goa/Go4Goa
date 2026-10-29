import { Router } from 'express';
import { z } from 'zod';
import { pool } from './db.ts';
import { config } from './config.ts';
import { rate, clientIp } from './security.ts';
import { reviewPolytechnicSnapshot } from '../shared/actforgoa/polytechnic-directory.ts';
import type { CRMRecord, CRMSnapshot } from '../shared/actforgoa/crm-model.ts';
import { directorySectors } from '../shared/directory.ts';

const fields = 'record_type organization role focus_areas goa_location jurisdiction summary public_phone public_email website_url instagram_url facebook_url linkedin_url x_url youtube_url contact_kind contact_source_urls activity_evidence_url source_urls source_date checked_on verification_status volunteer_status volunteer_url how_to_help referral_route related_record_ids activity_status activity_evidence_date activity_verification_notes'.split(' ');
const recordSchema = z.object({ record_id: z.string().regex(/^goa-[a-z0-9-]+$/i), name: z.string().min(1), collection: z.enum(['community','government']) }).passthrough();
const schema = z.object({ version: z.string(), records: z.array(recordSchema).min(1).max(15000) });
const plain = (s: string) => s.replace(/<[^>]*>/g, '').slice(0,12000);
export function directorySnapshot(input: unknown): CRMSnapshot {
  const raw = schema.parse(input);
  const pick = (r: z.infer<typeof recordSchema>): CRMRecord => {
    const result: CRMRecord = { record_id:r.record_id, name:plain(r.name), collection:r.collection };
    for (const field of fields) result[field] = typeof r[field] === 'string' ? plain(r[field]) : '';
    return result;
  };
  const reviewed = reviewPolytechnicSnapshot({ version:raw.version, records:raw.records.map(pick), opportunities:[] });
  // Public names/roles remain searchable. Private CRM data never crosses this boundary.
  const publicRecord = (r: CRMRecord): CRMRecord => {
    const result = { ...r };
    delete result.notes;
    if (['individual','person','volunteer','wildlife_rescue_contact','public_office_contact'].includes(r.record_type) || r.activity_status === 'deceased_historical_record') {
      result.public_phone = ''; result.public_email = '';
      result.contact_policy = 'Consult the ActForGoa listing for individual or referral contact routes.';
    }
    return result;
  };
  return { ...reviewed, records:reviewed.records.map(publicRecord), opportunities:reviewed.opportunities.map(publicRecord) };
}

let pending: Promise<void> | null = null;
export function refreshDirectory(fetcher: typeof fetch = fetch): Promise<void> {
  if (pending) return pending;
  pending = (async () => {
    const current = (await pool.query('SELECT etag FROM directory_snapshot WHERE id=true')).rows[0];
    try {
      const response = await fetcher(config.afgOrigin+'/data/crm.json', { headers:{accept:'application/json',...(current?.etag ? {'if-none-match':current.etag} : {})}, signal:AbortSignal.timeout(15000), redirect:'error' });
      if (response.status===304 && current) { await pool.query('UPDATE directory_snapshot SET synced_at=now(),last_error=NULL WHERE id=true'); return; }
      if (!response.ok) throw new Error('ActForGoa returned HTTP '+response.status);
      const chunks: Uint8Array[] = []; let size=0;
      const reader=response.body?.getReader(); if (!reader) throw new Error('Empty upstream response');
      while (true) { const {value,done}=await reader.read(); if(done)break; size+=value.length; if(size>20*1024*1024){await reader.cancel();throw new Error('Directory response too large');}chunks.push(value); }
      const snapshot=directorySnapshot(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      await pool.query(`INSERT INTO directory_snapshot(id,snapshot,etag) VALUES(true,$1,$2)
        ON CONFLICT(id) DO UPDATE SET snapshot=excluded.snapshot,etag=excluded.etag,synced_at=now(),last_error=NULL`,[JSON.stringify(snapshot),response.headers.get('etag')]);
    } catch (error) {
      const message=error instanceof z.ZodError?'The upstream directory format changed.':error instanceof Error?error.message:'Directory refresh failed.';
      await pool.query('UPDATE directory_snapshot SET last_error=$1 WHERE id=true',[message]);
      throw new Error(message);
    }
  })().finally(()=>{pending=null;});
  return pending;
}
export const directoryRoutes=Router();
directoryRoutes.get('/',async(_req,res)=>{
  let row=(await pool.query('SELECT * FROM directory_snapshot WHERE id=true')).rows[0];
  if(!row || Date.now()-new Date(row.synced_at).getTime()>3600000){
    try { await refreshDirectory(); } catch { if(!row){res.status(503).json({error:'The directory could not be loaded. Please retry.'});return;} }
    row=(await pool.query('SELECT * FROM directory_snapshot WHERE id=true')).rows[0];
  }
  const snapshot=row.snapshot as CRMSnapshot;
  res.set('Cache-Control','no-store').json({...snapshot,records:snapshot.records.filter(r=>directorySectors(r).length>0),opportunities:snapshot.opportunities.filter(r=>directorySectors(r).length>0),syncedAt:row.synced_at,stale:!!row.last_error||Date.now()-new Date(row.synced_at).getTime()>86400000});
});
directoryRoutes.post('/refresh',async(req,res)=>{
  await rate('directory-refresh',1,300);await rate('directory:'+clientIp(req),3,3600);
  try { await refreshDirectory(); res.json({ok:true}); }
  catch { res.status(502).json({error:'ActForGoa could not be refreshed. The last complete directory is still available.'}); }
});
