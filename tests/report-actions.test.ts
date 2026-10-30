import test from 'node:test';
import assert from 'node:assert/strict';
import { reportActions } from '../src/resources/report-actions.ts';
import { resolveGuide } from '../src/resources/guide.ts';

const id = '9ad4df53-3c01-46b9-8c56-2395c3d3b611';
test('private reports can start a meetup without exposing or linking their report', () => {
  for (const status of ['new', 'rejected', 'duplicate'] as const) {
    const actions = reportActions({ id, category: 'trash', status });
    const meetup = new URL(actions[0].href, 'https://example.test');
    assert.equal(meetup.pathname, '/events/new');
    assert.equal(meetup.searchParams.get('activity'), 'cleanup_walk');
    assert.equal(meetup.searchParams.has('report'), false);
    assert.ok(actions.every(action => !action.href.includes(id)));
  }
});
test('public reports link to the composer with an appropriate activity', () => {
  for (const category of ['trash', 'pothole', 'streetlight', 'water', 'other'] as const) {
    for (const status of ['verified', 'in_progress', 'resolved'] as const) {
      const action = reportActions({ id, category, status }).find(action => action.href.startsWith('/events/new'))!;
      const target = new URL(action.href, 'https://example.test');
      assert.equal(target.searchParams.get('report'), id);
      assert.equal(target.searchParams.get('activity'), category === 'trash' ? 'cleanup_walk' : 'reporting_drive');
      assert.deepEqual([...target.searchParams.keys()].sort(), ['activity', 'report']);
    }
  }
});
test('electrical reports never direct people to organize at a hazard', () => {
  for (const status of ['new', 'verified', 'in_progress', 'resolved', 'rejected', 'duplicate'] as const) {
    const actions = reportActions({ id, category: 'electrical', status });
    assert.equal(actions[0].href, 'tel:1912');
    assert.ok(actions.every(action => !action.href.startsWith('/events')));
  }
});
test('every category has working local guide destinations and safe external protocols', () => {
  for (const category of ['trash', 'pothole', 'streetlight', 'water', 'electrical', 'other'] as const) {
    for (const action of reportActions({ id, category, status: 'new' })) {
      assert.ok(action.label && action.description);
      assert.match(action.href, /^(\/|https:\/\/|tel:)/);
      if (action.href.startsWith('/resources/topics/')) {
        const [slug, actionId, choiceId] = action.href.slice('/resources/topics/'.length).split('/');
        assert.ok(resolveGuide(slug, actionId, choiceId).valid, action.href);
      }
    }
  }
});
