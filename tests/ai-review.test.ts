import test from 'node:test';
import assert from 'node:assert/strict';
import { decide,pickCandidates,requestContent,rubricPrompt,Judgement,type CandidateRow,type Judgement as J } from '../server/ai-review.ts';

const clean:J={matches_category:'yes',confidence:90,public_civic_scene:true,looks_like_screen_or_generated:'no',identifying_details_visible:false,description_has_personal_info:false,duplicate_of_candidate:null,duplicate_confidence:0,reason:'Rubbish is piled beside the road.'};
const out=(j:Partial<J>)=>({model:'fake-model',judgement:{...clean,...j}});

test('decision table: publish only when every safety condition holds',()=>{
  assert.deepEqual(decide(out({}),0),{decision:'publish',confidence:90,reason:clean.reason});
  assert.equal(decide(out({looks_like_screen_or_generated:'unsure'}),0).decision,'publish');
  for(const [j,why] of [
    [{identifying_details_visible:true},/identifying details/],[{description_has_personal_info:true},/personal information/],
    [{looks_like_screen_or_generated:'yes'},/screen or a generated/],[{public_civic_scene:false},/public civic scene/],
    [{matches_category:'unsure'},/unsure the photo matches/],[{confidence:79},/confidence is below 80/],
  ] as [Partial<J>,RegExp][]){const d=decide(out(j),0);assert.equal(d.decision,'hold',JSON.stringify(j));assert.match(d.reason,why);}
});

test('thresholds sit at 80 for publish, reject and merge',()=>{
  assert.equal(decide(out({confidence:80}),0).decision,'publish');
  assert.equal(decide(out({confidence:79}),0).decision,'hold');
  assert.equal(decide(out({matches_category:'no',confidence:80}),0).decision,'reject');
  assert.equal(decide(out({matches_category:'no',confidence:79}),0).decision,'hold');
  assert.deepEqual(decide(out({duplicate_of_candidate:2,duplicate_confidence:80}),2),{decision:'merge',confidence:80,reason:clean.reason,candidate:2});
  assert.equal(decide(out({duplicate_of_candidate:2,duplicate_confidence:79}),2).decision,'publish');
});

test('precedence: unavailable, then merge, then reject, then publish, else hold',()=>{
  const u=decide({unavailable:'rate_limited'},3);assert.equal(u.decision,'hold');assert.equal(u.unavailable,'rate_limited');assert.equal(u.confidence,null);
  // merge wins over the privacy hold: the duplicate stays private either way
  assert.equal(decide(out({duplicate_of_candidate:1,duplicate_confidence:95,identifying_details_visible:true,matches_category:'unsure'}),1).decision,'merge');
  // a confident "does not match" blocks a merge and becomes a rejection
  assert.equal(decide(out({duplicate_of_candidate:1,duplicate_confidence:95,matches_category:'no',confidence:95}),1).decision,'reject');
  // reject wins over hold conditions
  assert.equal(decide(out({matches_category:'no',confidence:95,identifying_details_visible:true}),0).decision,'reject');
  // a candidate index that was never sent is ignored
  assert.equal(decide(out({duplicate_of_candidate:3,duplicate_confidence:99}),2).decision,'publish');
});

test('the judgement schema rejects out-of-range values',()=>{
  assert.ok(Judgement.safeParse(clean).success);
  assert.ok(!Judgement.safeParse({...clean,confidence:101}).success);
  assert.ok(!Judgement.safeParse({...clean,duplicate_of_candidate:5}).success);
  assert.ok(!Judgement.safeParse({...clean,reason:'x'.repeat(241)}).success);
});

test('the model request carries images, category and note but no coordinates, ids or usernames',()=>{
  const photo=Buffer.from('new-photo'),c1=Buffer.from('cand-1'),c2=Buffer.from('cand-2');
  const content=requestContent({photo,category:'trash',description:'Bags dumped near the bus stop',candidates:[c1,c2]});
  const images=content.filter(b=>b.type==='image') as {source:{data:string;media_type:string}}[];
  assert.deepEqual(images.map(i=>i.source.data),[photo,c1,c2].map(b=>b.toString('base64')));
  assert.ok(images.every(i=>i.source.media_type==='image/webp'));
  const text=content.filter(b=>b.type==='text').map(b=>(b as {text:string}).text).join('\n');
  assert.match(text,/Candidate 1:/);assert.match(text,/Candidate 2:/);assert.doesNotMatch(text,/Candidate 3/);
  assert.match(text,/"Trash"/);assert.match(text,/Bags dumped near the bus stop/);
  assert.match(text,/Do not describe people, faces, vehicle plates or house numbers/);assert.match(text,/Do not quote the description/);
  assert.match(text,/confidence: how sure you are of your matches_category answer/);
  assert.doesNotMatch(text,/\b1[45]\.\d{3,}|\b7[34]\.\d{3,}/,'no coordinates');
  assert.doesNotMatch(text,/[0-9a-f]{8}-[0-9a-f]{4}-/i,'no ids');
  assert.doesNotMatch(text,/@\w|username|\blat\b|\blng\b|latitude|longitude/i);
  assert.match(rubricPrompt('pothole','',0),/no description[\s\S]*no candidates/);
});

test('candidate selection keeps only nearby, older, open reports of the same category, nearest first, at most four',()=>{
  const now=Date.parse('2026-10-29T12:00:00Z'),self={id:'self',category:'trash',created_at:new Date(now-60000)},here={lat:15.5,lng:73.8};
  const north=(m:number)=>({lat:here.lat+m/111195,lng:here.lng});
  const row=(id:string,m:number,extra:Partial<CandidateRow>={}):CandidateRow=>({id,category:'trash',status:'verified',duplicate_of:null,created_at:new Date(now-3600000),point:north(m),thumb_key:id+'-thumb.webp',...extra});
  const rows=[row('far',300),row('edge',249),row('pothole',10,{category:'pothole'}),row('closed',10,{status:'closed'}),row('resolved',10,{status:'resolved'}),
    row('self',0),row('newer',10,{created_at:new Date(now)}),row('old',10,{created_at:new Date(now-31*86400000)}),row('dup',10,{duplicate_of:'x'}),
    row('a',50,{status:'new'}),row('b',20,{status:'in_progress'}),row('c',5),row('d',100)];
  assert.deepEqual(pickCandidates(self,here,rows,now).map(c=>c.id),['c','b','a','d']);
  assert.deepEqual(pickCandidates(self,here,rows.filter(r=>!['a','b','c'].includes(r.id)),now).map(c=>c.id),['d','edge']);
});
