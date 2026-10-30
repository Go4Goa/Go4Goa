import type { Category, Incident } from '../../shared/model';

export interface ReportAction { label: string; description: string; href: string }
export const reportActionSources = {
  complaints: 'https://cmhelpline.dpg.goa.gov.in/',
  electricity: 'https://www.goaelectricity.gov.in/contact-us/',
  waste: 'https://www.goa.gov.in/department/goa-waste-management-corporation/',
};
const contacts = (group: string, query = '') => `/directory?${new URLSearchParams({ group, ...(query ? { q: query } : {}) })}`;
const complaint: ReportAction = {
  label: 'Contact the government service',
  description: 'Submit to Goa’s CM Helpline or call 1905. Keep the complaint reference to follow up.',
  href: reportActionSources.complaints,
};
const guidance: Record<Exclude<Category, 'trash' | 'electrical'>, ReportAction> = {
  pothole: { label: 'Find road and local authority contacts', description: 'Ask which office maintains this road. Give the landmark and a photo taken from a safe place.', href: contacts('infrastructure', 'roads') },
  streetlight: { label: 'Find local infrastructure contacts', description: 'Note the pole number or nearest landmark. Leave electrical inspection and repairs to qualified staff.', href: contacts('infrastructure') },
  water: { label: 'Find water service contacts', description: 'Describe the leak or supply problem, its location and when it started. Ask the provider for the next step.', href: contacts('infrastructure', 'water') },
  other: { label: 'Find the responsible local office', description: 'Ask your Panchayat or municipal council which service can inspect the problem.', href: contacts('infrastructure') },
};
export function reportActions(incident: Pick<Incident, 'id' | 'category' | 'status'>): ReportAction[] {
  if (incident.category === 'electrical') return [
    { label: 'Call electricity helpline · 1912', description: 'Keep away from wires, equipment and nearby water. Do not touch anything or attempt a repair.', href: 'tel:1912' },
    { label: 'Get emergency help', description: 'For immediate danger, use the emergency contacts. Do not organize a meetup at this hazard.', href: '/resources/emergency' },
    { label: 'Electricity Department contacts', description: 'Official contact details and power complaint information.', href: reportActionSources.electricity },
  ];
  const publicReport = ['verified', 'in_progress', 'resolved'].includes(incident.status);
  const trash = incident.category === 'trash';
  const params = new URLSearchParams({ activity: trash ? 'cleanup_walk' : 'reporting_drive' });
  if (publicReport) params.set('report', incident.id);
  const meetup: ReportAction = {
    label: trash ? (publicReport ? 'Organize a meetup here' : 'Plan a cleanup meetup') : 'Organize a reporting walk',
    description: trash ? 'Choose a safe public meeting point and arrange waste collection before inviting people.' : 'Meet at a safe public spot to document issues together. Leave repairs to the responsible service.',
    href: '/events/new?' + params,
  };
  if (incident.category === 'trash') return [
    meetup,
    { label: 'Arrange rubbish collection', description: 'Choose the waste type and find a collection service. Confirm coverage, charges and pickup before a cleanup.', href: '/resources/topics/waste/collection' },
    { label: 'Find a recycler or drop-off option', description: 'Check accepted materials, the drop-off location and opening hours with the service before travelling.', href: '/resources/topics/waste/recycling' },
    { label: 'Contact waste services', description: 'Find local collection and community contacts. Ask your Panchayat or council about dumped waste.', href: contacts('trash') },
  ];
  return [
    incident.category === 'streetlight' ? { label: 'Contact the Electricity Department', description: 'Report the unlit or damaged streetlight and ask for the responsible maintenance team.', href: reportActionSources.electricity } : complaint,
    guidance[incident.category], meetup,
  ];
}
