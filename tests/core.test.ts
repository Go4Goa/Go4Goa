import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { seal, unseal, publicPoint, distance } from '../server/security.ts';
import { derivative, hashDistance } from '../server/storage.ts';
import { normalizeFeed } from '../server/actforgoa.ts';
import { eventICS } from '../server/calendar.ts';
import { incidentView } from '../server/projections.ts';
import { eventSchema, pointSchema, type CivicEvent } from '../shared/model.ts';

test('private coordinates are authenticated ciphertext, with a stable public privacy cell', () => {
  const point = { lat: 15.482731, lng: 73.819274 };
  const cipher = seal(point);
  assert.deepEqual(unseal(cipher), point);
  assert.notEqual(cipher, seal(point));
  assert.ok(!cipher.includes(String(point.lat)));
  const broken = Buffer.from(cipher, 'base64'); broken[29] ^= 1;
  assert.throws(() => unseal(broken.toString('base64')));
  assert.deepEqual(publicPoint(point, true), { lat: 15.485, lng: 73.815 });
  assert.deepEqual(publicPoint(point, false), point);
  assert.ok(distance(point, publicPoint(point, true)) < 900);
});

test('public report projection excludes private identity and metadata even when present on a row', () => {
  const view = incidentView({ id:'report', category:'trash', public_lat:15.485, public_lng:73.815,
    created_at:new Date(), updated_at:new Date(), phone_cipher:'secret', location_cipher:'secret',
    private_description:'secret', reporter_id:'private-id', username:'river_friend' });
  assert.ok(!JSON.stringify(view).includes('secret'));
  assert.ok(!JSON.stringify(view).includes('private-id'));
  assert.equal(view.username, 'river_friend');
});

test('photo processing strips metadata and bounds both derivatives', async () => {
  const original = await sharp({create:{width:2200,height:1700,channels:3,background:'#345d48'}})
    .withExif({IFD0:{Artist:'Private test photographer'},IFD2:{UserComment:'Private metadata'}}).jpeg().toBuffer();
  assert.ok((await sharp(original).metadata()).exif);
  const result = await derivative(original);
  const full = await sharp(result.bytes).metadata(), thumb = await sharp(result.thumb).metadata();
  assert.equal(full.exif, undefined); assert.equal(full.xmp, undefined);
  assert.equal(full.format, 'webp'); assert.ok(full.width! <= 1600); assert.ok(thumb.width! <= 360);
  assert.equal(hashDistance(result.dhash, result.dhash), 0);
  assert.equal(hashDistance('0000000000000000', 'ffffffffffffffff'), 64);
  await assert.rejects(() => derivative(Buffer.from('not a photo')));
});

test('Act For Goa adapters retain provenance without publishing private contact fields', () => {
  const records = normalizeFeed('directory', {version:'v1',records:[{
    record_id:'waste-office',name:'Waste office',record_type:'organization',collection:'government',
    summary:'Contact test@example.org or +91 98765 43210 for waste guidance.',
    focus_areas:'Waste | Civic',goa_location:'Panaji',source_urls:'javascript:alert(1) | https://example.org/source',
    checked_on:'2026-10-01', verification_status:'Source checked',activity_status:'active',
    activity_verification_notes:'Confirm availability',phone:'must not copy'
  },{record_id:'person',name:'Private volunteer',record_type:'person'}]}, 'revision');
  assert.equal(records.length, 1); assert.equal(records[0].sourceId, 'waste-office');
  assert.equal(records[0].sourceUrl, 'https://example.org/source');
  assert.equal(records[0].verifiedAt, '2026-10-01');
  assert.ok(!JSON.stringify(records).includes('98765'));
  assert.ok(!JSON.stringify(records).includes('test@example.org'));
  assert.ok(!JSON.stringify(records).includes('must not copy'));
  assert.throws(() => normalizeFeed('directory', {records:'invalid'}, 'revision'));
  const guides=normalizeFeed('catalog',[{id:'guide',title:'Waste guide',kind:'resource',retrievedAt:'2026-10-01'}],'rev');
  assert.equal(guides[0].verifiedAt,null);
});

test('calendar output uses UTC, escapes input, folds UTF-8 and represents cancellation', () => {
  const e = {id:'event',version:3,title:'Cleanup, Goa; '+ 'कोंकणी'.repeat(25),description:'Line one\nLine two',
    meetup:'Meet at the gate',locationLabel:'Panaji',point:{lat:15.49,lng:73.82},
    startsAt:'2026-11-01T08:00:00+05:30',endsAt:'2026-11-01T09:00:00+05:30',status:'cancelled'} as CivicEvent;
  const calendar=eventICS(e);
  assert.match(calendar,/DTSTART:20261101T023000Z/);
  assert.match(calendar,/STATUS:CANCELLED/); assert.match(calendar,/SEQUENCE:3/);
  assert.match(calendar,/SUMMARY:Cleanup\\, Goa\\;/);
  for(const line of calendar.split('\r\n')) assert.ok(Buffer.byteLength(line)<=75);
});

test('location and event input reject out-of-area coordinates and invalid time ranges', () => {
  assert.equal(pointSchema.safeParse({lat:0,lng:0}).success,false);
  assert.equal(eventSchema.safeParse({title:'Cleanup',description:'A civic cleanup walk',activity:'cleanup_walk',
    point:{lat:15.49,lng:73.82},locationLabel:'Panaji',meetup:'Meet at gate',capacity:10,
    startsAt:'2026-11-01T10:00:00Z',endsAt:'2026-11-01T09:00:00Z'}).success,false);
});
