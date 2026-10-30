import { useParams, Link, useSearchParams } from 'react-router-dom';
import { ShieldCheck, MapPin, ArrowRight, ArrowUpRight, Phone } from 'lucide-react';
import { useData } from '../api.ts';
import type { Incident, CivicEvent, Resource } from '../../shared/model.ts';
import { categoryLabel, dateTime } from '../../shared/model.ts';
import { Status, PageTitle, ErrorNotice, Loading, EventRow, ResourceRow, CategoryIcon, ButtonLink } from '../components/common';
import { buttonClassName } from '../components/arc/button/button';
import { reportActions, reportActionSources, type ReportAction } from '../resources/report-actions';
import './report-detail.css';

function ActionLink({ action, primary = false }: { action: ReportAction; primary?: boolean }) {
  const internal = action.href.startsWith('/');
  const telephone = action.href.startsWith('tel:');
  const Icon = telephone ? Phone : internal ? ArrowRight : ArrowUpRight;
  const content = <>{action.label}<Icon size={17} aria-hidden="true" /></>;
  if (internal) return primary ? <ButtonLink to={action.href}>{content}</ButtonLink> : <Link className="report-action-link" to={action.href}>{content}</Link>;
  return <a className={primary ? buttonClassName('primary', 'md', 'button-link') : 'report-action-link'} href={action.href} target={telephone ? undefined : '_blank'} rel={telephone ? undefined : 'noreferrer'}>{content}</a>;
}
export default function ReportDetail() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { data, error, loading } = useData<{ incident: Incident; resources: Resource[]; events: CivicEvent[]; history: { status: string; at: string; reason?: string }[]; own: boolean }>('/incidents/' + id);
  if (loading) return <div className="page"><Loading /></div>;
  if (!data) return <div className="page"><ErrorNotice message={error} /><Link to="/map">Return to the map</Link></div>;
  const i = data.incident;
  const actions = reportActions(i);
  const source = ['electrical', 'streetlight'].includes(i.category) ? reportActionSources.electricity : i.category === 'trash' ? reportActionSources.waste : reportActionSources.complaints;
  return <div className="page detail-page report-detail">
    <PageTitle title={categoryLabel(i.category)} back="/map" />
    {params.has('submitted') && <p className="receipt" role="status"><ShieldCheck size={22} aria-hidden="true" /><span><strong>Report received.</strong> {i.status === 'new' ? 'You can take the next steps below while it is reviewed.' : 'Here are practical ways to help.'}</span></p>}
    <div className="detail-columns report-detail-layout">
      <section className="report-actions" aria-labelledby="report-actions-title">
        <h2 id="report-actions-title">What you can do next</h2>
        <p className="report-actions-intro">{i.category === 'trash' ? 'Bring people together, arrange collection or find the right service.' : 'Reach the right service and keep a record of your follow-up.'}</p>
        <div className="report-action-primary"><ActionLink action={actions[0]} primary /><p>{actions[0].description}</p></div>
        <ul className="report-action-list">{actions.slice(1).map(action => <li key={action.href}><ActionLink action={action} /><p>{action.description}</p></li>)}</ul>
        <p className="hint report-action-note">Go4Goa does not send your report to these services. You choose what to share. {i.status === 'new' && i.category !== 'electrical' && 'A new meetup will not publish or link this private report.'}</p>
        <p className="report-action-source"><a href={source} target="_blank" rel="noreferrer">Official service information <ArrowUpRight size={13} aria-hidden="true" /></a><span>Service page checked 30 October 2026. Confirm availability directly.</span></p>
      </section>
      <section className="report-evidence" aria-label="Report details">
        <div className="detail-photo">{i.photo ? <img src={i.photo} alt={i.alt} /> : <div className="large-placeholder"><CategoryIcon category={i.category} size={48} /><span>{i.example ? 'Fictional example report' : 'Photo withheld or unavailable'}</span></div>}</div>
        <div className="detail-meta"><Status status={i.status} /><span>{i.example ? 'Example · ' : ''}@{i.username}</span></div>
        <p className="report-description">{i.description || 'A report for review'}</p>
        <p className="location-copy"><MapPin size={18} aria-hidden="true" />{i.locationLabel} · {i.privacy === 'blurred' ? 'Approximate area' : 'Exact location'}</p>
        <p className="hint">Reported {dateTime(i.createdAt)} IST</p>
        {i.responsibleBody && <p>Responsible body: {i.responsibleBody}</p>}
        {i.status === 'new' && <p className="notice-inline">Your report stays private until it passes review. It has not been sent to an authority.</p>}
        {i.duplicateOf && <Link className="text-link" to={'/reports/' + i.duplicateOf}>View the related report <ArrowRight size={16} aria-hidden="true" /></Link>}
        {data.history.length > 0 && <details><summary>Status history</summary><ol className="history-list">{data.history.map((h, n) => <li key={n}><span><strong>{h.status?.replaceAll('_', ' ')}</strong>{h.reason && <small>{h.reason}</small>}</span><span>{dateTime(h.at)}</span></li>)}</ol></details>}
      </section>
      {(data.resources.length > 0 || (i.category !== 'electrical' && data.events.length > 0)) && <aside className="report-related">
        {data.resources.length > 0 && <section><h2>People and practical help</h2>{data.resources.map(r => <ResourceRow key={r.id} resource={r} />)}<p className="hint">Source listings may be historical. Confirm current coverage and availability.</p></section>}
        {i.category !== 'electrical' && data.events.length > 0 && <section><h2>Join a nearby meetup</h2>{data.events.map(e => <EventRow key={e.id} event={e} compact />)}</section>}
      </aside>}
    </div>
  </div>;
}
