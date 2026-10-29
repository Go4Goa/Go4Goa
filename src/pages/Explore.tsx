import { SearchField } from '../components/arc/search-field/search-field';
import SegmentedControl from '../components/arc/segmented-control/segmented-control';
import { Select } from '../components/arc/select/select';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, LocateFixed, List, ArrowRight, X } from 'lucide-react';
import { useData } from '../api';
import { useApp } from '../context';
import { categoryLabel, dateTime, type Point } from '../../shared/model';
import { Button, Empty, ErrorNotice, IncidentRow, EventRow, Loading, Status } from '../components/common';
import type { MapItem } from '../components/map/markers';
import { defaultMapPoint, locateInGoa } from '../services/maps';
import '../components/map/radar.css';
const FieldMap = lazy(() => import('../components/FieldMap'));

export default function Explore() {
  const [search, setSearch] = useSearchParams();
  const mode = ['incidents', 'events'].includes(search.get('mode') || '') ? search.get('mode')! : 'all';
  const [category, setCategory] = useState('all'), [status, setStatus] = useState('all'), [dates, setDates] = useState('all');
  const [q, setQ] = useState(''), [query, setQuery] = useState(''), [bounds, setBounds] = useState(''), [near, setNear] = useState('');
  const [selected, setSelected] = useState<string | null>(null), [filters, setFilters] = useState(false), [expanded, setExpanded] = useState(false);
  const [locationError, setLocationError] = useState(''), [locating, setLocating] = useState(false), [center, setCenter] = useState<Point | null>(defaultMapPoint);
  const panel = useRef<HTMLElement>(null), filterButton = useRef<HTMLButtonElement>(null), filterPanel = useRef<HTMLDivElement>(null);
  const { config } = useApp();
  const params = new URLSearchParams({ mode, category, status, dates, q: query, ...(bounds ? { bounds } : {}), ...(near ? { near, radius: '10000' } : {}) });
  const { data, error, loading, reload } = useData<{ items: MapItem[]; limited: boolean }>('/explore?' + params);
  const items = data?.items || [], active = items.find(item => item.id === selected);
  const filterCount = Number(mode !== 'all') + Number(category !== 'all') + Number(status !== 'all') + Number(dates !== 'all') + Number(!!near);
  const areaLabel = query ? `Results for “${query}”` : near ? 'Within 10 km' : bounds ? 'In this area' : 'Explore Goa';

  useEffect(() => {
    const sheet = panel.current;
    if (!sheet) return;
    const observer = new ResizeObserver(() => sheet.parentElement?.style.setProperty('--map-sheet-height', `${active && !expanded ? sheet.offsetHeight : 0}px`));
    observer.observe(sheet); return () => observer.disconnect();
  }, [!!active, expanded]);
  useEffect(() => { if (selected && data && !items.some(item => item.id === selected)) setSelected(null); }, [data, selected]);
  useEffect(() => {
    if (!filters) return;
    filterPanel.current?.querySelector<HTMLButtonElement>('[role=combobox]')?.focus();
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') { setFilters(false); filterButton.current?.focus(); } };
    window.addEventListener('keydown', close); return () => window.removeEventListener('keydown', close);
  }, [filters]);
  useEffect(() => {
    if (!expanded) return;
    panel.current?.focus({ preventScroll: true });
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setExpanded(false); requestAnimationFrame(() => document.querySelector<HTMLButtonElement>('.radar-list-toggle')?.focus()); }
    };
    window.addEventListener('keydown', close); return () => window.removeEventListener('keydown', close);
  }, [expanded]);
  async function locate() {
    setLocationError(''); setLocating(true);
    try { const point = await locateInGoa(); setCenter(point); setNear(`${point.lat},${point.lng}`); setBounds(''); setSelected(null); }
    catch (cause) { setLocationError((cause as Error).message); }
    finally { setLocating(false); }
  }
  function choose(id: string | null) {
    setSelected(id); setExpanded(false); setFilters(false);
  }
  function reset() {
    setBounds(''); setNear(''); setCategory('all'); setStatus('all'); setQuery(''); setQ(''); setDates('all'); setSelected(null);
    setSearch({}); setCenter({ ...defaultMapPoint }); setLocationError('');
  }

  return <div className={`radar-page${expanded ? ' is-list-expanded' : ''}`}>
    <h1 className="radar-sr-only">Goa activity map</h1>
    <div className="radar-canvas">
      <Suspense fallback={<div className="radar-map-loading">Loading the map…</div>}>
        <FieldMap items={items} selected={selected} center={center} onSelect={choose} onBounds={value => { setBounds(value); setNear(''); setSelected(null); }} onLocate={() => void locate()} locating={locating} />
      </Suspense>
      <div className="radar-topbar">
        <div className="radar-search-row">
          <form className="radar-search" role="search" onSubmit={event => { event.preventDefault(); setQuery(q.trim()); setSelected(null); }}>
            <SearchField label="Search reports, meetups or areas" placeholder="Search Goa" maxLength={100} value={q} onValueChange={value => { setQ(value); if (!value) setQuery(''); }} hideLabel />
            <Button variant="ghost" type="submit" aria-label="Search"><ArrowRight size={19} /></Button>
          </form>
          <Button variant="ghost" ref={filterButton} className={`radar-tool${filters || filterCount ? ' is-active' : ''}`} type="button" aria-expanded={filters} aria-controls="map-filters" aria-label={filterCount ? `Filters, ${filterCount} active` : 'Filters'} onClick={() => { setFilters(!filters); setExpanded(false); }}><SlidersHorizontal size={18} /></Button>
        </div>
        {filters && <div id="map-filters" className="radar-filters" ref={filterPanel}>
          <div className="radar-panel-title"><h2>Filter activity</h2><Button variant="ghost" type="button" aria-label="Close filters" onClick={() => { setFilters(false); filterButton.current?.focus(); }}><X size={20} /></Button></div>
          <SegmentedControl className="radar-types" label="Show on the map" value={mode} onValueChange={value => { setSearch(value === "all" ? {} : { mode: value }); setSelected(null); }} options={[{value:"all",label:"All activity"},{value:"incidents",label:"Reports"},{value:"events",label:"Meetups"}]} />
          <Select label="Issue" value={category} onValueChange={setCategory} disabled={mode === "events"} options={[{value:"all",label:"All issues"},{value:"infrastructure",label:"Infrastructure"},...(config?.categories.map(c=>({value:c.id,label:c.label}))||[])]}/>
          <Select label="Status" value={status} onValueChange={setStatus} disabled={mode === "events"} options={[{value:"all",label:"All public reports"},{value:"verified",label:"Verified"},{value:"in_progress",label:"In progress"},{value:"resolved",label:"Resolved"}]}/>
          <Select label="Meetups" value={dates} onValueChange={setDates} disabled={mode === "incidents"} options={[{value:"all",label:"Upcoming"},{value:"today",label:"Today"},{value:"week",label:"This week"}]}/>
          <div className="radar-filter-actions"><Button size="sm" variant="secondary" loading={locating} onClick={() => void locate()}><LocateFixed size={16} />Within 10 km</Button><Button variant="ghost" type="button" className="text-button" onClick={reset}>Reset</Button></div>
          <Button size="sm" onClick={() => { setFilters(false); filterButton.current?.focus(); }}>Show results</Button>
        </div>}
      </div>
      {(locationError || error) && <div className="radar-error"><ErrorNotice message={locationError || error} /><Button variant="ghost" type="button" className="text-button" onClick={() => { setLocationError(''); reload(); }}>Retry</Button></div>}
      {!active && !expanded && <Button variant="secondary" className="radar-list-toggle" type="button" aria-expanded={false} aria-controls="map-results" onClick={() => { setExpanded(true); setFilters(false); }}><List size={17} /><span aria-live="polite">{loading ? 'Loading…' : `${items.length} ${items.length === 1 ? 'place' : 'places'}`} · View list</span></Button>}
    </div>

    <section className={`radar-results${active ? ' has-selection' : ''}`} id="map-results" aria-label="Places on the map" tabIndex={-1} ref={panel} data-map-bottom-overlay hidden={!active && !expanded}>
      <div className="radar-results-heading">
        <div><h2>{areaLabel}</h2><p aria-live="polite">{loading ? 'Finding local activity…' : `${items.length} ${items.length === 1 ? 'place' : 'places'}`}</p></div>
        <Button variant="ghost" type="button" className="radar-sheet-toggle" aria-label="Back to map" onClick={() => { setExpanded(false); setSelected(null); requestAnimationFrame(() => document.querySelector<HTMLButtonElement>('.radar-list-toggle')?.focus()); }}><X size={18} /></Button>
      </div>
      {active && <div className="radar-selection" aria-label="Selected place">
        <div className="radar-selected-copy">
          <div className="meta-line">{active.kind === 'incident' ? <Status status={active.status} /> : <span>{dateTime(active.startsAt)} IST</span>}{active.example && <span>Example</span>}</div>
          <h2>{active.kind === 'incident' ? active.description || categoryLabel(active.category) : active.title}</h2>
          <p>{active.locationLabel}{active.kind === 'incident' && active.privacy === 'blurred' ? ' · Approximate' : ''}</p>
          <Link className="text-link" to={`/${active.kind === 'incident' ? 'reports' : 'events'}/${active.id}`}>{active.kind === 'incident' ? 'View report' : 'View meetup'}<ArrowRight size={16} /></Link>
        </div>
        <Button variant="ghost" type="button" className="radar-dismiss" aria-label="Close selected place" onClick={() => setSelected(null)}><X size={18} /></Button>
      </div>}
      <div className="radar-result-rows" id="map-result-rows">
        {config?.demo && <p className="radar-demo-note">Example reports and meetups for local testing.</p>}
        {loading && !data ? <Loading /> : error && !data ? <Empty title="Activity couldn’t load"><p>Check your connection and try again.</p><Button variant="secondary" onClick={reload}>Retry</Button></Empty> : items.length ? items.map(item => item.kind === 'incident'
          ? <IncidentRow key={item.id} incident={item} selected={selected === item.id} onSelect={() => choose(item.id)} />
          : <div className={`radar-event-row${selected === item.id ? ' selected' : ''}`} id={'item-' + item.id} key={item.id}><EventRow event={item} compact /><Button variant="ghost" className="text-button" type="button" onClick={() => choose(item.id)}>On map <ArrowRight size={14} /></Button></div>)
          : <Empty title="No activity found"><p>{query ? 'Try another area or a different search.' : 'Try another area, reset filters or report an issue.'}</p><Button variant="secondary" onClick={reset}>Reset filters</Button></Empty>}
        {data?.limited && <p className="hint">Showing up to 100 places of each type. Zoom in to narrow the area.</p>}
        <Link className="radar-report-link" to="/report">Notice something that needs care?<span>Report an issue <ArrowRight size={17} /></span></Link>
      </div>
    </section>
  </div>;
}
