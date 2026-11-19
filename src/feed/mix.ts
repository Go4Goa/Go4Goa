import type { FeedCategory, FeedItem } from './content';

export interface FeedEntry { key: string; item: FeedItem; repeated: boolean }
const categories: FeedCategory[] = ['meetups', 'reports', 'news', 'resources'];

/** A seeded shuffle bag favors meetups, varies the gaps between other subjects, and rotates
 * all items before repeating one. Rebuilding with a larger count preserves the prefix. */
export function mixFeed(pool: FeedItem[], count: number, seed: number): FeedEntry[] {
  if (!pool.length) return [];
  let state = seed >>> 0;
  const random = () => { state += 0x6D2B79F5; let n = state; n = Math.imul(n ^ n >>> 15, n | 1); n ^= n + Math.imul(n ^ n >>> 7, n | 61); return ((n ^ n >>> 14) >>> 0) / 4294967296; };
  const shuffle = <T,>(items: T[]) => { const result = [...items]; for (let i = result.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [result[i], result[j]] = [result[j]!, result[i]!]; } return result; };
  const groups = new Map(categories.map(category => [category, pool.filter(item => item.category === category)]));
  const available = categories.filter(category => groups.get(category)!.length);
  const queues = new Map<FeedCategory, FeedItem[]>();
  const seen = new Set<string>();
  const previousItem = new Map<FeedCategory, string>();
  const output: FeedEntry[] = [];
  let bag: FeedCategory[] = [];
  while (output.length < count) {
    if (!bag.length) {
      const others = shuffle(available.filter(category => category !== 'meetups'));
      // Community moments lead: 40–50% of a complete mix, with quieter items between.
      bag = available.includes('meetups') && others.length
        ? others.flatMap((category, index) => index === others.length - 1 && others.length > 2 && random() < .5 ? [category] : ['meetups' as const, category])
        : shuffle(available);
      // Lead the first viewport with community photography, then vary each round.
      const lead = output.length ? -1 : bag.indexOf('meetups');
      if (lead > 0) [bag[0], bag[lead]] = [bag[lead]!, bag[0]!];
      if (bag.length > 1 && bag[0] === output.at(-1)?.item.category) [bag[0], bag[1]] = [bag[1]!, bag[0]!];
    }
    const category = bag.shift()!;
    let queue = queues.get(category);
    if (!queue?.length) {
      queue = shuffle(groups.get(category)!);
      if (!output.length) {
        const gallery = queue.findIndex(item => item.id === 'sample-cleanup');
        if (gallery > 0) [queue[0], queue[gallery]] = [queue[gallery]!, queue[0]!];
        const event = queue.findIndex(item => item.kind === 'event' && item.id.startsWith('home-sample-'));
        if (gallery >= 0 && event > 1) [queue[1], queue[event]] = [queue[event]!, queue[1]!];
      }
      if (queue.length > 1 && queue[0]!.id === previousItem.get(category)) [queue[0], queue[1]] = [queue[1]!, queue[0]!];
      queues.set(category, queue);
    }
    const item = queue.shift()!;
    output.push({ key: `${output.length}-${item.id}`, item, repeated: seen.has(item.id) });
    seen.add(item.id);
    previousItem.set(category, item.id);
  }
  return output;
}
