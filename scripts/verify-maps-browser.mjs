import fs from 'node:fs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base=process.argv[2]||'http://127.0.0.1:5207',audit=(process.env.OSTKRIEG_AUDIT_DIRECTORY || './map-coverage-review').replace(/\/$/,'')+'/';
fs.mkdirSync(audit+'screenshots',{recursive:true});fs.mkdirSync(audit+'exports',{recursive:true});
const coverage=JSON.parse(fs.readFileSync('public/data/history/map-coverage.json','utf8'));
const browser=await chromium.launch({...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{}),headless:true,args:['--no-sandbox','--enable-webgl','--ignore-gpu-blocklist','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const results=[],errors=[];const page=await browser.newPage({viewport:{width:1440,height:1050},acceptDownloads:true});page.on('pageerror',e=>errors.push(e.message));
function url(row){return `${base}/atlases/${row.collectionIndex?'barbarossa-1941':'poland-1939'}?date=${row.date}${row.collectionIndex?'&phase='+row.collectionIndex:''}&region=${row.defaultView}`;}
let priorCollection=null;
for(const row of coverage){
 const failures=[];errors.length=0;
 try{
 if(priorCollection===null||(priorCollection===0)!==(row.collectionIndex===0)){await page.goto(url(row),{waitUntil:'networkidle'});}else{await page.getByRole('button',{name:'Next historical date',exact:true}).click();}priorCollection=row.collectionIndex;await page.locator(`.map-frame[data-map-ready="true"][data-date="${row.date}"]`).waitFor({timeout:45000});
 await page.getByRole('combobox',{name:'Map region',exact:true}).selectOption(row.defaultView);
 const initial=await page.evaluate(async()=>{const el=document.querySelector('.atlas-map'),map=el.__atlasMap;const sources={};if(map){for(const name of ['operations','formations','logistics','studyPlaces'])sources[name]=(await map.getSource(name).getData()).features.map(f=>f.properties);}
 return {date:document.querySelector('.map-frame')?.dataset.date,error:document.querySelector('.map-error')?.textContent,overflow:document.documentElement.scrollWidth>innerWidth+1,sources};});
 if(initial.date!==row.date||initial.error||initial.overflow)failures.push(JSON.stringify({date:initial.date,error:initial.error,overflow:initial.overflow}));
 for(const[name,records]of Object.entries(initial.sources)){for(const p of records){if(p.category==='arrowhead')continue;if(p.snapshots&&!p.snapshots.includes(row.date))failures.push('wrong date '+name+':'+p.id);}}
 if((initial.sources.studyPlaces?.length||row.additions.studyLocalities)!==row.additions.studyLocalities)failures.push('locality count');
 await page.getByRole('button',{name:'Study context',exact:true}).click();const count=await page.locator('.map-context-passage').count();if(count!==row.additions.studyPassages)failures.push('context count '+count);
 if(await page.locator('.map-study-context>details').first().getAttribute('open')===null)await page.locator('.map-study-context>details>summary').first().click();
 const link=page.locator('.context-feature-links button').first();if(await link.count()){await link.click();await page.locator('.feature-detail').waitFor();if(!(await page.locator('.feature-detail').innerText()).includes('Feature sources'))failures.push('missing evidence');}
 if([0,1,2,3,4,5].every(i=>row.collectionIndex!==i))failures.push('collection');
 if(coverage.find(c=>c.collectionIndex===row.collectionIndex)?.date===row.date){
   await page.getByRole('button',{name:'Formations',exact:true}).click();await page.getByRole('button',{name:'Reset view',exact:true}).click();await page.waitForTimeout(150);await page.locator('.map-frame').screenshot({path:audit+`screenshots/desktop-${row.collectionIndex}.png`});
 }
 results.push({date:row.date,width:1440,contextPassages:count,localities:initial.sources.studyPlaces?.length,failures});fs.writeFileSync(audit+'browser-results.json',JSON.stringify(results,null,2)+'\n');console.log(row.date,failures.length?failures:'PASS');
 }catch(error){failures.push(error.message);results.push({date:row.date,width:1440,failures});console.log(row.date,error.message);}
 if(errors.length)results.at(-1).failures.push(...errors);
}
// Exercise the full return path, expiry of selection, preset, search, presentation and exported evidence.
for(const date of ['1939-08-23','1941-06-25','1941-07-10','1941-09-29','1941-10-16','1941-11-28']){
 const row=coverage.find(c=>c.date===date),failures=[];await page.setViewportSize({width:390,height:844});await page.goto(url(row),{waitUntil:'networkidle'});await page.locator('.map-frame[data-map-ready="true"]').waitFor({timeout:45000});
 if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))failures.push('mobile overflow');
 await page.getByRole('button',{name:'Study context',exact:true}).click();if(await page.locator('.map-study-context>details').first().getAttribute('open')===null)await page.locator('.map-study-context>details>summary').first().click();await page.locator('.map-frame').screenshot({path:audit+`screenshots/mobile-${row.collectionIndex}.png`});
 const sectionLink=page.locator('.map-study-context>details[open]>a').first();await sectionLink.focus();await page.keyboard.press('Enter');await page.locator('.article-body').waitFor();const fragment=new URL(page.url()).hash;if(fragment&&!(await page.locator(fragment).count()))failures.push('missing study fragment '+fragment);
 const back=page.getByRole('link',{name:'Explore this date ↗',exact:true}).first();await back.focus();await page.keyboard.press('Enter');await page.locator('.map-frame[data-map-ready="true"]').waitFor({timeout:45000});if(new URL(page.url()).searchParams.get('date')!==date)failures.push('lost return date');
 await page.locator('.map-frame').scrollIntoViewIfNeeded();await page.getByRole('button',{name:'Present',exact:true}).focus();await page.keyboard.press('Enter');if(!(await page.locator('.is-presenting').count()))failures.push('presentation');await page.keyboard.press('Escape');
 results.push({date,width:390,failures});console.log('mobile',date,failures.length?failures:'PASS');
}
await page.setViewportSize({width:1440,height:1050});const row=coverage.find(c=>c.date==='1941-11-28');await page.goto(url(row),{waitUntil:'networkidle'});await page.locator('.map-frame[data-map-ready="true"]').waitFor({timeout:45000});
await page.getByRole('button',{name:'Logistics',exact:true}).first().click();await page.locator('#atlas-search').fill('canal');const searchCount=await page.locator('.finder-results>button').count();if(!searchCount)results.push({test:'search',failures:['no canal results']});await page.locator('#atlas-search').fill('');
await page.locator('.map-layer-panel>summary').click();await page.getByLabel('Study localities · explanatory references',{exact:true}).check();await page.getByLabel('Civilians, evacuation & occupation',{exact:true}).check();
for(const label of ['Save evidence','Save PNG']){try{const downloaded=page.waitForEvent('download',{timeout:25000});await page.getByRole('button',{name:label,exact:true}).click();const file=await downloaded;await file.saveAs(audit+'exports/'+file.suggestedFilename());results.push({test:label,file:file.suggestedFilename(),failures:[]});console.log(label,'PASS');}catch(error){const status=await page.locator('.map-status-message').innerText();results.push({test:label,failures:[error.message,status]});console.log(label,error.message,status);}}
await page.getByRole('button',{name:'Formations',exact:true}).click();await page.locator('.finder-results>button').first().click();await page.getByRole('button',{name:'Next historical date',exact:true}).click();await page.locator('.map-frame[data-map-ready="true"]').waitFor({timeout:45000});if(await page.locator('.feature-detail').count())results.push({test:'clear date selection',failures:['selection retained']});
// Public informational routes and all 50 article identities.
for(const path of ['/','/collections','/articles','/sources','/guide','/about','/about-the-author','/campaigns/poland-1939',...Array.from({length:5},(_,i)=>'/campaigns/barbarossa-1941?phase='+(i+1)),...fs.readdirSync('src/content/articles').filter(f=>f.endsWith('.json')).map(f=>'/articles/'+f.slice(0,-5))]){
 await page.goto(base+path,{waitUntil:'domcontentloaded'});await page.locator('main h1').waitFor();const failures=[];if(await page.getByText('There is no page at this address.',{exact:true}).count())failures.push('missing route');if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))failures.push('overflow');results.push({route:path,failures});
}
await browser.close();fs.writeFileSync(audit+'browser-results.json',JSON.stringify(results,null,2)+'\n');const failures=results.filter(r=>r.failures.length);console.log('RESULT',JSON.stringify({checks:results.length,failed:failures.length,failures}));if(failures.length)process.exitCode=1;
