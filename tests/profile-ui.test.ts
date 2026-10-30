import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('the main signed-in profile exposes sign out', async () => {
  const source = await readFile(new URL('../src/pages/Profile.tsx', import.meta.url), 'utf8');
  const mainProfile = source.slice(source.indexOf('return <div className="page profile-page">'), source.indexOf('function AccountSettings'));

  assert.match(mainProfile, /className="profile-session"/);
  assert.match(mainProfile, />Sign out<\/Button>/);
});
