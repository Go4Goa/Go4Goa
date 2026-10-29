import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {chromium} from '@playwright/test';
const origin='https://go-goa-qa.vercel.app',sha=process.env.EXPECTED_SHA,code=process.env.QA_ACCESS_CODE;
assert.match(sha||'',/^[a-f0-9]{40}$/);assert.ok(code?.length>=24,'Missing encrypted QA access secret');
const authorization='Basic '+Buffer.from('qa:'+code).toString('base64');
await mkdir('test-results/live',{recursive:true});
let health;
for(let i=0;i<90;i++){
 const r=await fetch(origin+'/api/health',{headers:{authorization},signal:AbortSignal.timeout(15000)});
 if(r.ok){const h=await r.json();if(h.release?.commit===sha){health=h;break;}}
 await new Promise(r=>setTimeout(r,10000));
}
assert.equal(health?.release?.commit,sha,'Stable alias did not reach the expected commit');assert.equal(health.mode,'hosted-qa');
for(const path of ['/','/report','/api/health','/api/explore'])assert.equal((await fetch(origin+path,{signal:AbortSignal.timeout(15000)})).status,401,'Unauthenticated access gate: '+path);
const browser=await chromium.launch({headless:true});const captures=[];
try{
 for(const width of [320,390,1440]){
  const context=await browser.newContext({httpCredentials:{username:'qa',password:code},viewport:{width,height:width===1440?1000:844},reducedMotion:'reduce',serviceWorkers:'block'});
  const page=await context.newPage();
  for(const [path,name]of [['/report','report'],['/','map'],['/events','events'],['/profile','profile']]){
   await page.goto(origin+path);await page.locator('main h1').first().waitFor();await page.evaluate(()=>document.fonts.ready);
   const bad=await page.evaluate(()=>[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.height&&/italic|oblique/.test(getComputedStyle(e).fontStyle);}).map(e=>e.tagName));assert.deepEqual(bad,[],'Live typography');
   const file=`${width}-${name}.png`;await page.screenshot({path:'test-results/live/'+file,fullPage:true,animations:'disabled'});captures.push(file);
  }
  await context.close();
 }
}finally{await browser.close();}
await writeFile('test-results/live/provenance.json',JSON.stringify({sha,health,origin,captures,runId:process.env.GITHUB_RUN_ID},null,2));
console.log('Live identity, access protection and 12 rendered views verified; manual rendered approval remains required.');
