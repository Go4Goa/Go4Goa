import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Check, MapPin, CalendarDays } from 'lucide-react';
import { useApp } from '../context';
import { api, useAction } from '../api';
import { Button, ButtonLink, ErrorNotice, Loading, PageTitle } from '../components/common';
import { dateTime } from '../../shared/model';
import type { CheckInPreview } from '../../shared/check-in';
import SignIn from './SignIn';
import '../components/check-in.css';

export default function CheckIn() {
  const { id } = useParams();
  return <CheckInLink key={id} id={id!} />;
}
function CheckInLink({ id }: { id: string }) {
  const { hash } = useLocation();
  const incoming = new URLSearchParams(hash.slice(1)).get('token');
  const [token, setToken] = useState(incoming || '');
  // The shared keyboard skip link changes the fragment to #main. Keep the
  // scanned token in memory while allowing a newly scanned code to replace it.
  useEffect(() => { if (incoming) setToken(incoming); }, [incoming]);
  return <CheckInForm key={token} id={id} token={token} />;
}
function CheckInForm({ id, token }: { id: string; token: string }) {
  const { account, ready, config, refresh } = useApp();
  const [data, setData] = useState<CheckInPreview | null>(null), [loading, setLoading] = useState(true), [error, setError] = useState('');
  const [revision, setRevision] = useState(0), [receipt, setReceipt] = useState<{ awardedPoints: number; alreadyCheckedIn: boolean } | null>(null);
  const { busy, error: actionError, run } = useAction();
  useEffect(() => {
    if (!ready || !account) return;
    const controller = new AbortController(); setLoading(true); setError('');
    if (!token) { setError('Open the link from the host’s QR code to check in.'); setLoading(false); return; }
    void api<CheckInPreview>(`/events/${id}/check-in/preview`, { method: 'POST', body: JSON.stringify({ token }), signal: controller.signal })
      .then(setData).catch(e => { if (e.name !== 'AbortError') setError(e.message); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [id, token, account?.id, ready, revision]);
  const confirmed = receipt || data?.alreadyCheckedIn;
  return <div className="page narrow checkin-page">
    <PageTitle title={confirmed ? 'You’re checked in.' : 'Check in to your meetup'} back={`/events/${id}`} />
    {!ready ? <Loading /> : !account ? <>
      <p>Continue with your profile to save your attendance.</p><SignIn />
      <Button variant="secondary" loading={busy} onClick={() => run(refresh)}>Retry profile connection</Button>
    </> : loading ? <Loading /> : error ? <>
      <ErrorNotice message={error} /><Button variant="secondary" onClick={() => setRevision(v => v + 1)}>Try again</Button>
      <ButtonLink variant="ghost" to={`/events/${id}`}>View meetup</ButtonLink>
    </> : data && <>
      <section className="checkin-event">
        <h2>{data.title}</h2>
        <p><MapPin size={18} aria-hidden="true" />{data.locationLabel}</p>
        <p><CalendarDays size={18} aria-hidden="true" />{dateTime(data.startsAt)} IST</p>
      </section>
      {confirmed ? <section className="checkin-receipt" aria-label="Attendance receipt" role="status">
        <Check size={28} aria-hidden="true" /><h2>{receipt && !receipt.alreadyCheckedIn ? `+${receipt.awardedPoints} contribution points` : 'Attendance already confirmed'}</h2>
        <p>{receipt && !receipt.alreadyCheckedIn ? 'Thank you for showing up. Your attendance and points are saved to your profile.' : `Your +${data.points} points are already saved. Scanning again won’t add more points.`}</p>
        <ButtonLink to="/profile">View your profile</ButtonLink>
      </section> : data.organizer ? <p>A moderator can confirm your attendance from the attendee list. You can’t check yourself in as the host.</p> : !data.canJoin ? <p>This meetup is full. Ask the host for help with check-in.</p> : <section className="checkin-confirm">
        <p>Earn <strong>+{data.points} contribution points</strong> for attending. Only confirm if you’re here at the meetup.</p>
        <Button loading={busy} onClick={() => run(async () => { const result = await api<{ awardedPoints: number; alreadyCheckedIn: boolean }>(`/events/${id}/check-in/claim`, { method: 'POST', body: JSON.stringify({ token }) }); setReceipt(result); })}>Confirm my attendance<Check size={18} /></Button>
        <p className="hint">One attendance award per meetup. No reminder subscriptions are added.</p>
      </section>}
      {config?.qa && !config.phoneVerification && <p className="hint checkin-browser-note">Your activity stays with this browser. Use the same browser for future meetups and reports; clearing its cookies removes access to this guest profile.</p>}
    </>}
    <ErrorNotice message={actionError} />
  </div>;
}
