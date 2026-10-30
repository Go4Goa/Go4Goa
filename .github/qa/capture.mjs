// Trusted harness. Run only in an isolated runner with an ephemeral test database.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { resolve, join } from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { userInfo } from 'node:os';
const root=resolve(process.argv[2]||'.'), output=resolve(process.argv[3]||'test-results/visual');
const mapRoute=existsSync(join(root,'dist/app.html'))?'/map':'/';
const require=createRequire(join(root,'package.json'));
const {chromium}=require('@playwright/test'), AxeBuilder=require('@axe-core/playwright').default;
const pg=require('pg'), sharp=require('sharp');
const database=new URL(process.env.TEST_DATABASE_URL||'postgresql:///go_goa_test?host=/tmp');
assert.equal(database.pathname,'/go_goa_test');
if(!database.username)database.username=userInfo().username;
assert.ok(['','localhost','127.0.0.1'].includes(database.hostname),'Only a loopback test database is allowed');
await mkdir(output,{recursive:true});
const schema='visual_'+randomUUID().replaceAll('-','');
const db=new pg.Client({connectionString:database.href});await db.connect();
await db.query(`CREATE SCHEMA "${schema}"`);
const isolated=new URL(database);isolated.searchParams.set('options','-c search_path='+schema);
const origin='http://127.0.0.1:4499';
// Explicit allowlist: no provider credentials or production database reach app code.
const env={PATH:process.env.PATH,HOME:process.env.HOME,USER:userInfo().username,NODE_ENV:'test',GO_GOA_DEMO:'true',GO_GOA_QA:'false',
 DATABASE_URL:isolated.href,PORT:'4499',PUBLIC_ORIGIN:origin,DATA_KEY:'ab'.repeat(32)};
function run(args){const r=spawnSync(process.execPath,args,{cwd:root,env,stdio:'inherit'});assert.equal(r.status,0,args.join(' '));}
let server,browser;
const evidence={schemaVersion:1,widths:[320,390,1440],captures:[],checks:[],limitations:['Chromium emulation; no physical device/camera certification.','Map tiles are deterministic fictional fixtures; provider geography is not assessed.'],passed:false};
try {
 run(['--import','tsx','scripts/setup.ts']);run(['--import','tsx','scripts/seed.ts']);
 // Same dates in baseline and candidate; only this disposable schema is modified.
 await db.query(`UPDATE "${schema}".incidents SET created_at='2026-10-28T10:00:00Z',updated_at='2026-10-28T10:00:00Z'`);
 if((await db.query('SELECT to_regclass($1) AS name',[schema+'.directory_snapshot'])).rows[0].name)await db.query(`INSERT INTO "${schema}".directory_snapshot(id,snapshot) VALUES(true,$1)`,[JSON.stringify({version:'fictional-release-fixture',records:[{record_id:'goa-fictional-recycling',name:'Fictional Goa Recycling Service',collection:'community',record_type:'organization',organization:'Fictional Goa Recycling Service',role:'',focus_areas:'waste recycling',goa_location:'Panaji',jurisdiction:'Goa',summary:'Fictional fixture for directory layout and search.',source_urls:'https://example.org/fictional',website_url:'https://example.org',verification_status:'unverified',activity_status:'unknown'}],opportunities:[]})]);
 await db.query(`UPDATE "${schema}".events SET starts_at='2099-10-30T01:30:00Z'::timestamptz + CASE title WHEN 'A cleaner Miramar morning' THEN interval '0 days' WHEN 'Walk, notice, report' THEN interval '1 day' ELSE interval '3 days' END,ends_at='2099-11-03T03:30:00Z'`);
 server=spawn(process.execPath,['--import','tsx','server/index.ts'],{cwd:root,env,stdio:'inherit'});
 let ready=false;for(let i=0;i<100;i++){try{if((await fetch(origin+'/api/health')).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,200));}assert.ok(ready,'API startup');
 browser=await chromium.launch({headless:true});
 const photo=await sharp({create:{width:640,height:480,channels:3,background:'#d0d8ca'}}).jpeg().toBuffer();
 const tile=await sharp({create:{width:256,height:256,channels:3,background:'#e9eddf'}}).png().toBuffer();
 for(const width of evidence.widths){
  const context=await browser.newContext({viewport:{width,height:width===1440?1000:844},reducedMotion:'reduce',locale:'en-GB',timezoneId:'Asia/Kolkata',serviceWorkers:'block'});
  await context.route('https://tile.openstreetmap.org/**',r=>r.fulfill({contentType:'image/png',body:tile}));
  await context.route('https://tiles.openfreemap.org/**',r=>r.request().url().endsWith('/planet')?r.fulfill({json:{tilejson:'3.0.0',tiles:['https://tiles.openfreemap.org/fixture/{z}/{x}/{y}.pbf'],minzoom:0,maxzoom:14,vector_layers:['park','water','transportation','place'].map(id=>({id,fields:{}}))}}):r.fulfill({contentType:'application/x-protobuf',body:Buffer.alloc(0)}));
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  async function capture(name){
   if(await page.locator('.maplibregl-canvas').count()){
    await page.locator('.radar-map-loading').waitFor({state:'hidden',timeout:15000});
    assert.equal(await page.locator('.radar-map-failure').count(),0,'Map fixture must render without a fallback: '+name);
   }
   await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(200);
   const scan=await page.evaluate(()=>{
    const visible=el=>{const r=el.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(el).visibility!=='hidden';};
    const upright=[...document.querySelectorAll('body *')].filter(visible).filter(e=>/italic|oblique/.test(getComputedStyle(e).fontStyle)).map(e=>e.tagName+'.'+e.className);
    const sideflags=[...document.querySelectorAll('main div,main section,main aside,main blockquote')].filter(visible).filter(e=>{const c=getComputedStyle(e);return parseFloat(c.borderLeftWidth)>=3&&parseFloat(c.borderRightWidth)===0&&parseFloat(c.borderTopWidth)===0&&parseFloat(c.borderBottomWidth)===0;}).map(e=>e.tagName+'.'+e.className);
    return {upright,sideflags,overflow:document.documentElement.scrollWidth>innerWidth+1};
   });
   const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
   const file=`${width}-${name}.png`;await page.screenshot({path:join(output,file),fullPage:true,animations:'disabled'});
   evidence.captures.push({file,width,state:name,...scan,accessibility:axe.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(n=>n.target)}))});
   assert.deepEqual(scan.upright,[],'Upright typography required');assert.deepEqual(scan.sideflags,[],'Sideflag container detected');
  }
  await page.goto(origin+'/report');await page.getByRole('heading',{name:'What needs attention?'}).waitFor();await capture('issue');
  await page.getByRole('button',{name:'Continue',exact:false}).click();await page.getByText('Choose the type of issue.',{exact:true}).waitFor();await capture('validation');
  await page.getByRole('button',{name:'Infrastructure Something broken or unsafe'}).click();
  await page.getByRole('button',{name:'Electrical danger',exact:true}).click();await capture('electrical');
  await page.getByRole('button',{name:'Trash Litter or dumped waste'}).click();await page.getByRole('button',{name:'Continue',exact:false}).click();
  await page.locator('input[type=file]').last().setInputFiles({name:'fictional.jpg',mimeType:'image/jpeg',buffer:photo});
  await page.getByAltText('Your selected report photo').waitFor();await capture('photo');
  await page.getByRole('button',{name:'Continue',exact:false}).click();await page.getByText('Enter coordinates',{exact:true}).click();
  await page.getByLabel('Latitude',{exact:true}).fill('15.482731');await page.getByLabel('Longitude',{exact:true}).fill('73.819274');
  await page.getByRole('button',{name:'Set location',exact:true}).click();await page.getByLabel('Place or landmark',{exact:true}).fill('Fictional QA place');await capture('place');
  await page.getByRole('button',{name:'Continue',exact:false}).click();await capture('signin-draft');
  await page.getByRole('button',{name:'Continue as a resident',exact:true}).click();await page.getByRole('heading',{name:'Ready for review.'}).waitFor();
  assert.equal(await page.getByText('Fictional QA place',{exact:true}).count(),1,'Draft survives sign in');await capture('review');
  await context.setOffline(true);await page.getByText('Offline. This draft is only on this page. Keep it open.',{exact:true}).waitFor();
  assert.ok(await page.getByRole('button',{name:'Submit for review'}).isDisabled());await capture('offline');await context.setOffline(false);
  let failures=0;await page.route('**/api/incidents',async route=>{if(route.request().method()==='POST'&&failures++===0)await route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'Synthetic upload failure. Please retry.'})});else await route.continue();});
  await page.getByRole('button',{name:'Submit for review'}).click();await page.getByText('Synthetic upload failure. Please retry.',{exact:true}).waitFor();
  assert.equal(await page.getByAltText('Report photo ready to submit').count(),1);await capture('upload-failed');
  await page.getByRole('button',{name:'Submit for review'}).click();await page.waitForURL('**/reports/**');await db.query(`UPDATE "${schema}".incidents SET created_at='2026-10-28T10:00:00Z',updated_at='2026-10-28T10:00:00Z' WHERE example=false`);await page.reload();await page.waitForTimeout(500);await capture('submitted');
  evidence.checks.push({width,uploadFailureRetry:true,offlineGuard:true,draftAcrossSignIn:true,errors});assert.deepEqual(errors,[],'Browser runtime errors');
  for(const [route,name]of [[mapRoute,'map'],['/events','events'],['/profile','profile'],['/resources','resources'],['/resources/topics/waste','resource-topic'],['/directory','directory'],['/events/new','meetup-create']]){await page.goto(origin+route);await page.locator('main h1').first().waitFor();await page.waitForTimeout(300);await capture(name);
   if(name==='meetup-create'&&await page.getByText('Customize graphic',{exact:true}).count()){
    const time=page.getByRole('combobox',{name:/Start time/});
    if(await time.count()){
     await time.focus();await time.press('ArrowDown');await time.press('ArrowDown');await time.press('Enter');
     assert.match(await time.getAttribute('aria-labelledby'),/label/);assert.equal(await time.getAttribute('aria-expanded'),'false');
     assert.equal(await time.evaluate(el=>el===document.activeElement),true,'Time selection retains trigger focus');
     await time.press('ArrowDown');await time.press('Escape');assert.equal(await time.getAttribute('aria-expanded'),'false');
     await time.press('ArrowDown');await time.press('Tab');assert.equal(await time.getAttribute('aria-expanded'),'false');
     assert.equal(await page.getByRole('combobox',{name:'How long?',exact:true}).evaluate(el=>el===document.activeElement),true,'Tab exits the time list directly');
    }
    await page.getByRole('button',{name:'Meetup name: Untitled meetup',exact:true}).click();
    await page.getByRole('textbox',{name:'Meetup name',exact:true}).fill('Fictional recovered meetup');
    await page.getByRole('button',{name:'Save meetup name',exact:true}).click();
    await page.getByText('Customize graphic',{exact:true}).click();
    await page.getByRole('button',{name:'Ocean',exact:true}).click();await page.getByRole('button',{name:'Waves',exact:true}).click();
    await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Map',exact:true}).click();await page.goBack();
    await page.getByRole('heading',{name:'Fictional recovered meetup',exact:true}).waitFor();
    await page.reload();await page.getByRole('heading',{name:'Fictional recovered meetup',exact:true}).waitFor();
    assert.equal(await page.locator('.event-preview-poster').getAttribute('data-poster-color'),'ocean');
    assert.equal(await page.locator('.event-preview-poster').getAttribute('data-poster-pattern'),'waves');
    await page.getByRole('button',{name:'Meetup name: Fictional recovered meetup',exact:true}).click();
    await page.getByRole('textbox',{name:'Meetup name',exact:true}).fill('X'.repeat(101));
    await page.getByRole('button',{name:'Create meetup',exact:true}).click();
    await page.getByText('Keep the name under 100 characters.',{exact:true}).first().waitFor();
    assert.match(page.url(),/events\/new/,'Invalid active draft cannot publish an older saved value');
    evidence.checks.push({width,meetupDraftAcrossNavigationAndReload:true,posterRecovery:true,invalidInlineDraftBlocked:true});
   }
  }
  const event=(await db.query(`SELECT id FROM "${schema}".events ORDER BY title LIMIT 1`)).rows[0];
  await page.goto(origin+'/events/'+event.id);await page.locator('main h1').first().waitFor();await capture('meetup-detail');
  await context.close();
 }
 evidence.passed=true;
} catch(error){evidence.error=String(error);throw error;}
finally {
 await writeFile(join(output,'results.json'),JSON.stringify(evidence,null,2));
 await browser?.close();if(server){server.kill('SIGTERM');await new Promise(r=>server.once('exit',r));}
 await db.query(`DROP SCHEMA "${schema}" CASCADE`);await db.end();
}
