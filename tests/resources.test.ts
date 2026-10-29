import test from 'node:test';
import assert from 'node:assert/strict';
import { actionPath, destination, relatedRecords, resolveGuide, resourceTopics, searchGuide, sourceTopicPath } from '../src/resources/guide.ts';

test('every field-guide choice reaches a distinct local menu or answer', () => {
  const routes = new Set<string>();
  assert.deepEqual(resourceTopics.map(topic => topic.slug), ['waste', 'infrastructure']);
  for (const flow of resourceTopics) {
    assert.equal(resolveGuide(flow.slug).valid, true);
    for (const parent of flow.actions) {
      for (const action of [parent, ...(parent.choices ?? [])]) {
        const isChild = action !== parent;
        const path = actionPath(flow, action, isChild ? parent : undefined);
        assert.equal(routes.has(path), false, `Duplicate route ${path}`);
        routes.add(path);
        const resolved = resolveGuide(flow.slug, parent.id, isChild ? action.id : undefined);
        assert.equal(resolved.valid, true, path);
        assert.equal(resolved.action, action);
        assert.ok(action.choices?.length || action.steps?.length || action.links?.length, `Empty answer ${path}`);
      }
    }
  }
  assert.equal(resolveGuide('missing').valid, false);
  assert.equal(resolveGuide('waste', 'missing').valid, false);
  assert.equal(resolveGuide('waste', 'collection', 'missing').valid, false);
});

test('cross-topic links stay local and every jump link has content to jump to', () => {
  for (const flow of resourceTopics) for (const parent of flow.actions) for (const action of [parent, ...(parent.choices ?? [])]) {
    for (const link of action.links ?? []) {
      if (link.href.startsWith('/topics/')) {
        const [slug, actionId, choiceId] = link.href.slice('/topics/'.length).split('/');
        assert.ok(resolveGuide(slug, actionId, choiceId).valid);
        assert.ok(destination(link.href).startsWith('/resources/topics/'));
      }
      if (link.href.startsWith('#')) {
        const people = (kind: string) => ['organisation', 'contact'].includes(kind);
        assert.ok(relatedRecords(action).some(record => link.href === '#topic-people' ? people(record.kind) : !people(record.kind)), `${flow.slug}/${action.id}: ${link.href}`);
      }
    }
  }
  assert.equal(destination('/templates/11-farming-support-or-damage?purpose=damage'), 'https://actforgoa-field-guide.vercel.app/templates/11-farming-support-or-damage?purpose=damage');
  assert.equal(destination('https://cmhelpline.dpg.goa.gov.in/'), 'https://cmhelpline.dpg.goa.gov.in/');
});

test('search finds nested answers and preserves their navigation', () => {
  assert.ok(searchGuide('electronics').some(result => result.href === '/resources/topics/waste/collection/electronics'));
  assert.ok(searchGuide('POTHOLES').some(result => result.href === '/resources/topics/infrastructure/roads/damage'));
  assert.deepEqual(searchGuide('mental health'), []);
  assert.equal(resolveGuide('food').valid, false);
  assert.deepEqual(searchGuide(''), []);
  assert.deepEqual(searchGuide('qzx-no-such-resource'), []);
});

test('combined infrastructure answers retain correct original source routes', () => {
  const infrastructure = resourceTopics.find(topic => topic.slug === 'infrastructure')!;
  assert.equal(sourceTopicPath(infrastructure, 'supply', 'leak'), '/topics/water/supply/leak');
  assert.equal(sourceTopicPath(infrastructure, 'roads', 'damage'), '/topics/planning/roads/damage');
  assert.equal(destination('/topics/water/supply/leak'), '/resources/topics/infrastructure/supply/leak');
  assert.equal(destination('/topics/health/disability'), 'https://actforgoa-field-guide.vercel.app/topics/health/disability');
});
