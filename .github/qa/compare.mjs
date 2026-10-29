import {readFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
const root=process.argv[2];
const base=JSON.parse(await readFile(join(root,'baseline/results.json'))),candidate=JSON.parse(await readFile(join(root,'candidate/results.json')));
const hash=async path=>createHash('sha256').update(await readFile(path)).digest('hex');
if(base.captures.length!==39||candidate.captures.length!==39)throw new Error("Expected all 39 baseline/candidate states");
const changes=[];
for(const frame of candidate.captures){
 const before=base.captures.find(f=>f.file===frame.file);
 if(!before)throw new Error('Missing matching baseline: '+frame.file);
 changes.push({file:frame.file,changed:await hash(join(root,'baseline',frame.file))!==await hash(join(root,'candidate',frame.file)),baselineOverflow:before.overflow,candidateOverflow:frame.overflow,baselineAccessibility:before.accessibility,candidateAccessibility:frame.accessibility});
}
const summary={automatedChecksPassed:base.passed&&candidate.passed,renderedReviewRequired:true,changes};
await writeFile(join(root,'comparison.json'),JSON.stringify(summary,null,2));
console.log(`Captured ${changes.length} pairs; ${changes.filter(c=>c.changed).length} changed. Rendered design approval is still required.`);
if(!summary.automatedChecksPassed)throw new Error('Incomplete browser evidence');
for(const c of changes){if(c.candidateOverflow&&!c.baselineOverflow)throw new Error("New horizontal overflow: "+c.file);const existing=new Set(c.baselineAccessibility.map(v=>JSON.stringify(v)));const introduced=c.candidateAccessibility.filter(v=>['serious','critical'].includes(v.impact)&&!existing.has(JSON.stringify(v)));if(introduced.length)throw new Error('New serious accessibility finding: '+c.file);}
