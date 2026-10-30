import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ArrowUpRight, Camera, Check, Leaf, MapPin, Newspaper, Recycle, RefreshCw, Sprout, Store, TreePine, Users, Waves } from 'lucide-react';
import { useData } from '../api';
import { useApp } from '../context';
import { activityLabel, categoryLabel, statusLabel, type CivicEvent, type Incident } from '../../shared/model';
import { Button, ButtonLink, CategoryIcon, Loading, PageTitle } from '../components/common';
import { MeetupPoster } from '../components/MeetupPoster';
import { Carousel } from '../components/arc/carousel/carousel';
import SegmentedControl from '../components/arc/segmented-control/segmented-control';
import { createFeedPool, previewMeetups, type FeedFilter, type FeedItem, type FeedPhoto } from '../feed/content';
import { mixFeed } from '../feed/mix';
import './home.css';

const filters = [{ value: 'all', label: 'For you' }, { value: 'meetups', label: 'Meetups' }, { value: 'reports', label: 'Reports' }, { value: 'news', label: 'News' }, { value: 'resources', label: 'Resources' }];
const categoryNames = { meetups: 'Meetups', reports: 'Community report', news: 'Goa news', resources: 'Worth exploring' };
const categoryIcons = { meetups: Users, reports: MapPin, news: Newspaper, resources: Leaf };
const date = (value: string) => new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));
const time = (value: string) => new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit' }).format(new Date(value));
const session = { seed: Math.floor(Math.random() * 0xFFFFFFFF), filter: 'all' as FeedFilter, count: 12 };
const isLocalPreview = () => import.meta.env.DEV && ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname);
const meetupHref = (event: CivicEvent) => event.id.startsWith('home-sample-') ? '/home/meetups/' + event.id : '/events/' + event.id;

function EventGraphic({ event, detail = false }: { event: CivicEvent; detail?: boolean }) {
  return <MeetupPoster heading={detail ? 'h1' : 'h2'} activity={event.activity} title={event.title} description={event.description} dateLabel={date(event.startsAt)} timeLabel={`${time(event.startsAt)} – ${time(event.endsAt)} IST`} location={event.locationLabel} meetup={detail ? event.meetup : undefined} capacity={event.capacity} materials={detail ? event.materials : undefined} recurrence={event.recurrence} poster={event.poster} />;
}

export function HomeMeetupPreview() {
  const { id } = useParams();
  const { config, ready } = useApp();
  if (!ready) return <div className="page"><Loading /></div>;
  const event = (config?.demo || config?.qa || isLocalPreview()) ? previewMeetups.find(item => item.id === id) : undefined;
  return <div className="page home-meetup-preview"><Link className="back-link" to="/home"><ArrowLeft size={17} aria-hidden="true" />Home</Link>{event ? <><p className="home-preview-note">Fictional meetup · Sample feed</p><EventGraphic event={event} detail /><p className="home-copy">This is an invented meetup to preview the feed. It isn’t open for RSVPs.</p><FeedLink href="/events">Explore meetups</FeedLink></> : <><h1>This preview isn’t available.</h1><FeedLink href="/home">Back to Home</FeedLink></>}</div>;
}

function ReadingVisual({ id, category }: { id: string; category: string }) {
  const Visual = id === 'green-business' ? Store : id === 'climate-plan' ? Leaf : id === 'nature' ? Sprout : id === 'saligao-maintenance' ? Recycle : id === 'green-goa-2026' ? TreePine : id.includes('cleanup') ? Waves : category === 'news' ? Newspaper : MapPin;
  return <div className="home-reading-visual" aria-hidden="true"><Visual size={52} strokeWidth={1.25} /></div>;
}

function FeedLink({ href, children }: { href: string; children: ReactNode }) {
  return href.startsWith('/') ? <Link className="home-link" to={href}>{children}<ArrowRight size={17} aria-hidden="true" /></Link>
    : <a className="home-link" href={href} target="_blank" rel="noreferrer">{children}<ArrowUpRight size={17} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>;
}

function Photo({ photo, eager }: { photo: FeedPhoto; eager: boolean }) {
  const [failed, setFailed] = useState(false);
  return <figure className="home-photo">{failed ? <div className="home-photo-missing"><Camera size={26} aria-hidden="true" /><span>Photo couldn’t load</span></div> : <img src={photo.src} alt={photo.alt} loading={eager ? 'eager' : 'lazy'} decoding="async" width={1448} height={1086} onError={() => setFailed(true)} />}</figure>;
}

function GalleryPost({ item, first }: { item: Extract<FeedItem, { kind: 'gallery' }>; first: boolean }) {
  const gallery = item.gallery;
  const [index, setIndex] = useState(0);
  const photo = gallery.photos[index]!;
  return <>
    {gallery.featured && <h2 className="home-card-title">{gallery.title}</h2>}
    <div className="home-post-heading"><p className="home-location"><MapPin size={14} aria-hidden="true" />{gallery.location}{gallery.date && <> · {date(gallery.date)}</>}</p><span className="home-photo-count" aria-label={`Photo ${index + 1} of ${gallery.photos.length}`}>{index + 1} / {gallery.photos.length}</span></div>
    <div className={`home-gallery${gallery.portrait ? ' home-gallery-portrait' : ''}`}><Carousel label={gallery.title + ' photo gallery'} slideSize="100cqw" index={index} onIndexChange={setIndex}>
      {gallery.photos.map((image, i) => <Photo key={image.src} photo={image} eager={first && i === 0} />)}
    </Carousel></div>
    {photo.credit && <p className="home-credit">{photo.source ? <a href={photo.source} target="_blank" rel="noreferrer">{photo.credit}<ArrowUpRight size={12} aria-hidden="true" /></a> : photo.credit}</p>}
    {!gallery.featured && <h2 className="home-card-title home-gallery-title">{gallery.title}</h2>}
    {gallery.description && <p className="home-copy">{gallery.description}</p>}
    {gallery.href && gallery.action && <FeedLink href={gallery.href}>{gallery.action}</FeedLink>}
  </>;
}

function Post({ item, first, repeated }: { item: FeedItem; first: boolean; repeated: boolean }) {
  const Icon = categoryIcons[item.category];
  const context = item.kind === 'gallery' ? item.gallery.label : item.kind === 'event' ? item.event.example ? 'Example meetup' : activityLabel[item.event.activity] : item.kind === 'report' ? item.report.example ? 'Example report' : categoryLabel(item.report.category) : item.reading.source;
  return <article className={`home-post home-post-${item.kind}`} data-feed-category={item.category}>
    <div className="home-post-meta"><span><Icon size={16} aria-hidden="true" />{categoryNames[item.category]}</span><span>{context}</span>{repeated && <span>Revisited</span>}</div>
    {item.kind === 'gallery' ? <GalleryPost item={item} first={first} /> : item.kind === 'report' ? <>
      <div className="home-report-heading">{!item.report.photo && <div className="home-report-visual" aria-hidden="true"><CategoryIcon category={item.report.category} size={40} /></div>}<h2 className="home-card-title"><Link to={'/reports/' + item.report.id}>{item.report.description || item.report.title}</Link></h2></div>
      <p className="home-location"><MapPin size={14} aria-hidden="true" />{item.report.locationLabel}{item.report.privacy === 'blurred' && ' · Approximate location'}</p>
      {item.report.photo && <div className="home-report-photo"><Photo photo={{ src: item.report.photo, alt: item.report.alt, credit: '' }} eager={false} /></div>}
      <div className="home-report-state"><span>{item.report.status === 'resolved' && <Check size={15} aria-hidden="true" />}{statusLabel[item.report.status]}</span><time dateTime={item.report.updatedAt}>Updated {date(item.report.updatedAt)}</time></div>
      <FeedLink href={'/reports/' + item.report.id}>View report</FeedLink>
    </> : item.kind === 'event' ? <>
      <div className="home-event-graphic"><EventGraphic event={item.event} /></div>
      <p className="home-event-host">Hosted by @{item.event.username}</p>
      <div className="home-meetup-action"><ButtonLink to={meetupHref(item.event)}>Join Meetup<ArrowRight size={17} aria-hidden="true" /></ButtonLink></div>
    </> : <>
      <div className="home-reading-heading"><ReadingVisual id={item.reading.id} category={item.category} /><h2 className="home-card-title">{item.reading.title}</h2></div><p className="home-copy">{item.reading.description}</p>
      {item.reading.date && <time className="home-published" dateTime={item.reading.date}>Published {date(item.reading.date)}</time>}
      <FeedLink href={item.reading.href}>{item.reading.action}</FeedLink>
    </>}
  </article>;
}

export default function Home() {
  const { data, loading, error, reload } = useData<{ items: (Incident | CivicEvent)[] }>('/explore?mode=all');
  const { config } = useApp();
  const [filter, setFilter] = useState<FeedFilter>(session.filter);
  const [count, setCount] = useState(session.count);
  const [automatic, setAutomatic] = useState(true);
  const sentinel = useRef<HTMLDivElement>(null);
  const preview = Boolean(config?.demo || config?.qa || isLocalPreview());
  const pool = useMemo(() => createFeedPool(data?.items ?? [], preview).filter(item => filter === 'all' || item.category === filter), [data, preview, filter]);
  const entries = useMemo(() => mixFeed(pool, count, session.seed), [pool, count]);
  const loadMore = useCallback(() => setCount(value => { session.count = value + 8; return value + 8; }), []);
  useEffect(() => {
    if (loading || !pool.length || !automatic || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => { if (entry?.isIntersecting) { observer.disconnect(); loadMore(); } }, { rootMargin: '0px 0px 650px 0px' });
    if (sentinel.current) observer.observe(sentinel.current);
    return () => observer.disconnect();
  }, [loading, pool.length, automatic, count, loadMore]);
  const chooseFilter = (value: string) => { session.filter = value as FeedFilter; session.count = 12; setFilter(session.filter); setCount(12); };
  return <div className="page home-page">
    <PageTitle title="Around Goa." description="Local action. Good company. A place we share." />
    <div className="home-filters"><SegmentedControl label="Home feed" options={filters} value={filter} onValueChange={chooseFilter} /></div>
    <details className="home-feed-options"><summary>{preview ? 'Sample feed · About this feed' : 'About this feed'}</summary><p>Reports and meetups come from GO-GOA. News is a curated selection checked on 30 October 2026. Original publication dates stay with each story. Items may reappear as you explore.</p>{preview && <p>Sample galleries use credited reference photos and AI-generated scenes. These examples do not document GO-GOA meetups.</p>}<Button variant="secondary" onClick={() => setAutomatic(value => !value)}>{automatic ? 'Pause automatic loading' : 'Resume automatic loading'}</Button></details>
    {error && <div className="home-feed-notice" role="status"><p>Community activity couldn’t load. You can still explore news and resources.</p><Button variant="secondary" onClick={reload}><RefreshCw size={16} aria-hidden="true" />Retry activity</Button></div>}
    {loading ? <div className="home-loading"><Loading /></div> : <>
      <section aria-label={filter === 'all' ? 'Around Goa feed' : filters.find(item => item.value === filter)?.label} className="home-feed">
        {entries.map(({ key, item, repeated }, index) => <Post key={key} item={item} first={index === 0} repeated={repeated} />)}
      </section>
      {!entries.length && <div className="home-empty"><h2>{filter === 'meetups' ? 'Room for a little community action.' : 'Nothing here just yet.'}</h2><p>{filter === 'meetups' ? 'Find a meetup or start something close to home.' : 'Explore the other parts of Goa while this feed grows.'}</p><FeedLink href={filter === 'meetups' ? '/events' : '/map'}>{filter === 'meetups' ? 'Explore meetups' : 'Explore the map'}</FeedLink></div>}
      {entries.length > 0 && <div className="home-load-more" ref={sentinel}><Button variant="secondary" onClick={loadMore}>Keep exploring <ArrowRight size={17} aria-hidden="true" /></Button><p>More from around Goa. Stories may reappear as you explore.</p></div>}
      <span className="sr-only" role="status">{entries.length} items in the {filter === 'all' ? 'mixed' : filter} feed.</span>
    </>}
    {config?.demo && !preview && <p className="home-preview-note">Example community activity</p>}
  </div>;
}
