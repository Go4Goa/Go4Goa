/** Go4Goa's discovery boundary. Broad environmental or civic labels alone do not qualify. */
export function civicSectors(...values: (string | string[] | undefined)[]): ('trash'|'infrastructure')[] {
  const text=values.flat().filter(Boolean).join(' ').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replaceAll('_',' ').toLowerCase();
  const result: ('trash'|'infrastructure')[]=[];
  if(/\b(waste\w*|recycl\w*|garbage|rubbish|trash|litter\w*|sanitation|compost\w*|clean[ -]?ups?|scrap|dumping|sewage|sewer\w*|septic)\b/.test(text))result.push('trash');
  if(/\b(infrastructure|public works|roads?|potholes?|street[ -]?light\w*|street lighting|electricity|electrical|power supply|water supply|waterworks|water treatment|water distribution|water connection|water harvesting|rainwater|drain\w*|sewage|sewer\w*|septic|plumbing|pipelines?|leaking pipe|broken pipe|bridge repair|bridge construction|road bridge|pavement\w*|footpaths?|construction|building permission\w*|building repair\w*|urban development|municipal\w*|panchayat\w*|sarpanch\w*)\b/.test(text))result.push('infrastructure');
  return result;
}
export const inCivicScope=(...values: Parameters<typeof civicSectors>)=>civicSectors(...values).length>0;
