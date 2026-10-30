import test from 'node:test';
import assert from 'node:assert/strict';
import { automaticGuestEnabled } from '../src/session-mode.ts';

test('hosted QA creates automatic guests only when phone verification is off', () => {
  assert.equal(automaticGuestEnabled({ qa: true, phoneVerification: false }), true);
  assert.equal(automaticGuestEnabled({ qa: true, phoneVerification: true }), false);
  assert.equal(automaticGuestEnabled({ qa: false, phoneVerification: false }), false);
});
