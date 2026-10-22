import fs from 'node:fs';
import crypto from 'node:crypto';
import { studyContextFor, fold } from '../src/map/studyConnections.js';
const read = file => JSON.parse(fs.readFileSync(file,'utf8'));
const write = (file,data) => fs.writeFileSync(file,JSON.stringify(data,null,2)+'\n');
const articles = fs.readdirSync('src/content/articles').filter(f=>f.endsWith('.json')).map(f=>read('src/content/articles/'+f));
const sources = read('src/data/sources.json');
const checkedSources=new Map(read('public/data/history/source-checks.json').checks.map(c=>[c.sourceId,c.status]));
const sourceById = new Map(sources.map(s=>[s.id,s]));
const files = ['timeline.json','barbarossa-timeline.json','barbarossa-phase-ii-timeline.json','barbarossa-phase-iii-timeline.json','barbarossa-phase-iv-timeline.json','barbarossa-phase-v-timeline.json'];
const layerNames = ['additional-civilian-context','military-control','formation-positions','military-operations','dated-fronts','historical-logistics'];
const layers = Object.fromEntries(layerNames.map(name=>[name,read(`public/data/history/${name}.geojson`).features]));
const onDate=(f,date)=>f.properties.snapshots ? f.properties.snapshots.includes(date) : (!f.properties.startDate||f.properties.startDate<=date)&&(!f.properties.endDate||date<=f.properties.endDate);
const places = ['barbarossa-reference-places','europe-places','phase-iv-places','phase-iv-focus-places','phase-v-places','phase-v-focus-places'].flatMap(name=>read(`public/data/geography/${name}.geojson`).features);
const aliases = {'Moscow':['Moscow','Moskva'],'Kiev':['Kiev','Kyiv'],'Lwów':['Lwów','Lvov','Lviv'],'Warsaw':['Warsaw','Warszawa'],'Kaunas':['Kaunas','Kovno'],'Białystok':['Białystok','Bialystok'],'Iași':['Iași','Iasi'],'Leningrad':['Leningrad'],'Stalino':['Stalino'],'Rostov-on-Don':['Rostov'],'Smolensk':['Smolensk']};
places.push(...read('src/data/capitals.json').map(c=>({type:'Feature',geometry:{type:'Point',coordinates:c.coordinates},properties:{...c,sourceIds:c.sourceIds}})));
const postwar = new Set(['Volgodonsk','Zheleznogorsk','Dubna']);
const localityFeatures=[],coverage=[],sectionRegister=[];
const notes=read('src/data/snapshot-notes.json');
for (const [collectionIndex,file] of files.entries()) {
  for (const event of read('src/data/'+file)) {
    const article=articles.find(a=>a.slug===event.articleSlug), context=studyContextFor(article);
    if(!article||!notes[event.date])throw Error('Missing study or date explanation: '+event.date);
    const active=Object.fromEntries(layerNames.map(name=>[name,layers[name].filter(f=>onDate(f,event.date))]));
    const usedCoordinates=new Set();
    const dateLocalities=[];
    for(const place of places){
      const p=place.properties, name=p.periodName||p.name||p.displayName;
      if(!name||name.length<5||postwar.has(name)||/saint petersburg|st petersburg|donetsk|kaliningrad/i.test(name))continue;
      const terms=aliases[name]||[name];
      const matching=context.paragraphs.filter(row=>terms.some(term=>new RegExp(`(^|[^a-z])${fold(term).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}([^a-z]|$)`).test(fold(row.text))));
      if(!matching.length)continue;
      const coordKey=place.geometry.coordinates.map(n=>n.toFixed(2)).join(',');if(usedCoordinates.has(coordKey))continue;usedCoordinates.add(coordKey);
      const id=`study-place-${event.date}-${fold(name).replace(/[^a-z0-9]+/g,'-')}`;
      if(dateLocalities.some(f=>f.properties.id===id))continue;
      const sourceIds=[...new Set([...(p.sourceIds||[]),...(p.sourceId?[p.sourceId]:[]),...matching.flatMap(row=>row.sourceIds)])].filter(id=>sourceById.has(id));
      const sectionIds=[...new Set(matching.map(row=>row.section))];
      const sourceLocators={};for(const row of matching)for(const [id,locators]of Object.entries(row.sourceLocators))sourceLocators[id]=[...new Set([...(sourceLocators[id]||[]),...locators])];
      const feature={type:'Feature',geometry:place.geometry,properties:{id,title:`${name} · study locality`,name,subject:name,category:'study-locality',snapshots:[event.date],startDate:event.date,endDate:event.date,articleSlug:article.slug,articleSections:sectionIds,sourceIds,sourceLocators,
        locationType:'Settlement reference; not an event site or unit position',evidenceStatus:'Locality mentioned in the associated study; geography reused from the cited gazetteer',
        accuracy:'Broad settlement location for orientation',uncertainty:'The study includes other dates and wider context. This point does not assert an event, military presence, route or control on the selected day. It does not locate a particular building or site of violence.',
        note:`Read ${context.sections.filter(s=>sectionIds.includes(s.id)).map(s=>s.label).join('; ')}. `+matching[0].text,
        temporalScope:'Reading reference only; see the passage for its actual event date',reuseRights:'Original reading connection. Gazetteer geometry retains the rights recorded in its source entry.'}};
      dateLocalities.push(feature);localityFeatures.push(feature);
    }
    const sections=context.sections.map(section=>{
      const passages=context.paragraphs.filter(row=>row.section===section.id);
      const linked=dateLocalities.filter(f=>f.properties.articleSections.includes(section.id)).map(f=>f.properties.id);
      const result={date:event.date,articleSlug:article.slug,sectionId:section.id,title:section.label,passages:passages.length,localityIds:linked,sourceIds:[...new Set(passages.flatMap(row=>row.sourceIds))],disposition:linked.length?'Named-locality reading connection; no same-day event inferred':'Explanatory context retained; no geographic feature forced'};
      sectionRegister.push(result);return result;
    });
    const sourceIds=[...new Set([...event.sourceIds,...Object.values(active).flatMap(fs=>fs.flatMap(f=>f.properties.sourceIds||[])),...dateLocalities.flatMap(f=>f.properties.sourceIds)])];
    coverage.push({date:event.date,collectionIndex,collection:collectionIndex?`Barbarossa Phase ${collectionIndex}`:'The Partition of Poland',articleSlug:article.slug,studyTitle:article.title,regions:article.location||event.defaultView||'Theatre',defaultView:event.defaultView||'theatre',existingLayers:Object.fromEntries(Object.entries(active).map(([k,v])=>[k,v.length])),additions:{studyLocalities:dateLocalities.length,studySections:sections.length,studyPassages:context.paragraphs.length,dateExplanation:true},sourceIds,sourceChecks:{inspected:sourceIds.filter(id=>checkedSources.get(id)?.startsWith('inspected')),inaccessible:sourceIds.filter(id=>checkedSources.get(id)==='inaccessible'),notFreshlyInspected:sourceIds.filter(id=>!checkedSources.has(id)).length,qualification:'Shared citations and named-subject links are not independent corroboration. See source-checks.json for exact inspected passages and conflicts.'},limitations:notes[event.date][2],verification:'Data and links assessed; historical source inspection is partial',articleBodySha256:crypto.createHash('sha256').update(article.body).digest('hex')});
  }
}
for(const article of articles.filter(a=>a.isCollectionIntroduction)){const context=studyContextFor(article);for(const section of context.sections){const passages=context.paragraphs.filter(p=>p.section===section.id);sectionRegister.push({date:null,articleSlug:article.slug,sectionId:section.id,title:section.label,passages:passages.length,localityIds:[],sourceIds:[...new Set(passages.flatMap(p=>p.sourceIds))],disposition:'Collection introduction assessed as explanatory context; the dated maps retain their own validity'});}}
write('public/data/history/study-localities.geojson',{type:'FeatureCollection',features:localityFeatures});
write('public/data/history/map-coverage.json',coverage);
write('public/data/history/study-section-register.json',sectionRegister);
fs.mkdirSync('docs',{recursive:true});
fs.writeFileSync('docs/map-coverage.csv','date,collection,study,regions,existing_layers,additions,source_checks,limitations,verification\n'+coverage.map(row=>[row.date,row.collection,row.articleSlug,row.regions,JSON.stringify(row.existingLayers),JSON.stringify(row.additions),JSON.stringify(row.sourceChecks),row.limitations,row.verification].map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\n')+'\n');
// Retain legacy URLs for saved links, while regenerating their contents from the same live articles.
for(const [phase,name]of [[4,'phase-iv'],[5,'phase-v']]){
  const legacy=Object.fromEntries(coverage.filter(r=>r.collectionIndex===phase).map(row=>{const ctx=studyContextFor(articles.find(a=>a.slug===row.articleSlug));return [row.date,{...ctx,destinations:[],paragraphs:ctx.paragraphs.map(p=>({...p,featureIds:[],reason:p.temporalScope}))}];}));
  write(`public/data/history/${name}-study-context.json`,legacy);
}
console.log(`Coverage: ${coverage.length} dated maps, ${sectionRegister.length} sections, ${localityFeatures.length} locality references. Article prose is read directly at runtime.`);
