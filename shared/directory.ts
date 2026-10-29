import { filterRecords, filtersFrom, isDue, type CRMRecord, type Filters, type Workspace } from './actforgoa/crm-model.ts';
import { directoryIdentity } from './actforgoa/directory-quality.ts';
import { crmDirectoryTags } from './actforgoa/crm-directory.ts';
import { civicSectors } from './civic-scope.ts';

export const directoryGroups = { all:'All contacts', trash:'Trash & recycling', infrastructure:'Infrastructure', government:'Government', services:'Services', community:'Organisations' };
export type DirectoryGroup = keyof typeof directoryGroups;
const services = /\b(sanitation|sewage|sewer\w*|septic|waste|recycl\w*|compost\w*|garbage|cleaning|plumbing|electric\w*|water supply|repair\w*|public works)\b/;
export function inDirectoryGroup(record: CRMRecord, group: DirectoryGroup) {
  const text = [record.name, record.focus_areas.replace(/environmental_relevance_unestablished/g,''), ...crmDirectoryTags(record)].join(' ').replaceAll('_',' ').toLowerCase();
  if(group==='government')return record.collection==='government'||/government|public_office/.test(record.record_type);
  if(group==='trash'||group==='infrastructure')return directorySectors(record).includes(group);
  if(group==='services')return services.test(text);
  if(group==='community')return ['organization','network','community_network','volunteer_network'].includes(record.record_type);
  return true;
}
export function directorySectors(r: CRMRecord){return civicSectors(r.name,/biodiversity (management )?committee/i.test(r.name+' '+r.role)?'':r.organization,r.role,r.focus_areas,r.summary,crmDirectoryTags(r));}
export function directorySearchTerms(query: string) {
  if(!/[?]|\b(who|what|where|how|which|can|could|please|looking|find)\b/i.test(query))return query.trim();
  const filler=new Set('who what where how which can could would should do does is are i me my we our you your please tell find help get need looking for a an the in on at to of with goa near'.split(' '));
  const terms=(query.match(/[\p{L}\p{N}]+/gu)||[]).filter(term=>!filler.has(term.toLowerCase()));
  return terms.length?terms.join(' '):query.trim();
}
export function searchDirectory(records: CRMRecord[], params: URLSearchParams, workspace: Workspace) {
  const filters: Filters=filtersFrom(params); filters.q=directorySearchTerms(filters.q);
  const group=(params.get('group')||'all') as DirectoryGroup;
  let results=filterRecords(records,new Set(),filters,workspace).filter(r=>directorySectors(r).length>0&&inDirectoryGroup(r,group));
  const audience=params.get('audience');
  if(audience&&['government','services','community'].includes(audience))results=results.filter(r=>inDirectoryGroup(r,audience as DirectoryGroup));
  if(params.get('saved')==='1')results=results.filter(r=>Object.hasOwn(workspace,r.record_id));
  if(params.get('due')==='1')results=results.filter(r=>isDue(workspace[r.record_id]));
  if(!filters.q&&filters.sort==='relevance'){
    const priority=(r:CRMRecord)=>r.activity_status==='deceased_historical_record'||r.activity_status.startsWith('historical')?9:['individual','public_office_contact'].includes(r.record_type)?4:inDirectoryGroup(r,'trash')?0:inDirectoryGroup(r,'government')?1:2;
    results.sort((a,b)=>priority(a)-priority(b)||a.name.localeCompare(b.name));
  }
  // Preserve the best matching listing while collapsing exact upstream identity groups.
  const seen=new Set<string>();
  return results.filter(r=>{const id=directoryIdentity(r.record_id);if(seen.has(id))return false;seen.add(id);return true;});
}
export function directoryKind(record: CRMRecord) {
  if(record.record_type==='public_office_contact')return 'Government official';
  if(inDirectoryGroup(record,'government'))return 'Government';
  if(record.record_type==='business')return 'Local business';
  if(['organization','network','community_network','volunteer_network'].includes(record.record_type))return 'Organisation';
  return record.record_type.replaceAll('_',' ').replace(/^\w/,c=>c.toUpperCase());
}
