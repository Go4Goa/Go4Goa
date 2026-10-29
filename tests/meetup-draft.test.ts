import test from 'node:test';
import assert from 'node:assert/strict';
import { draftKey,readMeetupDraft,saveMeetupDraft,type MeetupDraft } from '../src/services/meetup-draft.ts';
const draft:MeetupDraft={title:'Beach meetup',description:'A fictional test meetup',meetup:'Public entrance',activity:'beach_cleanup',poster:{color:'ocean',pattern:'waves'},startDate:'2099-10-30',startTime:'09:00',duration:120,recurring:true,frequency:'weekly',interval:1,occurrences:4,point:{lat:15.48,lng:73.81},location:'Fictional public place',showMap:true,capacity:20,materials:['Water'],extraMaterial:'',showExtra:false};
test('draft recovery retains the full form and separates accounts and linked reports',()=>{
 const map=new Map<string,string>(),storage={getItem:(key:string)=>map.get(key)||null,setItem:(key:string,value:string)=>{map.set(key,value);}};
 const key=draftKey('resident-a',null);saveMeetupDraft(storage,key,draft);
 assert.deepEqual(readMeetupDraft(storage,key),draft);
 assert.equal(readMeetupDraft(storage,draftKey('resident-b',null)),null);
 assert.equal(readMeetupDraft(storage,draftKey('resident-a','report-id')),null);
});
test('expired, malformed and unsupported stored drafts do not enter the form',()=>{
 for(const raw of ['not json',JSON.stringify({savedAt:Date.now()-86400001,draft}),JSON.stringify({savedAt:Date.now(),draft:{...draft,poster:{color:'url(external)',pattern:'waves'}}})])assert.equal(readMeetupDraft({getItem:()=>raw},'key'),null);
 assert.doesNotThrow(()=>saveMeetupDraft({setItem:()=>{throw Error('Storage denied');}},'key',draft));
});
