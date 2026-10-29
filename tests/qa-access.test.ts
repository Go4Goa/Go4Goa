import test from 'node:test';
import assert from 'node:assert/strict';
import { qaAuthorized } from '../shared/qa-access.ts';

test('hosted QA access fails closed and requires the exact shared credential', async () => {
  const code='test-only-credential-at-least-24-characters';
  const basic=(value:string)=>'Basic '+btoa(value);
  assert.equal(await qaAuthorized(null,code),false);
  assert.equal(await qaAuthorized(basic('qa:'+code),undefined),false);
  assert.equal(await qaAuthorized(basic('qa:short'),'short'),false);
  assert.equal(await qaAuthorized('Basic !!!',code),false);
  assert.equal(await qaAuthorized(basic('admin:'+code),code),false);
  assert.equal(await qaAuthorized(basic('qa:incorrect'),code),false);
  assert.equal(await qaAuthorized(basic('qa:'+code),code),true);
});
