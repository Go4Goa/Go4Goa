import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('returning phone users do not need a username', async () => {
  const page = await readFile(new URL('../src/pages/SignIn.tsx', import.meta.url), 'utf8');
  const auth = await readFile(new URL('../server/auth.ts', import.meta.url), 'utf8');

  assert.match(page, /challenge&&<Input label="Public username \(new accounts only\)"/);
  assert.match(auth, /username:usernameSchema\.optional\(\)/);
  assert.match(auth, /if\(!id\)\{if\(!v\.username\)fail\(400,'Choose a public username to create your account\.'\);const username=usernameSchema\.parse\(v\.username\);/);
});
