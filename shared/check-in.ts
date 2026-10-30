export const QR_SESSION_MS = 2 * 60 * 60 * 1000;
export function checkInWindow(event: { starts_at: string | Date; ends_at: string | Date }) {
  return { opensAt: new Date(event.starts_at).getTime() - 60 * 60 * 1000,
    closesAt: new Date(event.ends_at).getTime() + 60 * 60 * 1000 };
}
export interface CheckInSession {
  active: boolean; available: boolean; opensAt: string; closesAt: string;
  expiresAt: string | null; url: string | null; checkedIn: number;
}
export interface CheckInPreview {
  title: string; locationLabel: string; startsAt: string; expiresAt: string;
  alreadyCheckedIn: boolean; points: number; canJoin: boolean; organizer: boolean;
}
