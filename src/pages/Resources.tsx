import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, Navigate, Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ArrowUpRight, ContactRound, Siren } from 'lucide-react';
import { Button, ButtonLink } from '../components/common';
import { SearchField } from '../components/arc/search-field/search-field';
import TopicIcon from '../resources/TopicIcon';
import { actionPath, destination, fieldGuideOrigin, relatedRecords, resolveGuide, resourceTopics, searchGuide, topicPath } from '../resources/guide';
import type { ActionLink, TopicAction, TopicFlow } from '../resources/topic-flows';
import ResourceDirectory from './ResourceDirectory';
import EmergencyResources from './EmergencyResources';
import './resources.css';

function TopicHome() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const query = params.get('q') ?? '';
  const [draft, setDraft] = useState(query);
  useEffect(() => setDraft(query), [query]);
  const matches = searchGuide(query);
  // Existing report-detail links retain their issue-filtered directory destination.
  if (params.has('category')) return <Navigate replace to={`/resources/directory?${params}`} />;
  return <>
    <header className="resource-heading">
      <div className="resource-title-row"><h1>Resources</h1><ButtonLink variant="ghost" className="resource-emergency-link" to="/resources/emergency" aria-label="Infrastructure emergency help"><Siren size={17} aria-hidden="true" />Emergency help</ButtonLink></div>
      <a className="resource-attribution" href={fieldGuideOrigin} target="_blank" rel="noreferrer">Information from ActForGoa <ArrowUpRight size={14} aria-hidden="true" /></a>
    </header>
    <form className="resource-search" role="search" onSubmit={event => { event.preventDefault(); navigate(draft.trim() ? `/resources?q=${encodeURIComponent(draft.trim())}` : '/resources'); }}>
      <SearchField label="Search resources" placeholder="Search resources" value={draft} onValueChange={setDraft} hideLabel />
      <Button type="submit" size="sm" className="resource-search-submit" aria-label="Search resources"><ArrowRight size={19} aria-hidden="true" /></Button>
    </form>
    {query ? <section className="resource-search-results" aria-labelledby="resource-results-title">
      <div className="resource-section-heading"><h2 id="resource-results-title">Help with “{query}”</h2><Link to="/resources" className="text-link">All topics</Link></div>
      {matches.length ? <nav className="resource-result-list" aria-label="Matching answers">{matches.map(({ flow, action, href }) => <Link className="resource-result" key={href} to={href}><TopicIcon name={action.icon} /><span>{action.label}<small>{flow.label}</small></span><ArrowRight size={18} aria-hidden="true" /></Link>)}</nav> : <p>No matching answers yet. Try “waste”, “roads” or “water”, or browse both sectors.</p>}
      <Link className="resource-directory-link" to={`/resources/directory?q=${encodeURIComponent(query)}`}>Search people and guides for “{query}” <ArrowRight size={17} aria-hidden="true" /></Link>
    </section> : <section aria-labelledby="resource-topics-title">
      <h2 id="resource-topics-title" className="resource-question">Choose a topic</h2>
      <nav className="resource-topic-grid" aria-label="Resource topics">{resourceTopics.map(flow => <Link className="resource-choice" key={flow.slug} to={topicPath(flow)}><TopicIcon name={flow.icon} /><span>{flow.label}</span><ArrowRight className="resource-choice-arrow" size={19} aria-hidden="true" /></Link>)}</nav>
      <div className="resource-directory-shortcut"><ButtonLink variant="secondary" to="/directory"><ContactRound size={18} aria-hidden="true"/>Directory<ArrowRight size={17} aria-hidden="true" /></ButtonLink></div>
    </section>}
  </>;
}

function AnswerLink({ link, action }: { link: ActionLink; action: TopicAction }) {
  const href = destination(link.href);
  const content = <><TopicIcon name={link.icon ?? action.icon} /><span>{link.label}</span>{href.startsWith('http') ? <ArrowUpRight size={18} aria-hidden="true" /> : <ArrowRight size={18} aria-hidden="true" />}</>;
  return href.startsWith('/resources/')
    ? <Link className="resource-action-link" to={href}>{content}</Link>
    : <a className="resource-action-link" href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noreferrer' : undefined}>{content}</a>;
}

function Choices({ flow, parent }: { flow: TopicFlow; parent?: TopicAction }) {
  return <section aria-labelledby="resource-next-question"><h2 className="resource-question" id="resource-next-question">{parent?.question ?? 'What would you like to do?'}</h2>
    <nav className="resource-choice-list" aria-label="Choose what you need">{(parent?.choices ?? flow.actions).map(action => <Link key={action.id} className="resource-choice" to={actionPath(flow, action, parent)}><TopicIcon name={action.icon} /><span>{action.label}</span><ArrowRight className="resource-choice-arrow" size={19} aria-hidden="true" /></Link>)}</nav>
  </section>;
}

function TopicGuide() {
  const { slug, actionId, choiceId } = useParams();
  const { flow, parent, action, valid } = resolveGuide(slug, actionId, choiceId);
  if (!valid || !flow) return <MissingResource />;
  const records = action ? relatedRecords(action) : [];
  const people = records.filter(record => ['organisation', 'contact'].includes(record.kind));
  const reading = records.filter(record => !['organisation', 'contact'].includes(record.kind));
  return <div className="resource-guide">
    <nav className="resource-breadcrumb" aria-label="Breadcrumb">
      <Link to="/resources">Resources</Link><span aria-hidden="true">/</span>
      {action ? <><Link to={topicPath(flow)}>{flow.label}</Link><span aria-hidden="true">/</span></> : <span aria-current="page">{flow.label}</span>}
      {choiceId && parent && <><Link to={actionPath(flow, parent)}>{parent.label}</Link><span aria-hidden="true">/</span></>}
      {action && <span aria-current="page">{action.label}</span>}
    </nav>
    <header className="resource-guide-heading"><TopicIcon name={action?.icon ?? flow.icon} /><h1>{action?.label ?? flow.label}</h1></header>
    {!action ? <Choices flow={flow} /> : action.choices ? <Choices flow={flow} parent={action} /> : <div className="resource-answer">
      {!!action.steps?.length && <section aria-labelledby="resource-answer-title"><h2 id="resource-answer-title">How to get started</h2><ol className="resource-steps">{action.steps.map(step => <li key={step}>{step}</li>)}</ol></section>}
      {!!action.links?.length && <section aria-labelledby="resource-actions-title"><h2 id="resource-actions-title">Take the next step</h2><div className="resource-answer-links">{action.links.map(link => <AnswerLink key={`${link.href}-${link.label}`} link={link} action={action} />)}</div></section>}
      {!!people.length && <section id="topic-people" className="resource-related" aria-labelledby="resource-people-title"><h2 id="resource-people-title">People & organisations</h2><p>Confirm services and availability directly with the organisation.</p>{people.map(record => <a key={record.id} href={`${fieldGuideOrigin}/read/${record.id}`} target="_blank" rel="noreferrer">{record.title}<ArrowUpRight size={17} aria-hidden="true" /></a>)}</section>}
      {!!reading.length && <section id="topic-reading" className="resource-related" aria-labelledby="resource-reading-title"><h2 id="resource-reading-title">Guides & useful reading</h2>{reading.map(record => <a key={record.id} href={`${fieldGuideOrigin}/read/${record.id}`} target="_blank" rel="noreferrer">{record.title}<ArrowUpRight size={17} aria-hidden="true" /></a>)}</section>}
    </div>}
    <Link className="resource-back" to={choiceId && parent ? actionPath(flow, parent) : action ? topicPath(flow) : '/resources'}><ArrowLeft size={17} aria-hidden="true" />{choiceId ? 'Choose a different option' : action ? 'Choose a different need' : 'All topics'}</Link>
  </div>;
}

function MissingResource() {
  return <><h1>That resource isn’t here.</h1><p>Choose a topic to find the help you need.</p><Link className="resource-back" to="/resources"><ArrowLeft size={17} aria-hidden="true" />All topics</Link></>;
}

export default function Resources() {
  const location = useLocation();
  const page = useRef<HTMLDivElement>(null);
  const previousScroll = useRef<number | null>(null);
  useLayoutEffect(() => {
    const element = page.current;
    if (element && previousScroll.current !== null) {
      const y = previousScroll.current;
      const pageTop = element.getBoundingClientRect().top + window.scrollY;
      // Shorter submenus need enough page height to retain the same viewport.
      element.style.minHeight = `${Math.max(0, y + window.innerHeight - pageTop)}px`;
      window.scrollTo({ top: y, behavior: 'instant' });
    }
    return () => { previousScroll.current = window.scrollY; };
  }, [location.pathname, location.search]);
  useEffect(() => {
    const title = page.current?.querySelector('h1');
    const previousTitle = document.title;
    document.title = `${title?.textContent ?? 'Resources'} | GO-GOA`;
    if (title) { title.tabIndex = -1; title.focus({ preventScroll: true }); }
    return () => { document.title = previousTitle; };
  }, [location.pathname, location.search]);
  const isHome = location.pathname.replace(/\/$/, '') === '/resources';
  return <div className={`page resources-page${isHome ? ' resource-home' : ''}`} ref={page}>{!isHome && <a className="resource-attribution" href={fieldGuideOrigin} target="_blank" rel="noreferrer">Resource information provided by ActForGoa <ArrowUpRight size={14} aria-hidden="true" /></a>}<Routes>
    <Route index element={<TopicHome />} />
    <Route path="topics/:slug/:actionId?/:choiceId?" element={<TopicGuide />} />
    <Route path="emergency" element={<EmergencyResources />} />
    <Route path="directory" element={<ResourceDirectory />} />
    <Route path="*" element={<MissingResource />} />
  </Routes><div className="resource-more"><a className="text-link" href={fieldGuideOrigin} target="_blank" rel="noreferrer">Need more resources? Visit ActForGoa <ArrowUpRight size={16} aria-hidden="true" /></a></div></div>;
}
