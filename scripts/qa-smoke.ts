// Explicitly run against the isolated hosted QA environment. No live residents.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';

const origin=process.env.PUBLIC_ORIGIN!, code=process.env.QA_ACCESS_CODE!;
assert.equal(process.env.GO_GOA_QA,'true');
assert.ok(origin.startsWith('https://')&&code.length>=24);
const access='Basic '+Buffer.from('qa:'+code).toString('base64');
type Actor={cookie:string;csrf:string};
async function call(path:string,method='GET',body?:unknown,actor?:Actor,extra:Record<string,string>={}) {
  return fetch(origin+path,{method,headers:{authorization:access,origin,
    ...(actor?{cookie:actor.cookie,'x-csrf-token':actor.csrf}:{}),
    ...(body&&!(body instanceof FormData)?{'content-type':'application/json'}:{}),...extra},
    body:body instanceof FormData?body:body?JSON.stringify(body):undefined});
}
async function signIn(role:string):Promise<Actor> {
  const r=await call('/api/auth/demo','POST',{role});assert.equal(r.status,200);
  const cookie=r.headers.getSetCookie().map(v=>v.split(';')[0]).join('; ');
  const who=await (await call('/api/auth/me','GET',undefined,{cookie,csrf:''})).json() as any;
  return {cookie,csrf:who.account.csrf};
}
for(const path of ['/','/api/health','/api/explore']) {
  const response=await fetch(origin+path);assert.equal(response.status,200);assert.equal(response.headers.get('www-authenticate'),null);
}
for(const role of ['resident','organizer','moderator'])assert.equal((await fetch(origin+'/api/auth/demo',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify({role})})).status,403);
assert.equal((await (await call('/api/health')).json() as any).mode,'hosted-qa');
const resident=await signIn('resident'),moderator=await signIn('moderator');
const bytes=await sharp({create:{width:400,height:300,channels:3,background:'#b7c9aa'}}).jpeg().toBuffer();
const draft={category:'trash',point:{lat:15.482731,lng:73.819274},privacy:'blurred',
  description:'Synthetic hosted smoke test',locationLabel:'Fictional QA location',alt:'Synthetic test image'};
const form=()=>{const f=new FormData();f.set('report',JSON.stringify(draft));f.set('photo',new Blob([new Uint8Array(bytes)],{type:'image/jpeg'}),'synthetic.jpg');return f;};
const key=randomUUID();
const uploaded=await call('/api/incidents','POST',form(),resident,{'idempotency-key':key});
assert.equal(uploaded.status,201,await uploaded.clone().text());const {id}=await uploaded.json() as {id:string};
const retry=await call('/api/incidents','POST',form(),resident,{'idempotency-key':key});
assert.equal((await retry.json() as {id:string}).id,id);
assert.equal((await call('/api/incidents/'+id)).status,404);
const own=await (await call('/api/incidents/'+id,'GET',undefined,resident)).json() as any;
assert.deepEqual(own.incident.point,{lat:15.485,lng:73.815});
assert.equal((await call(own.incident.photo)).status,404);
assert.equal((await call(own.incident.photo,'GET',undefined,resident)).status,200);
const changes={version:1,status:'verified',reason:'Synthetic hosted QA smoke check',description:'Synthetic QA check, no real issue',
  locationLabel:'Approximate QA location',responsibleBody:null,photoSafe:true};
assert.equal((await call('/api/admin/incidents/'+id,'PATCH',changes,moderator)).status,200);
const published=await (await call('/api/incidents/'+id)).json() as any;
assert.deepEqual(published.incident.point,{lat:15.485,lng:73.815});
assert.equal((await call(own.incident.photo)).status,200);
const profile=await (await call('/api/account','GET',undefined,resident)).json() as any;
assert.equal(profile.points.filter((p:any)=>p.source_id===id&&p.reason==='report_approved').length,1);
// Keep the audit trail and close the synthetic report so the public QA map stays useful.
assert.equal((await call('/api/admin/incidents/'+id,'PATCH',{...changes,version:2,status:'closed'},moderator)).status,200);
const feed=await (await call('/api/explore?mode=events')).json() as any;
const event=feed.items[0];assert.ok(event);
assert.equal((await call('/api/events/'+event.id+'/rsvp','POST',{email:false,sms:false},resident)).status,200);
assert.equal((await call('/api/account/bookmarks/'+event.id,'POST',{},resident)).status,200);
assert.match(await (await call('/api/events/'+event.id+'/calendar.ics')).text(),/BEGIN:VCALENDAR/);
assert.equal((await call('/api/events/'+event.id+'/rsvp','DELETE',undefined,resident)).status,200);
assert.equal((await call('/api/account/bookmarks/'+event.id,'DELETE',undefined,resident)).status,200);
const resources=await (await call('/api/resources?category=trash')).json() as any;
assert.ok(resources.resources.length>0);
assert.ok(resources.sync.every((s:any)=>s.last_success));
console.log('PASS: public browsing, restricted test accounts, hosted sessions, photo storage, private pending report, blurred coordinates, retry, moderation, points, RSVP, bookmarks, calendar and cached resources.');
console.log('Synthetic report closed after verification:',id);
