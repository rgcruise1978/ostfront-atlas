const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
import fs from 'node:fs';
const base=process.argv[2]||'http://127.0.0.1:5200';const live=!base.includes('127.0.0.1');const out='phase-v-maps-review';fs.mkdirSync(out+'/screenshots',{recursive:true});fs.mkdirSync(out+'/exports',{recursive:true});
const dates=JSON.parse(fs.readFileSync('src/data/barbarossa-phase-v-timeline.json'));
const browser=await chromium.launch({executablePath:'/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',headless:true,args:['--no-sandbox','--enable-webgl','--ignore-gpu-blocklist','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const results=[];
for(const width of [1440,390]){
 const page=await browser.newPage({viewport:{width,height:1000},acceptDownloads:true});let errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const event of dates){
  errors=[];await page.goto(`${base}/atlases/barbarossa-1941?date=${event.date}&phase=5&region=${event.defaultView}`,{waitUntil:'networkidle'});await page.locator('.map-frame[data-map-ready="true"]').waitFor({timeout:45000});
  await page.waitForFunction(()=>!document.querySelector('.map-error'));
  
  const initial=await page.evaluate(()=>({error:document.querySelector('.map-error')?.textContent,overflow:document.documentElement.scrollWidth>innerWidth+1,records:document.querySelector('.finder-count')?.textContent,canvas:!!document.querySelector('.maplibregl-canvas'),date:document.querySelector('.map-frame')?.dataset.date}));
  const failures=[];if(initial.error||!initial.canvas||initial.date!==event.date)failures.push('map render');if(initial.overflow)failures.push('overflow');if(errors.length)failures.push(...errors);
  await page.locator('.map-frame').screenshot({path:`${out}/screenshots/${live?'live':'local'}-${event.date}-${width}.png`});
  await page.getByRole('button',{name:'Study context',exact:true}).click();await page.locator('.map-study-context>details').first().waitFor();
  const ctx=await page.locator('.map-study-context .map-context-passage').count();
  if(ctx<30)failures.push('missing article context');
  await page.locator('.map-study-context>details>summary').first().click();
  const link=page.locator('.context-feature-links button').first();if(await link.count()){await link.click();await page.locator('.feature-detail').waitFor();if(!(await page.locator('.feature-detail').innerText()).includes('Feature sources'))failures.push('feature evidence');}
  await page.getByRole('button',{name:'Logistics',exact:true}).first().click();
  await page.getByRole('button',{name:'Formations',exact:true}).click();
  results.push({date:event.date,width,url:page.url(),contextPassages:ctx,...initial,failures});console.log(event.date,width,failures.length?failures:'PASS');
 }
 // Principal secondary theatres, and earlier collections, use this same engine.
 if(width===1440){
  for(const [date,region] of [['1941-11-15','europe'],['1941-11-28','moscow-north'],['1941-11-29','lower-don'],['1941-12-05','tikhvin'],['1941-12-05','crimea'],['1941-12-05','tula']]){
   await page.goto(`${base}/atlases/barbarossa-1941?date=${date}&phase=5&region=${region}`,{waitUntil:'networkidle'});await page.locator('.map-frame[data-map-ready="true"]').waitFor();
   await page.locator('.map-frame').screenshot({path:`${out}/screenshots/${live?'live':'local'}-${date}-${region}.png`});results.push({date,region,width,failures:await page.locator('.map-error').count()?['map error']:[]});
  }
  // Export both operations and supply, checking actual downloadable artefacts.
  for(const [date,region,preset] of [['1941-11-28','yakhroma','Operations'],['1941-11-29','lower-don','Logistics']]){
   await page.goto(`${base}/atlases/barbarossa-1941?date=${date}&phase=5&region=${region}`,{waitUntil:'networkidle'});await page.locator('.map-frame[data-map-ready="true"]').waitFor();await page.getByRole('button',{name:preset,exact:true}).first().click();
   const download=page.waitForEvent('download',{timeout:45000});await page.getByRole('button',{name:'Save PNG',exact:true}).click();const file=await download;await file.saveAs(`${out}/exports/${live?'live':'local'}-${date}-${preset}.png`);results.push({date,preset,export:file.suggestedFilename(),failures:[]});
  }
  for(const [campaign,date,phase] of [['poland-1939','1939-09-28',''],['barbarossa-1941','1941-06-21','1'],['barbarossa-1941','1941-08-25','2'],['barbarossa-1941','1941-09-29','3'],['barbarossa-1941','1941-11-14','4']]){
   await page.goto(`${base}/atlases/${campaign}?date=${date}${phase?'&phase='+phase:''}`,{waitUntil:'networkidle'});await page.locator('.map-frame[data-map-ready="true"]').waitFor();await page.locator('.map-frame').screenshot({path:`${out}/screenshots/${live?'live':'local'}-regression-${date}.png`});results.push({campaign,date,regression:true,failures:await page.locator('.map-error').count()?['map error']:[]});
  }
 }
 await page.close();
}
await browser.close();fs.writeFileSync(`${out}/${live?'live':'local'}-browser.json`,JSON.stringify(results,null,2)+'\n');if(results.some(r=>r.failures.length))process.exitCode=1;
