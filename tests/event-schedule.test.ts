import test from 'node:test';
import assert from 'node:assert/strict';
import { eventOccurrences, indiaDay, recurrenceSchema } from '../shared/event-schedule.ts';
import { assertSameOrigin } from '../server/security.ts';
import type { Request } from 'express';

test('weekly events keep India wall-clock time across UTC date boundaries',()=>{
 const dates=eventOccurrences('2026-10-31T00:15:00+05:30','2026-10-31T02:15:00+05:30',{frequency:'weekly',interval:2,occurrences:3});
 assert.deepEqual(dates.map(date=>indiaDay(date.startsAt)),['2026-10-31','2026-11-14','2026-11-28']);
 assert.ok(dates.every(date=>date.startsAt.endsWith('18:45:00.000Z')));
 assert.ok(dates.every(date=>Date.parse(date.endsAt)-Date.parse(date.startsAt)===7200000));
});
test('monthly events clamp short months without drifting subsequent dates',()=>{
 const dates=eventOccurrences('2027-01-31T09:00:00+05:30','2027-01-31T11:00:00+05:30',{frequency:'monthly',interval:1,occurrences:4});
 assert.deepEqual(dates.map(date=>indiaDay(date.startsAt)),['2027-01-31','2027-02-28','2027-03-31','2027-04-30']);
});
test('daily recurrence crosses years and respects the count bound',()=>{
 const dates=eventOccurrences('2026-12-31T09:00:00+05:30','2026-12-31T10:00:00+05:30',{frequency:'daily',interval:1,occurrences:2});
 assert.deepEqual(dates.map(date=>indiaDay(date.startsAt)),['2026-12-31','2027-01-01']);
 assert.equal(recurrenceSchema.safeParse({frequency:'daily',interval:1,occurrences:13}).success,false);
 assert.throws(()=>eventOccurrences('2026-12-31T23:00:00+05:30','2027-01-01T01:00:00+05:30'),/same day/);
});
test('the selected dev origin is accepted without accepting arbitrary origins',()=>{
 assert.doesNotThrow(()=>assertSameOrigin({headers:{origin:'http://127.0.0.1:4312'}} as Request));
 for(const origin of ['http://127.0.0.1:9999','https://attacker.example','http://127.0.0.1:4312.attacker.example','null']){
  assert.throws(()=>assertSameOrigin({headers:{origin}} as Request),/address is not allowed/);
 }
});
