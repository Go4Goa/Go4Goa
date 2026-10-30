import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Copy, Maximize2, QrCode, RefreshCw, X } from 'lucide-react';
import { api, useAction, useData } from '../api';
import { Button, ErrorNotice, Loading } from './common';
import { Input } from './arc/input/input';
import { dateTime } from '../../shared/model';
import type { CheckInSession } from '../../shared/check-in';
import { pointAwards } from '../../shared/points';
import './check-in.css';

export function MeetupCheckIn({ id, title, onAttendance }: { id: string; title: string; onAttendance: () => void }) {
  const { data, error, loading, reload } = useData<CheckInSession>(`/events/${id}/check-in/session`);
  const { busy, error: actionError, run } = useAction();
  const [qr, setQr] = useState(''), [qrError, setQrError] = useState(''), [notice, setNotice] = useState('');
  const [now, setNow] = useState(Date.now());
  const dialog = useRef<HTMLDialogElement>(null);
  const url = data?.url;
  const active = !!(data?.active && data.expiresAt && Date.parse(data.expiresAt) > now && !error);
  useEffect(() => {
    let cancelled = false; setQr(''); setQrError(''); setNotice('');
    if (url) void QRCode.toDataURL(url, { width: 720, margin: 4, errorCorrectionLevel: 'M', color: { dark: '#000000', light: '#ffffff' } })
      .then(result => { if (!cancelled) setQr(result); }).catch(() => { if (!cancelled) setQrError('The QR image could not load. Use the check-in link below or retry.'); });
    return () => { cancelled = true; };
  }, [url]);
  useEffect(() => {
    const timer = window.setInterval(() => { setNow(Date.now()); if (!document.hidden) reload(); }, 15000);
    return () => window.clearInterval(timer);
  }, [reload]);
  useEffect(() => { onAttendance(); }, [data?.checkedIn, onAttendance]);
  useEffect(() => { if (!active) dialog.current?.close(); }, [active]);
  const changeSession = (method: 'POST' | 'DELETE') => run(async () => {
    await api(`/events/${id}/check-in/session`, { method, body: '{}' });
    if (method === 'DELETE') { dialog.current?.close(); setQr(''); }
    reload();
  });
  return <section id="meetup-check-in" className="meetup-checkin" aria-labelledby="checkin-heading">
    <h3 id="checkin-heading">Meetup check-in</h3>
    <p>Show this QR code to people at your meetup. Each attendee earns +{pointAwards.event_attendance} points once.</p>
    {loading && !data ? <Loading /> : data && <>
      <p className="checkin-count" role="status">{data.checkedIn} {data.checkedIn === 1 ? 'person checked in' : 'people checked in'}</p>
      {active ? <>
        <div className="checkin-code">
          {qr ? <img src={qr} width="320" height="320" alt={`Scan to check in to ${title}`} /> : !qrError && <Loading />}
          <p>Scan with your phone camera</p>
          <p className="hint">Code expires {dateTime(data.expiresAt!)} IST</p>
        </div>
        <div className="button-row">
          <Button variant="secondary" disabled={!qr} onClick={() => dialog.current?.showModal()}><Maximize2 size={18} />Enlarge QR</Button>
          <Button variant="secondary" onClick={() => run(async () => { await navigator.clipboard.writeText(url!); setNotice('Check-in link copied. Share it only with people at the meetup.'); })}><Copy size={18} />Copy check-in link</Button>
        </div>
        <details className="checkin-link"><summary>Can’t scan the code?</summary><Input label="Check-in link" readOnly value={url || ''} onFocus={e => e.target.select()} /><p className="hint">An attendee can open this link, or you can confirm them in the attendance list below.</p></details>
        <div className="button-row">
          <Button variant="secondary" loading={busy} onClick={() => changeSession('POST')}><RefreshCw size={16} />Replace code</Button>
          <Button variant="danger" loading={busy} onClick={() => changeSession('DELETE')}>Close check-in</Button>
        </div>
        <p className="hint">Replacing or closing the code stops the previous link from working.</p>
      </> : <>
        <p className="hint">{data.available ? 'Check-in is closed. Open it when attendees arrive. Codes last up to two hours.' : `QR check-in is available ${dateTime(data.opensAt)} to ${dateTime(data.closesAt)} IST for published meetups.`}</p>
        <Button loading={busy} disabled={!data.available || !!error} onClick={() => changeSession('POST')}><QrCode size={18} />Open QR check-in</Button>
      </>}
    </>}
    <ErrorNotice message={error || actionError || qrError} />
    {error && <Button variant="secondary" onClick={reload}>Retry check-in tools</Button>}
    {notice && <p role="status" className="hint">{notice}</p>}
    <dialog ref={dialog} className="checkin-dialog" aria-labelledby="qr-title" onClick={e => { if (e.target === e.currentTarget) dialog.current?.close(); }}>
      <div className="checkin-dialog-top"><h2 id="qr-title">Scan to check in</h2><Button variant="ghost" onClick={() => dialog.current?.close()} aria-label="Close enlarged QR"><X size={22} /></Button></div>
      <p>{title}</p>
      {active && qr && <img src={qr} width="480" height="480" alt={`Scan to check in to ${title}`} />}
      <p>Confirm your attendance to earn +{pointAwards.event_attendance} points.</p>
      {data?.expiresAt && <p className="hint">Code expires {dateTime(data.expiresAt)} IST</p>}
    </dialog>
  </section>;
}
