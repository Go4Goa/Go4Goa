import { z } from 'zod';

export const recurrenceSchema=z.object({
 frequency:z.enum(['daily','weekly','monthly']),
 interval:z.number().int().min(1).max(12),
 occurrences:z.number().int().min(2).max(12),
}).strict();
export type Recurrence=z.infer<typeof recurrenceSchema>;
const istOffset=330*60000;
export const indiaDay=(instant:string)=>new Date(Date.parse(instant)+istOffset).toISOString().slice(0,10);

/** Repeat at the same India wall-clock time. Monthly dates clamp to the last
 * day of shorter months, always calculated from the original date. */
export function eventOccurrences(startsAt:string,endsAt:string,recurrence?:Recurrence|null){
 const start=Date.parse(startsAt),duration=Date.parse(endsAt)-start;
 if(!Number.isFinite(start)||!Number.isFinite(duration)||duration<=0)throw new Error('Choose a valid start time and duration.');
 if(indiaDay(startsAt)!==indiaDay(endsAt))throw new Error('Choose a duration that ends on the same day.');
 const pattern=recurrence?recurrenceSchema.parse(recurrence):null;
 const local=new Date(start+istOffset);
 return Array.from({length:pattern?.occurrences??1},(_,index)=>{
  const next=new Date(local);
  if(pattern?.frequency==='monthly'){
   const month=local.getUTCMonth()+index*pattern.interval;
   const lastDay=new Date(Date.UTC(local.getUTCFullYear(),month+1,0)).getUTCDate();
   next.setUTCFullYear(local.getUTCFullYear(),month,Math.min(local.getUTCDate(),lastDay));
  }else if(pattern)next.setUTCDate(local.getUTCDate()+index*pattern.interval*(pattern.frequency==='weekly'?7:1));
  const nextStart=next.getTime()-istOffset;
  return {startsAt:new Date(nextStart).toISOString(),endsAt:new Date(nextStart+duration).toISOString()};
 });
}

export function recurrenceLabel(pattern:Recurrence){
 const unit={daily:'day',weekly:'week',monthly:'month'}[pattern.frequency];
 return `Every ${pattern.interval===1?unit:pattern.interval+' '+unit+'s'} · ${pattern.occurrences} meetups`;
}
