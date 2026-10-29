import { topicFlows, type TopicAction, type TopicFlow } from './topic-flows';
import records from './records.json';

export const fieldGuideOrigin = 'https://actforgoa-field-guide.vercel.app';
// Keep only the two Go4Goa sectors, including direct URL and search resolution.
const waste = topicFlows.find(flow => flow.slug === 'waste')!;
const planning = topicFlows.find(flow => flow.slug === 'planning')!;
const water = topicFlows.find(flow => flow.slug === 'water')!;
export const resourceTopics: TopicFlow[] = [
  { ...waste, label: 'Trash & recycling' },
  { ...planning, slug: 'infrastructure', label: 'Infrastructure', actions: [
    ...planning.actions.filter(action => ['roads', 'construction'].includes(action.id)),
    ...water.actions.filter(action => ['supply', 'pollution'].includes(action.id)),
  ] },
];
export const topicPath = (flow: TopicFlow) => `/resources/topics/${flow.slug}`;
export const actionPath = (flow: TopicFlow, action: TopicAction, parent?: TopicAction) =>
  `${topicPath(flow)}/${parent ? `${parent.id}/` : ''}${action.id}`;

/** A combined GO-GOA menu still cites each answer's original Act For Goa route. */
export function sourceTopicPath(flow: TopicFlow, actionId?: string, choiceId?: string) {
  const parent = flow.actions.find(action => action.id === actionId);
  const source = topicFlows.find(topic => parent && topic.actions.includes(parent))
    ?? topicFlows.find(topic => topic.slug === flow.slug)
    ?? topicFlows.find(topic => topic.actions.some(action => flow.actions.includes(action)));
  return `/topics/${source?.slug ?? flow.slug}${actionId ? `/${actionId}` : ''}${choiceId ? `/${choiceId}` : ''}`;
}

/** Keep the guided journey here; original articles and working forms stay with their owner. */
export function destination(href: string) {
  if (href.startsWith('/topics/')) {
    const url = new URL(href, fieldGuideOrigin);
    const [sourceSlug, actionId, choiceId] = url.pathname.slice('/topics/'.length).split('/');
    const slug = ['planning', 'water'].includes(sourceSlug) ? 'infrastructure' : sourceSlug;
    return resolveGuide(slug, actionId, choiceId).valid
      ? `/resources/topics/${slug}${actionId ? `/${actionId}` : ''}${choiceId ? `/${choiceId}` : ''}${url.search}${url.hash}`
      : url.href;
  }
  if (href === '/emergency') return '/resources/emergency';
  if (href.startsWith('#')) return href;
  return href.startsWith('/') ? new URL(href, fieldGuideOrigin).href : href;
}

export function resolveGuide(slug?: string, actionId?: string, choiceId?: string) {
  const flow = resourceTopics.find(topic => topic.slug === slug);
  const parent = flow?.actions.find(action => action.id === actionId);
  const action = choiceId ? parent?.choices?.find(choice => choice.id === choiceId) : parent;
  return { flow, parent, action, valid: !!flow && (!actionId || !!parent) && (!choiceId || !!action) };
}

export function relatedRecords(action: TopicAction) {
  const linkedIds = (action.links ?? []).flatMap(link => link.href.startsWith('/read/') ? [link.href.slice(6).split('#')[0]] : []);
  const ids = [...new Set([...(action.peopleIds ?? []), ...(action.resourceIds ?? []), ...linkedIds])];
  return ids.flatMap(id => records.find(record => record.id === id) ?? []);
}

export function searchGuide(query: string) {
  const terms = query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  return resourceTopics.flatMap(flow => flow.actions.flatMap(parent =>
    [parent, ...(parent.choices ?? [])].map(action => ({
      flow, action, href: actionPath(flow, action, action === parent ? undefined : parent),
      haystack: `${flow.label} ${parent.label} ${action.label} ${action.query} ${(action.steps ?? []).join(' ')}`.toLocaleLowerCase(),
    }))),
  ).filter(result => terms.every(term => result.haystack.includes(term)));
}
