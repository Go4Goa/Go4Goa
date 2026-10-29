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
for(const path of ['/','/report','/events','/resources','/directory','/api/health','/api/explore']){
 const response=await fetch(origin+path,{signal:AbortSignal.timeout(15000)});
 assert.equal(response.status,200,'Public access: '+path);assert.equal(response.redirected,false,'No login redirect: '+path);assert.equal(response.headers.get('www-authenticate'),null);
}
for(const role of ['resident','organizer','moderator']){
 const response=await fetch(origin+'/api/auth/demo',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify({role})});
 assert.equal(response.status,403,'Shared test persona remains restricted');assert.equal(response.headers.get('set-cookie'),null);assert.equal(response.headers.get('www-authenticate'),null);
}
assert.equal((await fetch(origin+'/api/auth/team-access')).status,404,'No manual team sign-in route');
assert.equal((await fetch(origin+'/api/account')).status,401,'Private account data requires its browser session');
const browser=await chromium.launch({headless:true});const captures=[];
try{
 const guestIds=new Set();
 for(const width of [320,390,1440]){
  const context=await browser.newContext({viewport:{width,height:width===1440?1000:844},reducedMotion:'reduce',serviceWorkers:'block'});
  const page=await context.newPage();
  async function settle(){await page.evaluate(()=>document.fonts.ready);await page.evaluate(()=>window.scrollTo(0,0));await page.waitForTimeout(300);}

  for(const [path,name]of [['/report','report'],['/','map'],['/events','events'],['/profile','profile'],['/resources','resources'],['/resources/topics/waste','resource-topic'],['/directory','directory']]){
   await page.goto(origin+path);await page.locator('main h1').first().waitFor();
   if(name==='map'){await page.locator('.maplibregl-canvas').waitFor();await page.locator('.radar-map-loading').waitFor({state:'hidden',timeout:60000});assert.equal(await page.locator('.radar-map-failure').count(),0,'Live map provider must render');await page.getByRole('button',{name:/\d+ places? · View list/}).waitFor();}
   if(name==='events')await page.locator('.event-feed .event-row').first().waitFor();
   if(name==='directory')await page.locator('.directory-results').waitFor();
   if(name==='profile'){await page.locator('.private-profile').waitFor();assert.equal(await page.getByText('Sign out',{exact:true}).count(),0);assert.equal(await page.getByLabel('Phone number',{exact:true}).count(),0);const who=await(await context.request.get(origin+'/api/auth/me')).json();assert.equal(who.account.role,'resident');assert.match(who.account.username,/^guest_/);guestIds.add(who.account.id);assert.equal((await context.request.get(origin+'/api/admin/incidents')).status(),403,'Guests cannot moderate');await page.reload();await page.locator('.private-profile').waitFor();assert.equal((await(await context.request.get(origin+'/api/auth/me')).json()).account.id,who.account.id,'Reload reuses this browser identity');await page.goto(origin+'/profile/preferences');await page.getByRole('heading',{name:'Preferences',exact:true}).waitFor();assert.equal(await page.getByText('Sign out',{exact:true}).count(),0);assert.equal(await page.getByLabel('Email address',{exact:true}).count(),0);await settle();const preferences=`${width}-preferences.png`;await page.screenshot({path:'test-results/live/'+preferences,fullPage:true,animations:'disabled'});captures.push(preferences);await page.goto(origin+'/profile');await page.locator('.private-profile').waitFor();}
   await settle();
   const bad=await page.evaluate(()=>[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.height&&/italic|oblique/.test(getComputedStyle(e).fontStyle);}).map(e=>e.tagName));assert.deepEqual(bad,[],'Live typography');
   const file=`${width}-${name}.png`;await page.screenshot({path:'test-results/live/'+file,fullPage:true,animations:'disabled'});captures.push(file);
  }
  await page.goto(origin+'/events/new');await page.getByRole('button',{name:'Meetup name: Untitled meetup',exact:true}).waitFor();
  await page.getByText('Customize graphic',{exact:true}).click();await page.getByRole('button',{name:'Ocean',exact:true}).click();await page.getByRole('button',{name:'Waves',exact:true}).click();
  await settle();
  const editor=`${width}-meetup-create.png`;await page.screenshot({path:'test-results/live/'+editor,fullPage:true,animations:'disabled'});captures.push(editor);
  const listing=await context.request.get(origin+'/api/explore?mode=events',{headers:{authorization}});assert.equal(listing.status(),200);
  const events=(await listing.json()).items;assert.ok(events.length,'A fictional QA meetup is required for live evidence');
  await page.goto(origin+'/events/'+events[0].id);await page.locator('main h1').first().waitFor();await page.getByRole('button',{name:'Share meetup',exact:true}).waitFor();
  await settle();
  const detail=`${width}-meetup-detail.png`;await page.screenshot({path:'test-results/live/'+detail,fullPage:true,animations:'disabled'});captures.push(detail);
  await context.close();
 }
 assert.equal(guestIds.size,3,'Every fresh browser gets its own guest identity');
}finally{await browser.close();}
await writeFile('test-results/live/provenance.json',JSON.stringify({sha,health,origin,captures,runId:process.env.GITHUB_RUN_ID},null,2));
console.log('Live identity, public guest use without sign-in, restricted test accounts and 30 rendered views verified; manual rendered approval remains required.');
