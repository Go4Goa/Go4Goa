import type { CivicEvent, Incident } from '../../shared/model';
import { fieldGuideOrigin } from '../resources/guide';

export type FeedCategory = 'meetups' | 'reports' | 'news' | 'resources';
export type FeedFilter = 'all' | FeedCategory;
export interface FeedPhoto { src: string; alt: string; credit: string; source?: string }
export interface Gallery {
  id: string; title: string; description?: string; location: string;
  label: string; date?: string; photos: FeedPhoto[]; href?: string; action?: string;
  featured?: boolean; portrait?: boolean;
}
export interface Reading {
  id: string; title: string; description: string; source: string;
  href: string; date?: string; action: string;
}

export const previewMeetups: CivicEvent[] = [
  {
    id: 'home-sample-caranzalem', kind: 'event', title: 'Sunday, sand\nand a little good.',
    description: 'Start the morning with a gentle shoreline cleanup, then stay for a chat with your neighbours.',
    activity: 'beach_cleanup', locationLabel: 'Caranzalem beach', point: { lat: 15.4692, lng: 73.8091 },
    meetup: 'Meet at the public beach entrance.', startsAt: '2026-11-01T01:30:00.000Z', endsAt: '2026-11-01T03:00:00.000Z',
    capacity: 20, going: 0, organizerId: 'home-preview', username: 'coastal_neighbours', status: 'published',
    linkedIncident: null, materials: 'Water, a hat and reusable gloves.', poster: { color: 'ocean', pattern: 'solid' }, version: 1, example: true,
  },
  {
    id: 'home-sample-campal', kind: 'event', title: 'A slow walk.\nA cleaner Campal.',
    description: 'Pick up a little litter, notice what needs care and get to know the people who share your neighbourhood.',
    activity: 'cleanup_walk', locationLabel: 'Campal promenade', point: { lat: 15.4931, lng: 73.8145 },
    meetup: 'Gather by the public promenade entrance.', startsAt: '2026-11-04T01:30:00.000Z', endsAt: '2026-11-04T03:00:00.000Z',
    capacity: 16, going: 0, organizerId: 'home-preview', username: 'campal_neighbours', status: 'published',
    linkedIncident: null, materials: 'Comfortable shoes and drinking water.', poster: { color: 'sand', pattern: 'solid' }, version: 1, example: true,
  },
  {
    id: 'home-sample-miramar', kind: 'event', title: 'See you\nby the sea.',
    description: 'A Saturday cleanup at Miramar. Bring a friend, meet someone new and leave the beach a little better.',
    activity: 'beach_cleanup', locationLabel: 'Miramar beach', point: { lat: 15.4795, lng: 73.8085 },
    meetup: 'Meet at the public beach access.', startsAt: '2026-11-07T01:30:00.000Z', endsAt: '2026-11-07T03:30:00.000Z',
    capacity: 24, going: 0, organizerId: 'home-preview', username: 'miramar_neighbours', status: 'published',
    linkedIncident: null, materials: 'A refillable bottle, a hat and gloves.', poster: { color: 'forest', pattern: 'solid' }, version: 1, example: true,
  },
];
export type FeedItem =
  | { id: string; category: 'meetups'; kind: 'gallery'; gallery: Gallery }
  | { id: string; category: 'meetups'; kind: 'event'; event: CivicEvent }
  | { id: string; category: 'reports'; kind: 'report'; report: Incident }
  | { id: string; category: 'news' | 'resources'; kind: 'reading'; reading: Reading };

const teriSource = 'https://teriin.org/event/teris-impactful-clean-drives-and-sustainability-event';

export const communityGalleries: Gallery[] = [
  {
    id: 'riva-resort-beach-cleanup', title: 'Riva Resort Beach Cleanup', label: 'Edge City',
    location: 'Mandrem', date: '2026-10-31', featured: true, portrait: true,
    photos: [
      { src: '/home-community/riva-cleanup-volunteers.webp', alt: 'Two volunteers wearing gloves hold a cleanup bag on a wooden bridge beside palm trees.', credit: '' },
      { src: '/home-community/riva-cleanup-shore.webp', alt: 'A volunteer wearing gloves collects litter beside the water near Riva Resort.', credit: '' },
    ],
  },
];

// Local design assets only. Never attach illustrative photos to actual meetup records.
export const previewGalleries: Gallery[] = [
  {
    id: 'sample-cleanup', title: 'A morning for the coast.', location: 'Goa',
    description: 'A little time outside. A few new neighbours. A cleaner stretch of coast. A look at how meetup moments could appear here.',
    label: 'AI-generated sample', href: '/events', action: 'Find a meetup',
    photos: [
      { src: '/home-preview/cleanup-group-generated.webp', alt: 'Illustrative group of eight adult volunteers with cleanup sacks on a Goan beach.', credit: 'AI-generated sample · Fictional meetup' },
      { src: '/home-preview/cleanup-action-generated.webp', alt: 'Illustrative volunteers collecting plastic and fishing rope beside the sea.', credit: 'AI-generated sample · Fictional meetup' },
    ],
  },
  {
    id: 'teri-cleanup', title: 'More hands, cleaner shores.', location: 'Goa’s beaches',
    description: 'Students and community volunteers came together for TERI’s October 2024 beach cleanup drives. A little inspiration for the next one.',
    label: 'Sourced gallery example', date: '2024-10-16', href: teriSource, action: 'Read the community story',
    photos: [
      { src: '/home-preview/teri-cleanup-group.jpg', alt: 'A large group of cleanup volunteers on a Goa beach with collected litter and their organisations’ banners.', credit: 'Photo: TERI · October 2024', source: teriSource },
      { src: '/home-preview/teri-cleanup-action.jpg', alt: 'TERI cleanup volunteers gathered near palm trees with their collected litter bags.', credit: 'Photo: TERI · October 2024', source: teriSource },
    ],
  },
];

// An editorial snapshot for the local design review, researched 30 October 2026.
// Publication dates remain visible when items recur. This is not a live news service.
export const news: Reading[] = [
  {
    id: 'saligao-maintenance', title: 'Saligao waste facility announces a temporary pause for eight local bodies',
    description: 'The Goan reports a 25-day pause from 10 October for maintenance. Regular catchment-area collections were reported to continue.',
    source: 'The Goan', date: '2026-10-14', action: 'Read the story',
    href: 'https://www.thegoan.net/goa-news/saligao-plant-shuts-doors-on-civic-waste-for-25-days/155541.html',
  },
  {
    id: 'coastal-cleanup-2026', title: 'Volunteers come together across 25 Goa beaches',
    description: 'Community groups, local residents and the Indian Coast Guard joined the September coastal cleanup, collecting plastic and other marine litter.',
    source: 'Press Information Bureau', date: '2026-09-19', action: 'Read the story',
    href: 'https://www.pib.gov.in/PressReleasePage.aspx?PRID=2312416&lang=2&reg=48',
  },
  {
    id: 'green-goa-2026', title: 'Green Goa, Clean Goa puts community action at its centre',
    description: 'The state’s World Environment Day announcement brings together tree planting, waste management training and public participation.',
    source: 'Government of Goa', date: '2026-06-05', action: 'Read the announcement',
    href: 'https://www.goa.gov.in/wp-content/uploads/2026/06/GOA-ACCELERATES-CLIMATE-ACTION.pdf',
  },
  {
    id: 'miramar-cleanup-2026', title: 'A shared effort to keep Miramar’s shoreline clean',
    description: 'Local volunteers and organisations joined the September coastal cleanup at Miramar, raising awareness of marine litter and coastal care.',
    source: 'Herald Goa', date: '2026-09-19', action: 'Read the story',
    href: 'https://www.heraldgoa.in/goa/international-coastal-cleanup-drive-held-at-miramar-beach-under-swachh-sagar-surakshit-sagar-2026/489269/',
  },
];

export const resources: Reading[] = [
  { id: 'climate-plan', title: 'Goa’s Climate Action Plan', description: 'Explore the 2023–2033 plan, from coastal resilience and water to the places we live.', source: 'ActForGoa', href: `${fieldGuideOrigin}/climate-plan`, action: 'Explore the plan' },
  { id: 'green-business', title: 'Green businesses, local possibilities.', description: 'Resources for businesses that use less, support local livelihoods and care for Goa.', source: 'ActForGoa', href: `${fieldGuideOrigin}/topics/business`, action: 'Explore green businesses' },
  { id: 'local-resources', title: 'A useful next step, close to home.', description: 'Find practical help with waste, recycling and infrastructure, plus the community directory.', source: 'GO-GOA resources', href: '/resources', action: 'Find local resources' },
  { id: 'nature', title: 'Make room for nature.', description: 'Explore practical guides to Goa’s trees, biodiversity and shared natural spaces.', source: 'ActForGoa', href: `${fieldGuideOrigin}/topics/nature`, action: 'Explore nature guides' },
];

export function createFeedPool(activity: (Incident | CivicEvent)[], preview: boolean, now = Date.now()): FeedItem[] {
  return [
    ...communityGalleries.map(gallery => ({ id: gallery.id, category: 'meetups' as const, kind: 'gallery' as const, gallery })),
    ...(preview ? previewGalleries.map(gallery => ({ id: gallery.id, category: 'meetups' as const, kind: 'gallery' as const, gallery })) : []),
    ...(preview ? previewMeetups.map(event => ({ id: event.id, category: 'meetups' as const, kind: 'event' as const, event })) : []),
    ...activity.flatMap((item): FeedItem[] => item.kind === 'incident'
      ? [{ id: item.id, category: 'reports', kind: 'report', report: item }]
      : item.status === 'published' && Date.parse(item.endsAt) > now
        ? [{ id: item.id, category: 'meetups', kind: 'event', event: item }] : []),
    ...news.map(reading => ({ id: reading.id, category: 'news' as const, kind: 'reading' as const, reading })),
    ...resources.map(reading => ({ id: reading.id, category: 'resources' as const, kind: 'reading' as const, reading })),
  ];
}
