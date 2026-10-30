import { Router } from 'express';
import { randomBytes } from 'node:crypto';
import { z } from 'zod';
import { pool, tx, audit, award, type DB } from './db.ts';
import { requireAccount } from './auth.ts';
import { config } from './config.ts';
import { equal, fail, hash, rate, seal, unseal } from './security.ts';
import { checkInWindow, QR_SESSION_MS } from '../shared/check-in.ts';
import { pointAwards } from '../shared/points.ts';

export const canManage = (role: string, id: string, owner: string) => id === owner || ['moderator', 'admin'].includes(role);
export const checkIn = Router();
checkIn.use(requireAccount);
const tokenBody = z.object({ token: z.string().regex(/^[A-Za-z0-9_-]{43}$/, 'This check-in link is incomplete. Scan the host’s QR code again.') }).strict();

async function managedEvent(db: DB, id: string, actor: { id: string; role: string }, lock = false) {
  const e = (await db.query('SELECT * FROM events WHERE id=$1' + (lock ? ' FOR UPDATE' : ''), [id])).rows[0];
  if (!e || !canManage(actor.role, actor.id, e.organizer_id)) fail(403, 'Only the meetup host or a moderator can manage check-in.');
  return e;
}
function assertOpen(e: any) {
  const { opensAt, closesAt } = checkInWindow(e);
  if (e.status !== 'published') fail(409, 'Check-in is unavailable for this meetup.');
  if (Date.now() < opensAt || Date.now() > closesAt) fail(409, 'QR check-in opens one hour before the meetup and closes one hour after it ends.');
}
async function validSession(db: DB, id: string, token: string) {
  const session = (await db.query('SELECT * FROM event_checkin_sessions WHERE event_id=$1', [id])).rows[0];
  if (!session || new Date(session.expires_at).getTime() <= Date.now() || !equal(session.token_hash, hash(token))) {
    fail(410, 'This check-in code has expired or closed. Ask the host to show the current QR code.');
  }
  return session;
}

// The event row is always locked first, serializing capacity, closing, rotation and attendance.
export async function confirmAttendance(db: DB, eventId: string, userId: string, confirmedBy: string) {
  const updated = await db.query(`UPDATE rsvps SET checked_in_at=now(),checked_in_by=$3,updated_at=now()
    WHERE event_id=$1 AND user_id=$2 AND status='confirmed' AND checked_in_at IS NULL RETURNING user_id`, [eventId, userId, confirmedBy]);
  if (!updated.rowCount) return false;
  const awarded = await award(db, userId, 'event_attendance', eventId, pointAwards.event_attendance);
  await audit(db, confirmedBy, 'rsvp.checked_in', eventId, null, { userId });
  return awarded;
}

checkIn.get('/:id/check-in/session', async (req, res) => {
  const id = z.uuid().parse(req.params.id), e = await managedEvent(pool, id, req.account!);
  const { opensAt, closesAt } = checkInWindow(e), now = Date.now();
  const session = (await pool.query('SELECT * FROM event_checkin_sessions WHERE event_id=$1', [id])).rows[0];
  const available = e.status === 'published' && now >= opensAt && now <= closesAt;
  const active = !!(available && session && new Date(session.expires_at).getTime() > now);
  const checkedIn = Number((await pool.query('SELECT count(*) AS n FROM rsvps WHERE event_id=$1 AND checked_in_at IS NOT NULL', [id])).rows[0].n);
  res.json({ active, available, opensAt: new Date(opensAt).toISOString(), closesAt: new Date(closesAt).toISOString(), checkedIn,
    expiresAt: active ? session.expires_at : null,
    url: active ? `${config.origin}/events/${id}/check-in#token=${unseal<string>(session.token_cipher)}` : null });
});
checkIn.post('/:id/check-in/session', async (req, res) => {
  const id = z.uuid().parse(req.params.id);
  await rate('checkin-session:' + req.account!.id, 30, 3600);
  await tx(async db => {
    const e = await managedEvent(db, id, req.account!, true); assertOpen(e);
    const token = randomBytes(32).toString('base64url');
    const expiresAt = new Date(Math.min(Date.now() + QR_SESSION_MS, checkInWindow(e).closesAt));
    await db.query(`INSERT INTO event_checkin_sessions(event_id,token_hash,token_cipher,opened_by,expires_at)
      VALUES ($1,$2,$3,$4,$5) ON CONFLICT(event_id) DO UPDATE SET token_hash=excluded.token_hash,
      token_cipher=excluded.token_cipher,opened_by=excluded.opened_by,expires_at=excluded.expires_at,created_at=now()`,
    [id, hash(token), seal(token), req.account!.id, expiresAt]);
    await audit(db, req.account!.id, 'event.checkin_opened', id, null, { expiresAt });
  });
  res.json({ ok: true });
});
checkIn.delete('/:id/check-in/session', async (req, res) => {
  const id = z.uuid().parse(req.params.id);
  await rate('checkin-session:' + req.account!.id, 30, 3600);
  await tx(async db => {
    await managedEvent(db, id, req.account!, true);
    await db.query('DELETE FROM event_checkin_sessions WHERE event_id=$1', [id]);
    await audit(db, req.account!.id, 'event.checkin_closed', id, null, {});
  }); res.json({ ok: true });
});
checkIn.post('/:id/check-in/preview', async (req, res) => {
  const id = z.uuid().parse(req.params.id), { token } = tokenBody.parse(req.body);
  await rate('checkin-scan:' + req.account!.id, 60, 3600);
  const result = await tx(async db => {
    const e = (await db.query('SELECT * FROM events WHERE id=$1 FOR UPDATE', [id])).rows[0];
    if (!e) fail(404, 'Meetup not found.'); assertOpen(e);
    const session = await validSession(db, id, token);
    const mine = (await db.query('SELECT status,checked_in_at FROM rsvps WHERE event_id=$1 AND user_id=$2', [id, req.account!.id])).rows[0];
    const count = Number((await db.query("SELECT count(*) AS n FROM rsvps WHERE event_id=$1 AND status='confirmed'", [id])).rows[0].n);
    return { title: e.title, locationLabel: e.location_label, startsAt: e.starts_at, expiresAt: session.expires_at,
      alreadyCheckedIn: !!mine?.checked_in_at, points: pointAwards.event_attendance,
      canJoin: mine?.status === 'confirmed' || count < e.capacity, organizer: req.account!.id === e.organizer_id };
  }); res.json(result);
});
checkIn.post('/:id/check-in/claim', async (req, res) => {
  const id = z.uuid().parse(req.params.id), { token } = tokenBody.parse(req.body);
  await rate('checkin-scan:' + req.account!.id, 60, 3600);
  const added = await tx(async db => {
    const e = (await db.query('SELECT * FROM events WHERE id=$1 FOR UPDATE', [id])).rows[0];
    if (!e) fail(404, 'Meetup not found.'); assertOpen(e);
    const session = await validSession(db, id, token);
    if (req.account!.id === e.organizer_id) fail(403, 'A moderator must confirm the host’s attendance.');
    const mine = (await db.query('SELECT status,checked_in_at FROM rsvps WHERE event_id=$1 AND user_id=$2', [id, req.account!.id])).rows[0];
    if (mine?.checked_in_at) return false;
    if (mine?.status !== 'confirmed') {
      const count = Number((await db.query("SELECT count(*) AS n FROM rsvps WHERE event_id=$1 AND status='confirmed'", [id])).rows[0].n);
      if (count >= e.capacity) fail(409, 'This meetup is full. Ask the host for help.');
      await db.query(`INSERT INTO rsvps(event_id,user_id,status,email_consent,sms_consent) VALUES ($1,$2,'confirmed',false,false)
        ON CONFLICT(event_id,user_id) DO UPDATE SET status='confirmed',email_consent=false,sms_consent=false,updated_at=now()`, [id, req.account!.id]);
    }
    return confirmAttendance(db, id, req.account!.id, session.opened_by);
  });
  res.json({ checkedIn: true, alreadyCheckedIn: !added, awardedPoints: added ? pointAwards.event_attendance : 0 });
});
