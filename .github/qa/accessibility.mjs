// Compare per-rule node occurrences so partial fixes pass and added nodes fail.
const normalize=value=>value.replace(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi,'<fixture-id>');
function occurrences(violations){
 const counts=new Map();
 for(const v of violations)if(['serious','critical'].includes(v.impact))for(const node of v.nodes){
  const key=JSON.stringify([v.id,v.impact,node.map(normalize)]);counts.set(key,(counts.get(key)||0)+1);
 }
 return counts;
}
export function introducedAccessibility(before,after){
 const baseline=occurrences(before);
 return [...occurrences(after)].filter(([key,count])=>count>(baseline.get(key)||0)).map(([key,count])=>({node:JSON.parse(key),added:count-(baseline.get(key)||0)}));
}
