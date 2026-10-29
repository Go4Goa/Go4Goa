import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ArrowUpRight, Bookmark, Check, Download, MapPin, RefreshCw, SlidersHorizontal, Upload } from 'lucide-react';
import { api, useAction, useData } from '../api.ts';
import { Button, ErrorNotice, Loading } from '../components/common';
import { Input } from '../components/arc/input/input';
import { SearchField } from '../components/arc/search-field/search-field';
import { Select } from '../components/arc/select/select';
import { Textarea } from '../components/arc/textarea/textarea';
import { EmptyState } from '../components/arc/empty-state/empty-state';
import { activityLabel, activityLabels, backupJSON, emptyNote, isDue, mergeBackup, parseBackup, safeUrl, split, stages, storageKey, verification, verificationLabels, words, type CRMNote, type CRMRecord, type CRMSnapshot, type Stage, type Workspace } from '../../shared/actforgoa/crm-model';
import { crmDirectoryDetails, crmDirectoryLinks } from '../../shared/actforgoa/crm-directory';
import { websiteEvidence } from '../../shared/actforgoa/directory-quality';
import { directoryGroups, directoryKind, searchDirectory } from '../../shared/directory';
import './directory.css';

const origin='https://actforgoa-field-guide.vercel.app';
type Snapshot=CRMSnapshot & {syncedAt:string;stale:boolean};
function External({href,children}:{href:string;children:ReactNode}){const url=safeUrl(href);return url?<a href={url} target="_blank" rel="noreferrer">{children}<ArrowUpRight size={15} aria-hidden="true"/></a>:null;}
function exportNotes(workspace:Workspace){const url=URL.createObjectURL(new Blob([backupJSON(workspace)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='go4goa-directory-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}

function useWorkspace(){
  const [workspace,setWorkspace]=useState<Workspace>({}),[error,setError]=useState(''),[ready,setReady]=useState(false);
  const reload=()=>{try{const raw=localStorage.getItem(storageKey);setWorkspace(raw?parseBackup(raw):{});setError('');setReady(true);}catch{setError('Saved contacts could not be read. Your existing data has not been changed. Check browser storage and reload.');setReady(false);}};
  useEffect(()=>{reload();const onStorage=(event:StorageEvent)=>{if(event.key===storageKey)reload();};window.addEventListener('storage',onStorage);return()=>window.removeEventListener('storage',onStorage);},[]);
  const write=(update:(current:Workspace)=>Workspace)=>{
    if(!ready)return false;
    try{const raw=localStorage.getItem(storageKey);const next=update(raw?parseBackup(raw):{});localStorage.setItem(storageKey,backupJSON(next));setWorkspace(next);setError('');return true;}catch{setError('Your changes could not be saved. Check browser storage and try again.');return false;}
  };
  const save=(id:string,note:CRMNote)=>write(current=>({...current,[id]:{...note,updatedAt:new Date().toISOString()}}));
  return{workspace,error,ready,save,write};
}

export default function Directory(){
  const {id}=useParams();const [params,setParams]=useSearchParams();const query=params.get('q')||'';
  const [draft,setDraft]=useState(query),[limit,setLimit]=useState(20),[imported,setImported]=useState<Workspace|null>(null),[importError,setImportError]=useState(''),[notice,setNotice]=useState('');
  const upload=useRef<HTMLInputElement>(null);const heading=useRef<HTMLHeadingElement>(null);
  const {data,error,loading,reload}=useData<Snapshot>('/directory');const {busy,error:refreshError,run}=useAction();const local=useWorkspace();
  useEffect(()=>setDraft(query),[query]);useEffect(()=>setLimit(20),[params.toString()]);
  useEffect(()=>{heading.current?.focus({preventScroll:true});},[id,loading]);
  const records=data?.records||[];
  const results=useMemo(()=>searchDirectory(records,params,local.workspace),[data,params.toString(),local.workspace]);
  const current=id?records.find(r=>r.record_id===id):undefined;
  const setFilter=(key:string,value:string)=>{const next=new URLSearchParams(params);if(value&&value!=='all')next.set(key,value);else next.delete(key);setParams(next);};
  const back='/directory'+(params.size?'?'+params.toString():'');
  const recordUrl=(record:CRMRecord)=>'/directory/'+encodeURIComponent(record.record_id)+(params.size?'?'+params.toString():'');
  const savedCount=records.filter(r=>Object.hasOwn(local.workspace,r.record_id)).length;
  const dueCount=records.filter(r=>isDue(local.workspace[r.record_id])).length;
  const hasFilters=['q','group','audience','type','location','activity','stage','saved','due'].some(key=>params.has(key));
  const selectOptions=(values:Record<string,string>,all:string)=>[{value:'all',label:all},...Object.entries(values).map(([value,label])=>({value,label}))];
  const types=Object.fromEntries([...new Set(records.map(r=>r.record_type))].sort().map(value=>[value,words(value)]));
  const importFile=async(file?:File)=>{setImportError('');if(!file)return;try{if(file.size>5*1024*1024)throw new Error('Choose a backup smaller than 5 MB.');setImported(parseBackup(await file.text()));}catch(e){setImportError(e instanceof Error?e.message:'The backup could not be read.');}finally{if(upload.current)upload.current.value='';}};
  return <div className={"page directory-page"+(id?" directory-detail-page":"")}>
    {id&&<Link className="back-link" to={back}><ArrowLeft size={17}/>Directory</Link>}
    <header className="directory-header">
      <div><h1 ref={heading} tabIndex={-1}>{current?.name||'Directory'}</h1><External href={origin+'/directory'}>Directory provided by ActForGoa</External></div>
      {!id&&<Button variant={params.get('saved')==='1'?'primary':'secondary'} onClick={()=>setFilter('saved',params.get('saved')==='1'?'':'1')} aria-pressed={params.get('saved')==='1'}><Bookmark size={17} aria-hidden="true"/>Saved{savedCount?' · '+savedCount:''}</Button>}
    </header>
    {!id&&<><p className="directory-intro">Find people, organisations and services for trash and infrastructure in Goa.</p>
      <form className="directory-search" role="search" onSubmit={e=>{e.preventDefault();setFilter('q',draft.trim());}}><SearchField label="Search directory" placeholder="Search directory" hideLabel value={draft} onValueChange={value=>{setDraft(value);if(!value)setFilter('q','');}}/><Button type="submit" className="directory-search-submit" aria-label="Search directory"><ArrowRight size={18} aria-hidden="true"/></Button></form>
      <div className="directory-groups" role="group" aria-label="Directory categories">{Object.entries(directoryGroups).filter(([value])=>['all','trash','infrastructure'].includes(value)).map(([value,label])=><Button key={value} variant="ghost" size="sm" aria-pressed={(params.get('group')||'all')===value} onClick={()=>setFilter('group',value)}>{value==='all'?'All contacts':label}</Button>)}</div>
      <details className="directory-filters"><summary><SlidersHorizontal size={17} aria-hidden="true"/>More filters</summary><div className="directory-filter-grid">
        <Select label="Find" value={params.get('audience')||'all'} onValueChange={v=>setFilter('audience',v)} options={[{value:'all',label:'Everyone'},{value:'government',label:'Government contacts'},{value:'services',label:'Practical services'},{value:'community',label:'Organisations'}]}/><Input label="Location or jurisdiction" value={params.get('location')||''} onChange={e=>setFilter('location',e.target.value)} placeholder="e.g. Panaji or Salcete"/>
        <Select label="Listing type" value={params.get('type')||'all'} onValueChange={v=>setFilter('type',v)} options={selectOptions(types,'All types')}/>
        <Select label="Activity evidence" value={params.get('activity')||'all'} onValueChange={v=>setFilter('activity',v)} options={selectOptions(activityLabels,'Any activity status')}/>
        <Select label="Relationship" value={params.get('stage')||'all'} onValueChange={v=>setFilter('stage',v)} options={selectOptions(stages,'Any relationship')}/>
      </div><Button variant="ghost" aria-pressed={params.get('due')==='1'} onClick={()=>setFilter('due',params.get('due')==='1'?'':'1')}>Follow-ups due{dueCount?' · '+dueCount:''}</Button></details>
    </>}
    <ErrorNotice message={error||refreshError||local.error}/>
    {data?.stale&&<p className="directory-notice" role="status">Showing the last saved directory. ActForGoa could not be refreshed recently.</p>}
    {loading?<Loading/>:error&&!data?<EmptyState title="Directory unavailable" description="We couldn’t load the listings. Please try again." action={<Button onClick={reload}>Retry</Button>}/>:id?current?<RecordDetail key={current.record_id} record={current} note={local.workspace[current.record_id]||emptyNote(current)} saved={Object.hasOwn(local.workspace,current.record_id)} save={note=>local.save(current.record_id,note)} ready={local.ready} remove={()=>local.write(current=>{const next={...current};delete next[id!];return next;})}/>:<EmptyState title="This listing isn’t in Go4Goa’s directory" description="Go4Goa includes contacts related to trash and infrastructure. The wider directory is available on ActForGoa." action={<Link className="text-link" to={back}>Back to Directory</Link>}/>:<>
      <div className="directory-results-heading"><p role="status" aria-live="polite">{results.length.toLocaleString('en-IN')} {results.length===1?'contact':'contacts'}{query?' for “'+query+'”':''}{params.get('saved')==='1'?' saved':''}</p><div>{hasFilters&&<Button variant="ghost" size="sm" onClick={()=>{setParams({});setDraft('');}}>Clear filters</Button>}<Select label="Sort contacts" value={params.get('sort')||'relevance'} onValueChange={v=>setFilter('sort',v)} options={[{value:'relevance',label:'Recommended'},{value:'name',label:'Name A–Z'},{value:'activity',label:'Latest evidence'},{value:'followup',label:'Follow-up date'}]}/></div></div>
      {results.length?<section className="directory-results" aria-label="Directory results">{results.slice(0,limit).map(record=><DirectoryRow key={record.record_id} record={record} href={recordUrl(record)} saved={Object.hasOwn(local.workspace,record.record_id)} note={local.workspace[record.record_id]} ready={local.ready} onSave={()=>{if(local.save(record.record_id,{...emptyNote(record),stage:record.activity_status==='deceased_historical_record'?'do_not_contact':'shortlisted'}))setNotice('Contact saved in this browser.');}}/>)}{limit<results.length&&<Button className="directory-more" variant="secondary" onClick={()=>setLimit(v=>v+20)}>Show more contacts</Button>}</section>:<EmptyState icon={<Bookmark size={26}/>} title={params.get('saved')==='1'?'No saved contacts match':'No matching contacts'} description={params.get('saved')==='1'?'Save a contact from the directory to keep notes and plan a follow-up.':'Try “waste collection”, “roads” or a place name. Results are limited to trash and infrastructure.'} action={<Button variant="secondary" onClick={()=>{setParams({});setDraft('');}}>Browse contacts</Button>}/>}
      <details className="directory-backups"><summary>Saved contacts & backups</summary><p>Notes and follow-ups stay in this browser. They are not synced to your account or shared with ActForGoa. Export a backup before changing devices or clearing browser data.</p><div className="button-row"><Button variant="secondary" onClick={()=>exportNotes(local.workspace)} disabled={!local.ready||!Object.keys(local.workspace).length}><Download size={16}/>Export backup</Button><Button variant="secondary" disabled={!local.ready} onClick={()=>upload.current?.click()}><Upload size={16}/>Import backup</Button><input type="file" ref={upload} accept="application/json,.json" hidden onChange={e=>void importFile(e.target.files?.[0])}/></div><ErrorNotice message={importError}/>{imported&&<div className="directory-import"><p>{Object.keys(imported).length} saved records in this backup. Existing Go4Goa notes will be kept when a contact already has notes. Records outside trash and infrastructure are retained in your backup but hidden here.</p><div className="button-row"><Button onClick={()=>{if(local.write(current=>mergeBackup(current,imported,false))){setImported(null);setNotice('Backup imported. Existing notes were kept.');}}}>Import these records</Button><Button variant="ghost" onClick={()=>setImported(null)}>Cancel</Button></div></div>}</details>
    </>}
    <p className="directory-save-status" role="status">{notice}</p>
    <footer className="directory-footer"><p>Source listings do not confirm current roles, service availability or contact delivery.{data?.syncedAt?' Last synced '+new Intl.DateTimeFormat('en-IN',{day:'numeric',month:'short',year:'numeric',timeZone:'Asia/Kolkata'}).format(new Date(data.syncedAt))+'.':''}</p><div><External href={origin}>Need more resources? Visit ActForGoa</External><Button variant="ghost" size="sm" loading={busy} onClick={()=>run(async()=>{await api('/directory/refresh',{method:'POST',body:'{}'});reload();})}><RefreshCw size={15}/>Refresh directory</Button></div></footer>
  </div>;
}

function DirectoryRow({record:r,href,saved,note,ready,onSave}:{record:CRMRecord;href:string;saved:boolean;note?:CRMNote;ready:boolean;onSave:()=>void}){
  const historical=r.activity_status.startsWith('historical')||r.activity_status==='deceased_historical_record';
  const location=[r.goa_location,r.jurisdiction].find(value=>value?.trim()&&!/^(?:all\s+)?goa(?:,\s*india)?$|^statewide$/i.test(value.trim()));
  const summary=r.role
    ? [r.role,r.organization!==r.name?r.organization:''].filter(Boolean).join(' · ')
    : crmDirectoryDetails(r)?.description||r.summary;
  const stage=note&&!['new','shortlisted'].includes(note.stage)?stages[note.stage]:null;
  const due=!!note&&isDue(note);
  return <article className="directory-row">
    <div className="directory-row-main">
      <Link className="directory-name" to={href}>{r.name}<ArrowRight size={18} aria-hidden="true"/></Link>
      {summary&&<p className="directory-summary">{summary}</p>}
      {(location||historical||stage||due)&&<div className="directory-row-tail">
        {location&&<span>{location}</span>}
        {historical&&<span>Historical listing</span>}
        {stage&&<span>{stage}</span>}
        {due&&<span>Follow-up due</span>}
      </div>}
    </div>
    <div className="directory-row-save">{saved
      ? <Link className="text-link" to={href} aria-label={`Manage saved contact ${r.name}`}><Bookmark size={17} fill="currentColor" aria-hidden="true"/><span className="directory-save-label">Saved</span></Link>
      : <Button variant="ghost" size="sm" disabled={!ready} aria-label={`Save ${r.name}`} onClick={onSave}><Bookmark size={17} aria-hidden="true"/><span className="directory-save-label">Save</span></Button>}
    </div>
  </article>;
}

function RecordDetail({record:r,note,saved,save,ready,remove}:{record:CRMRecord;note:CRMNote;saved:boolean;save:(note:CRMNote)=>boolean;ready:boolean;remove:()=>boolean}){
  const [draft,setDraft]=useState(note),[message,setMessage]=useState(''),[removed,setRemoved]=useState<CRMNote|null>(null);const dirty=JSON.stringify(draft)!==JSON.stringify(note);
  useEffect(()=>{setDraft(note);},[note.updatedAt]);
  useEffect(()=>{const warn=(e:BeforeUnloadEvent)=>{if(dirty){e.preventDefault();e.returnValue='';}};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);},[dirty]);
  const deceased=r.activity_status==='deceased_historical_record';const links=crmDirectoryLinks(r);const check=websiteEvidence(r.website_url,r.record_id);
  const sources=[...new Set([...split(r.source_urls),...split(r.contact_source_urls),...split(r.activity_evidence_url)])].filter(url=>safeUrl(url));
  const update=(part:Partial<CRMNote>)=>{const next={...draft,...part};setDraft(next);setMessage(save(next)?'Saved in this browser.':'Changes are not saved. Try Save notes again.');};
  return <div className="directory-detail"><div className="directory-evidence"><p className="directory-detail-kind">{directoryKind(r)}{r.role?' · '+r.role:''}</p><p className="directory-detail-summary">{crmDirectoryDetails(r)?.description||r.summary}</p>{(r.goa_location||r.jurisdiction)&&<p className="directory-location"><MapPin size={16}/>{r.goa_location||r.jurisdiction}</p>}
    <section><h2>Contact & services</h2>{deceased?<p>This is a historical record of a deceased contributor. It is excluded from outreach.</p>:<><p>{r.contact_policy||'Publicly listed contact routes. Delivery and current availability have not been tested.'}</p><div className="directory-contact-links">{links.map(link=><External key={link.url} href={link.url}>{link.label==='Website'&&check.kind==='reference'?'Related reference page':link.label}</External>)}{split(r.public_email).filter(email=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)).map(email=><a key={email} href={'mailto:'+email}>{email}<ArrowUpRight size={15}/></a>)}{split(r.public_phone).filter(phone=>/^\+\d{10,15}$/.test(phone)).map(phone=><a key={phone} href={'tel:'+phone}>{phone}<ArrowUpRight size={15}/></a>)}<External href={origin+'/directory/'+r.record_id}>View ActForGoa listing</External></div>{['unverified','intermittent'].includes(check.status)&&<p className="hint">Website access was {check.status==='intermittent'?'intermittent':'not verified'} when checked {check.checked_on}. Use the source listing if the website is unavailable.</p>}{r.referral_route&&<p>{r.referral_route}</p>}{r.how_to_help&&<p>{r.how_to_help}</p>}</>}</section>
    <section><h2>What the sources say</h2><dl className="directory-facts"><div><dt>Activity</dt><dd>{activityLabel(r)}</dd></div><div><dt>Source review</dt><dd>{verificationLabels[verification(r)]}</dd></div><div><dt>Checked</dt><dd>{r.checked_on||'Date not supplied'}</dd></div></dl><p>{r.activity_verification_notes||'Current tenure and availability have not been independently confirmed.'}</p><div className="directory-sources">{sources.map((url,index)=><External key={url} href={url}>Source {index+1} · {new URL(url).hostname.replace(/^www\./,'')}</External>)}</div></section>
  </div><section className="directory-notes"><h2>Your notes</h2><p className="hint">Saved only in this browser. Anyone using this browser profile can access these notes.</p><form className="form-stack" onSubmit={e=>{e.preventDefault();if(save(draft))setMessage('Saved in this browser.');}}>
    <Select label="Relationship" value={draft.stage} onValueChange={stage=>update({stage:stage as Stage})} disabled={deceased} options={Object.entries(stages).map(([value,label])=>({value,label}))}/>
    <Textarea label="Notes" value={draft.notes} maxLength={50000} rows={5} placeholder="Who to speak to, what you discussed, or the next step…" onChange={e=>update({notes:e.target.value})}/>
    <Input label="Follow-up date" type="date" value={draft.followUp} disabled={deceased} onInput={e=>update({followUp:e.currentTarget.value})}/>
    <Input label="Last contacted" type="date" value={draft.lastContact} disabled={deceased} onInput={e=>update({lastContact:e.currentTarget.value})}/>
    <Button type="submit" disabled={!ready}><Check size={17}/>{saved?'Save notes':'Save contact & notes'}</Button><p className="hint" role="status">{message|| (dirty?'Unsaved changes. Save before leaving this listing.':'')}</p>
  </form>{saved&&<Button variant="ghost" onClick={()=>{const copy={...note};if(remove()){setRemoved(copy);setDraft(emptyNote(r));setMessage('Removed from saved contacts. You can undo below.');}}}>Remove saved contact</Button>}{removed&&!saved&&<Button variant="secondary" onClick={()=>{if(save(removed)){setRemoved(null);setMessage('Saved contact restored.');}}}>Undo removal</Button>}</section></div>;
}
