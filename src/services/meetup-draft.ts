import { z } from 'zod';
import { activityIds, pointSchema } from '../../shared/model';
import { posterSchema } from '../../shared/meetup-poster';

const draftSchema=z.object({
 title:z.string().max(1000),description:z.string().max(10000),meetup:z.string().max(2000),
 activity:z.enum(activityIds),poster:posterSchema,startDate:z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
 startTime:z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),duration:z.number().int().min(30).max(720),
 recurring:z.boolean(),frequency:z.enum(['daily','weekly','monthly']),interval:z.number().int().min(1).max(12),occurrences:z.number().int().min(2).max(12),
 point:pointSchema.nullable(),location:z.string().max(120),showMap:z.boolean(),capacity:z.number().int().min(1).max(500),
 materials:z.array(z.string().max(100)).max(10),extraMaterial:z.string().max(350),showExtra:z.boolean()
});
export type MeetupDraft=z.infer<typeof draftSchema>;
export const draftKey=(accountId:string,linked:string|null)=>`go-goa:meetup-draft:${accountId}:${linked||'new'}`;
export function readMeetupDraft(storage:Pick<Storage,'getItem'>,key:string):MeetupDraft|null{
 try{
  const raw=storage.getItem(key);if(!raw||raw.length>20000)return null;
  const value=JSON.parse(raw);if(!Number.isFinite(value.savedAt)||Date.now()-value.savedAt>86400000||value.savedAt>Date.now()+300000)return null;
  const parsed=draftSchema.safeParse(value.draft);return parsed.success?parsed.data:null;
 }catch{return null;}
}
export function saveMeetupDraft(storage:Pick<Storage,'setItem'>,key:string,draft:MeetupDraft){
 try{storage.setItem(key,JSON.stringify({savedAt:Date.now(),draft}));}catch{/* Private browsing may deny storage; the open form remains usable. */}
}
export function clearMeetupDrafts(){
 try{for(const key of Object.keys(sessionStorage))if(key.startsWith('go-goa:meetup-draft:'))sessionStorage.removeItem(key);}catch{/* Storage unavailable. */}
}
