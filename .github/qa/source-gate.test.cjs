const test=require('node:test'),assert=require('node:assert/strict'),gate=require('./source-gate.cjs');
const pr={number:12,user:{login:'layalabs',id:261854875},head:{sha:'a'.repeat(40)},base:{sha:'b'.repeat(40)},draft:false,mergeable:true,merge_commit_sha:'e'.repeat(40)};
function call(receipt,patch={}) {
 const getContent=async()=>{
  if(!receipt)throw new Error('404');
  return {data:{content:Buffer.from(JSON.stringify(receipt)).toString('base64')}};
 };
 return gate({
  context:{repo:{owner:'actforgoa2026',repo:'Go4Goa'},payload:{pull_request:{...pr,...patch}}},
  core:{setOutput(){}},github:{rest:{repos:{getContent},pulls:{get:async()=>({data:{...pr,...patch}})}}}
 });
}
const valid=()=>({head:pr.head.sha,base:pr.base.sha,sourceReviewed:true,reviewedAt:new Date().toISOString()});
test('unreviewed contributor code fails closed',()=>assert.rejects(()=>call(null),/Awaiting cloud source review/));
test('receipt binds both head and base',async()=>{await assert.rejects(()=>call({...valid(),head:'c'.repeat(40)}));await assert.rejects(()=>call({...valid(),base:'d'.repeat(40)}));});
test('drafts and unexpected numeric author identity remain held',async()=>{await assert.rejects(()=>call(valid(),{draft:true}));await assert.rejects(()=>call(valid(),{user:{login:'layalabs',id:1}}));});
test('review expires and missing timestamps fail closed',async()=>{await assert.rejects(()=>call({...valid(),reviewedAt:'2020-01-01'}));await assert.rejects(()=>call({...valid(),reviewedAt:null}));await assert.rejects(()=>call({...valid(),reviewedAt:'invalid'}));});
test('current source receipt permits only test execution',()=>call(valid()));
