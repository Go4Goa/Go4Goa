import { audit,award,type DB } from './db.ts';
import { pointAwards } from '../shared/points.ts';
// Shared by the moderator routes and the automated review. Callers lock the incident rows (FOR UPDATE) and check versions first.
export const publicStates=['verified','in_progress','resolved'];
type Row=Record<string,any>;
export interface StatusChange {status:string;description:string;locationLabel:string;responsibleBody:string|null}
export async function changeStatus(db:DB,actor:string|null,r:Row,v:StatusChange,reason:string){
 await db.query('UPDATE incidents SET status=$2,description=$3,location_label=$4,responsible_body=$5,version=version+1,updated_at=now() WHERE id=$1',[r.id,v.status,v.description,v.locationLabel,v.responsibleBody]);
 if(publicStates.includes(v.status))await db.query(`UPDATE media SET state=CASE WHEN state='pending' THEN 'approved' ELSE state END WHERE incident_id=$1`,[r.id]);
 await audit(db,actor,'incident.status',r.id,{status:r.status,description:r.description,locationLabel:r.location_label,responsibleBody:r.responsible_body},{status:v.status,description:v.description,locationLabel:v.locationLabel,responsibleBody:v.responsibleBody},reason);
 if(v.status==='verified')await award(db,r.reporter_id,'report_approved',r.id,pointAwards.report_approved);if(v.status==='resolved')await award(db,r.reporter_id,'report_resolved',r.id,pointAwards.report_resolved);
}
export const canMerge=(r:Row|undefined,target:Row|undefined)=>!!r&&!!target&&r.id!==target.id&&!target.duplicate_of&&target.status!=='rejected'&&target.category===r.category;
export async function mergeInto(db:DB,actor:string|null,r:Row,target:Row,reason:string){
 await db.query(`UPDATE incidents SET status='duplicate',duplicate_of=$2,version=version+1,updated_at=now() WHERE id=$1`,[r.id,target.id]);
 await audit(db,actor,'incident.merged',r.id,{status:r.status,duplicateOf:r.duplicate_of},{status:'duplicate',duplicateOf:target.id},reason);
}
