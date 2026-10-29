import test from 'node:test';import assert from 'node:assert/strict';import {introducedAccessibility as introduced} from './accessibility.mjs';
const issue=(nodes,impact='serious')=>[{id:'button-name',impact,nodes:nodes.map(n=>[n])}];
test('fixing one baseline node does not invent a regression',()=>assert.deepEqual(introduced(issue(['#a','#b']),issue(['#b'])),[]));
test('new node or repeated occurrence remains a regression',()=>{assert.equal(introduced(issue(['#a']),issue(['#a','#b'])).length,1);assert.equal(introduced(issue(['#a']),issue(['#a','#a']))[0].added,1);});
test('random fixture IDs normalize without hiding added nodes',()=>{const a='a[href="/events/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"]',b='a[href="/events/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"]';assert.deepEqual(introduced(issue([a]),issue([b])),[]);assert.equal(introduced(issue([a]),issue([b,b]))[0].added,1);});
test('increased severity fails',()=>assert.equal(introduced(issue(['#a'],'moderate'),issue(['#a'])).length,1));
