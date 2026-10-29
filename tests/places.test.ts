import test from 'node:test';
import assert from 'node:assert/strict';
import { config } from '../server/config.ts';
import { searchPlaces } from '../server/places.ts';

test('business search returns named Goa venues and discards invalid/out-of-area points', async () => {
 const oldFetch=globalThis.fetch, oldKey=config.placesKey;
 config.placesKey='test-server-key'; let requests=0;
 globalThis.fetch=async (url,options)=>{
  requests++;
  assert.equal(String(url),'https://places.googleapis.com/v1/places:searchText');
  assert.equal(new Headers(options?.headers).get('X-Goog-Api-Key'),'test-server-key');
  const body=JSON.parse(String(options?.body));
  assert.match(body.textQuery,/For Kicks.*Goa/);
  assert.ok(body.locationRestriction.rectangle.low.latitude>=14.8);
  return Response.json({places:[
   {id:'goa-cafe',displayName:{text:'For Kicks'},formattedAddress:'Mandrem, Goa',location:{latitude:15.669535,longitude:73.7222267}},
   {id:'outside-goa',displayName:{text:'Unrelated venue'},location:{latitude:19.1,longitude:72.9}},
   {id:'no-coordinate',displayName:{text:'Incomplete result'}},
  ]});
 };
 try {
  const result=await searchPlaces('For Kicks');
  assert.deepEqual(result.places.map(p=>p.id),['goa-cafe']);
  assert.equal(result.attribution.label,'Google Maps');
  assert.ok(!JSON.stringify(result).includes('test-server-key'));
  await searchPlaces('For Kicks');
  assert.equal(requests,2,'Google results must not enter the persistent response cache');
 } finally {globalThis.fetch=oldFetch;config.placesKey=oldKey;}
});

test('provider failures expose recovery without leaking upstream credentials or configuration', async () => {
 const oldFetch=globalThis.fetch, oldKey=config.placesKey;
 config.placesKey='test-server-key';
 globalThis.fetch=async()=>Response.json({error:{message:'sensitive-provider-diagnostic'}},{status:403});
 try {await assert.rejects(searchPlaces('For Kicks'),error=>error instanceof Error && error.message.includes('Try again') && !error.message.includes('sensitive-provider-diagnostic'));}
 finally {globalThis.fetch=oldFetch;config.placesKey=oldKey;}
});

test('autocomplete uses a shared session, restricts to Goa and ignores query-only suggestions', async () => {
 const oldFetch=globalThis.fetch,oldKey=config.placesKey;config.placesKey='test-server-key';
 globalThis.fetch=async (url,options)=>{
  assert.equal(String(url),'https://places.googleapis.com/v1/places:autocomplete');
  const body=JSON.parse(String(options?.body));
  assert.equal(body.sessionToken,'qa-session');assert.equal(body.input,'For Ki');
  assert.deepEqual(body.includedRegionCodes,['in']);assert.equal(body.locationRestriction.rectangle.high.latitude,15.85);
  return Response.json({suggestions:[{placePrediction:{placeId:'cafe',text:{text:'For Kicks, Mandrem, Goa'},structuredFormat:{mainText:{text:'For Kicks'},secondaryText:{text:'Mandrem, Goa'}}}},{queryPrediction:{text:{text:'Unselected general query'}}}]});
 };
 try{
  const {suggestPlaces}=await import('../server/places.ts');
  const result=await suggestPlaces('For Ki','qa-session');
  assert.deepEqual(result.places,[{id:'cafe',name:'For Kicks',label:'Mandrem, Goa'}]);
  assert.equal(result.attribution.label,'Google Maps');
 }finally{globalThis.fetch=oldFetch;config.placesKey=oldKey;}
});

test('place selection resolves coordinates with the autocomplete session and rejects out-of-Goa results', async () => {
 const oldFetch=globalThis.fetch,oldKey=config.placesKey;config.placesKey='test-server-key';let inGoa=true;
 globalThis.fetch=async (url,options)=>{
  const address=new URL(String(url));assert.equal(address.pathname,'/v1/places/cafe');assert.equal(address.searchParams.get('sessionToken'),'qa-session');
  const mask=new Headers(options?.headers).get('X-Goog-FieldMask')!;assert.ok(mask.includes('location'));assert.ok(!mask.includes('reviews'));
  return Response.json({id:'cafe',displayName:{text:'For Kicks'},formattedAddress:'Mandrem, Goa',location:{latitude:inGoa?15.669535:19.1,longitude:73.7222267}});
 };
 try{
  const {resolvePlace}=await import('../server/places.ts');
  const result=await resolvePlace('cafe','qa-session');assert.equal(result.name,'For Kicks');assert.equal(result.point.lat,15.669535);
  inGoa=false;await assert.rejects(resolvePlace('cafe','qa-session'),/within Goa/);
 }finally{globalThis.fetch=oldFetch;config.placesKey=oldKey;}
});
