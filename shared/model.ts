import { z } from 'zod';

export const categoryIds = ['trash', 'pothole', 'streetlight', 'water', 'electrical', 'other'] as const;
export type Category = typeof categoryIds[number];
export const categories = [
  { id: 'trash', group: 'trash', label: 'Trash', help: 'Dumped waste or litter' },
  { id: 'pothole', group: 'infrastructure', label: 'Pothole', help: 'Damaged road or pavement' },
  { id: 'streetlight', group: 'infrastructure', label: 'Streetlight', help: 'Broken or unlit streetlight' },
  { id: 'water', group: 'infrastructure', label: 'Water issue', help: 'Leaks or damaged water infrastructure' },
  { id: 'electrical', group: 'infrastructure', label: 'Electrical danger', help: 'Downed wires or exposed electrical equipment' },
  { id: 'other', group: 'infrastructure', label: 'Other infrastructure', help: 'Another civic problem' },
] as const;
export const statusIds = ['new', 'verified', 'in_progress', 'resolved', 'rejected', 'duplicate', 'closed'] as const;
export type Status = typeof statusIds[number];
export const statusLabel: Record<Status, string> = { new: 'Awaiting review', verified: 'Verified', in_progress: 'In progress', resolved: 'Resolved', rejected: 'Rejected', duplicate: 'Duplicate', closed: 'Closed' };
export const activityIds = ['beach_cleanup', 'cleanup_walk', 'reporting_drive', 'restoration'] as const;
export type Activity = typeof activityIds[number];
export const activityLabel: Record<Activity, string> = { beach_cleanup: 'Beach cleanup', cleanup_walk: 'Cleanup walk', reporting_drive: 'Reporting drive', restoration: 'Restoration' };
export const pointSchema = z.object({ lat: z.number().min(14.8).max(15.85), lng: z.number().min(73.6).max(74.4) }).strict();
export type Point = z.infer<typeof pointSchema>;
export const reportSchema = z.object({ category: z.enum(categoryIds), description: z.string().trim().max(1000).default(''), locationLabel: z.string().trim().min(2).max(120), point: pointSchema, privacy: z.enum(['exact', 'blurred']), alt: z.string().trim().max(200).default('Civic issue submitted for review') }).strict();
export type ReportInput = z.infer<typeof reportSchema>;
export const eventSchema = z.object({ title: z.string().trim().min(4).max(100), description: z.string().trim().min(10).max(2500), activity: z.enum(activityIds), point: pointSchema, locationLabel: z.string().trim().min(2).max(120), meetup: z.string().trim().min(5).max(500), startsAt: z.iso.datetime({ offset: true }), endsAt: z.iso.datetime({ offset: true }), capacity: z.number().int().min(1).max(500), linkedIncident: z.uuid().nullable().optional(), materials: z.string().max(500).default('') }).strict().refine(v => Date.parse(v.endsAt) > Date.parse(v.startsAt), { message: 'End time must be after start time.' });
export type EventInput = z.infer<typeof eventSchema>;
export interface Resource { id: string; sourceId: string; kind: 'organisation' | 'government' | 'guide' | 'contact'; title: string; summary: string; topics: string[]; location: string; sourceUrl: string; sourceLabel: string; listingUrl: string; verifiedAt: string | null; syncedAt: string; verification: string; revision: string; rationale?: string; }
export interface Incident { id: string; kind: 'incident'; category: Category; title: string; description: string; locationLabel: string; point: Point; privacy: 'exact'|'blurred'; status: Status; createdAt: string; updatedAt: string; username: string; reporterId?: string; photo: string | null; thumbnail: string | null; alt: string; version: number; example: boolean; distance?: number; responsibleBody: string | null; duplicateOf: string | null; }
export interface CivicEvent { id: string; kind: 'event'; title: string; description: string; activity: Activity; locationLabel: string; point: Point; meetup: string; startsAt: string; endsAt: string; capacity: number; going: number; organizerId: string; username: string; status: 'pending'|'published'|'cancelled'|'completed'; linkedIncident: string|null; materials: string; version: number; example: boolean; distance?: number; rsvp?: 'confirmed'|'cancelled'; checkedIn?: boolean; }
export interface Account { id: string; username: string; role: 'resident'|'organizer'|'moderator'|'admin'; verified: boolean; emailVerified: boolean; smsOptIn: boolean; emailOptIn: boolean; demo: boolean; csrf: string; }
export interface AppConfig { demo: boolean; qa?: boolean; phoneVerification: boolean; email: boolean; sms: boolean; categories: typeof categories; map: { tiles: string; attribution: string }; }
export const categoryLabel = (id: string) => categories.find(c => c.id === id)?.label || id;
export const dateTime = (v: string) => new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }).format(new Date(v));
export const dayLabel = (v: string) => new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(v));
