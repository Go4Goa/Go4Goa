import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

// Execute the actual trusted, metadata-only inline scripts with GitHub API stubs.
const yaml=readFileSync(new URL('../workflows/ci.yml',import.meta.url),'utf8');
const scripts=[...yaml.matchAll(/^          script: \|\n((?:            .*\n|\n)+)/gm)]
  .map(match=>match[1].split('\n').map(line=>line.slice(12)).join('\n'));
const announce=scripts.find(script=>script.includes("state:'pending'"));
const result=scripts.find(script=>script.includes("state:success?'success':'failure'"));
assert.ok(announce&&result,'Both discovery scripts must exist');
const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
const head='a'.repeat(40),base='b'.repeat(40);

async function callAnnounce(payload={},currentHead=head){
  const statuses=[],outputs={};
  await new AsyncFunction('github','context','core',announce)(
    {rest:{pulls:{get:async()=>({data:{head:{sha:currentHead}}})},repos:{createCommitStatus:async value=>statuses.push(value)}}},
    {repo:{owner:'actforgoa2026',repo:'Go4Goa'},payload,sha:base,serverUrl:'https://github.com',runId:123},
    {setOutput:(key,value)=>outputs[key]=value});
  return {statuses,outputs};
}

test('PR-target discovery identifies the exact head and GitHub run without candidate code',async()=>{
  const {statuses,outputs}=await callAnnounce({pull_request:{number:18,head:{sha:head}}});
  assert.equal(outputs.head,head);
  assert.deepEqual(statuses,[{owner:'actforgoa2026',repo:'Go4Goa',sha:head,state:'pending',context:'cloud/qa',description:'Trusted source gate, tests, build and rendered evidence pending',target_url:'https://github.com/actforgoa2026/Go4Goa/actions/runs/123'}]);
});
test('outdated PR events and malformed manual inputs cannot announce a current run',async()=>{
  await assert.rejects(()=>callAnnounce({pull_request:{number:18,head:{sha:base}}}),/Outdated run/);
  await assert.rejects(()=>callAnnounce({inputs:{pr_number:'18;bad'}}),/Invalid PR number/);
});
test('main pushes and manual PR commissioning remain discoverable',async()=>{
  assert.equal((await callAnnounce()).statuses[0].sha,base);
  assert.equal((await callAnnounce({inputs:{pr_number:'18'}})).statuses[0].sha,head);
});
test('skipped, cancelled and failed gates never produce a success status',async()=>{
  const keys=['HEAD_SHA','SOURCE_RESULT','VERIFY_RESULT','VISUAL_RESULT'];
  const previous=Object.fromEntries(keys.map(key=>[key,process.env[key]]));
  try{
    for(const results of [['success','success','success'],['failure','skipped','skipped'],['success','success','failure'],['success','cancelled','success'],['success','success','skipped']]){
      Object.assign(process.env,{HEAD_SHA:head,SOURCE_RESULT:results[0],VERIFY_RESULT:results[1],VISUAL_RESULT:results[2]});
      const statuses=[];
      await new AsyncFunction('github','context',result)(
        {rest:{repos:{createCommitStatus:async value=>statuses.push(value)}}},
        {repo:{owner:'actforgoa2026',repo:'Go4Goa'},serverUrl:'https://github.com',runId:123});
      assert.equal(statuses[0].sha,head);
      assert.equal(statuses[0].state,results.every(value=>value==='success')?'success':'failure');
    }
  }finally{for(const [key,value] of Object.entries(previous)){if(value===undefined)delete process.env[key];else process.env[key]=value;}}
});
