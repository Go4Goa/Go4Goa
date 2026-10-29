import test from 'node:test';
import assert from 'node:assert/strict';
import { civicSectors, inCivicScope } from '../shared/civic-scope.ts';
import { searchDirectory, directorySectors } from '../shared/directory.ts';
import { directorySnapshot } from '../server/directory.ts';
import { backupJSON, emptyNote, isDue, mergeBackup, parseBackup, type CRMRecord } from '../shared/actforgoa/crm-model.ts';
import { resourceTopics, resolveGuide, searchGuide } from '../src/resources/guide.ts';

const record=(id:string,name:string,extra:Record<string,string>={}):CRMRecord=>({record_id:'goa-'+id,name,collection:'community',record_type:'organization',organization:'',role:'',summary:'',focus_areas:'',goa_location:'',jurisdiction:'',public_phone:'',public_email:'',activity_status:'',verification_status:'',...extra});
test('trash and infrastructure scope excludes generic environment, wildlife, arts and health',()=>{
  for(const name of ['Waste collection','AYYA Waste Management','Recycling service','Village Panchayat','Public Works Department','Electricity Department','Sewage treatment','Street lighting'])assert.ok(inCivicScope(name),name);
  for(const name of ['Animal rescue','Culture and heritage','Environmental awareness','Wildlife conservation','Health services','School education','Agriculture office','A bridge between children and their families'])assert.equal(inCivicScope(name),false,name);
  assert.deepEqual(civicSectors('Sewage treatment'),['trash','infrastructure']);
});
test('scoped search ranks exact names, supports civic synonyms and enforces every filter',()=>{
  const rows=[record('a','AYYA Waste Management',{record_type:'business',summary:'Waste collection services',goa_location:'Panaji',focus_areas:'waste'}),record('b','Public Works Department',{collection:'government',goa_location:'Margao',focus_areas:'infrastructure'}),record('c','Wildlife rescue'),record('d','Waste community network',{summary:'Partnered with AYYA Waste Management',goa_location:'Panaji'})];
  assert.equal(searchDirectory(rows,new URLSearchParams('q=AYYA Waste Management'),{})[0].record_id,'goa-a');
  assert.equal(searchDirectory(rows,new URLSearchParams('q=Where can I find sanitation companies?'),{})[0].record_id,'goa-a');
  assert.deepEqual(searchDirectory(rows,new URLSearchParams('group=government&location=Margao'),{}).map(r=>r.record_id),['goa-b']);
  assert.equal(searchDirectory(rows,new URLSearchParams('q=Wildlife'),{}).length,0);
  assert.equal(searchDirectory(rows,new URLSearchParams('group=infrastructure&q=waste'),{}).length,0);
  assert.ok(searchDirectory(rows,new URLSearchParams(),{}).every(r=>directorySectors(r).length));
});
test('public snapshot strips arbitrary notes and individual contact values but retains institutional sources',()=>{
  const snapshot=directorySnapshot({version:'v',records:[record('a','Waste office',{public_phone:'+918322222222',source_urls:'https://example.org/source',notes:'private',secret:'secret'}),record('b','Public Works official',{record_type:'public_office_contact',public_phone:'+919999999999',public_email:'person@example.org'})],opportunities:[{record_id:'opportunity-example'}]});
  assert.equal(snapshot.records[0].public_phone,'+918322222222');
  assert.equal(snapshot.records[0].source_urls,'https://example.org/source');
  assert.equal(snapshot.records[0].notes,undefined);assert.equal(snapshot.records[0].secret,undefined);
  assert.equal(snapshot.records[1].public_phone,'');assert.equal(snapshot.records[1].public_email,'');
  assert.throws(()=>directorySnapshot({version:'v',records:[]}));
});
test('CRM backups validate before merging and preserve existing notes',()=>{
  const r=record('a','Waste office');const note={...emptyNote(r),stage:'contacted' as const,notes:'Follow up about collection',followUp:'2026-10-29'};
  const roundtrip=parseBackup(backupJSON({'goa-a':note}));assert.equal(roundtrip['goa-a'].notes,note.notes);assert.equal(isDue(note,'2026-10-29'),true);
  assert.equal(isDue({...note,stage:'do_not_contact'},'2026-10-29'),false);
  assert.equal(mergeBackup(roundtrip,{'goa-a':{...note,notes:'Imported'}},false)['goa-a'].notes,note.notes);
  assert.throws(()=>parseBackup(JSON.stringify({version:1,records:{'goa-a':{...note,followUp:'2026-02-30'}}})));
  assert.throws(()=>parseBackup('{"version":1,"records":{"__proto__":null}}'));
});
test('Resources only exposes trash and infrastructure, including direct URLs and search',()=>{
  assert.deepEqual(resourceTopics.map(t=>t.slug),['waste','infrastructure']);
  for(const slug of ['health','culture','nature','community','farming'])assert.equal(resolveGuide(slug).valid,false);
  assert.equal(resolveGuide('infrastructure','roads','lights').valid,true);
  assert.equal(resolveGuide('infrastructure','supply','leak').valid,true);
  assert.equal(searchGuide('mental health').length,0);
  assert.ok(searchGuide('waste').length>0);
});
