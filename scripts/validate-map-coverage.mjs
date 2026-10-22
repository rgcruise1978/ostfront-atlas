import assert from 'node:assert/strict';
import fs from 'node:fs';
import cp from 'node:child_process';
import {studyContextFor} from '../src/map/studyConnections.js';
import {pngWithEvidence} from '../src/map/evidenceExport.js';
const baseline=process.env.OSTKRIEG_BASE_REF||'05784f04b2c2776b5def2c3e112f0731bf35c447';
const read=f=>JSON.parse(fs.readFileSync(f,'utf8'));
const coverage=read('public/data/history/map-coverage.json'),sections=read('public/data/history/study-section-register.json'),localities=read('public/data/history/study-localities.geojson'),civilian=read('public/data/history/additional-civilian-context.geojson');
const sources=new Set(read('src/data/sources.json').map(s=>s.id));
const notes=read('src/data/snapshot-notes.json');
assert.equal(coverage.length,49);assert.deepEqual(coverage.map(r=>r.collectionIndex).reduce((a,n)=>(a[n]=(a[n]||0)+1,a),{}),{0:5,1:8,2:9,3:9,4:10,5:8});
const articleFiles=fs.readdirSync('src/content/articles').filter(f=>f.endsWith('.json'));assert.equal(articleFiles.length,50);
let passages=0;
for(const file of articleFiles){const path='src/content/articles/'+file;assert.equal(fs.readFileSync(path,'utf8'),cp.execFileSync('git',['show',baseline+':'+path],{encoding:'utf8'}),'Study changed: '+file);const a=read(path),context=studyContextFor(a);for(const s of a.sections||[])assert(context.sections.some(c=>c.id===s.id),'Missing section '+a.slug+'/'+s.id);for(const row of context.paragraphs){for(const id of row.sourceIds)assert(sources.has(id),'Missing paragraph source '+id);}passages+=context.paragraphs.length;}
const ids=new Set();for(const f of [...localities.features,...civilian.features]){const p=f.properties;assert(!ids.has(p.id));ids.add(p.id);assert(p.sourceIds.length>0&&p.uncertainty&&p.locationType&&p.articleSlug&&p.articleSections.length);for(const id of p.sourceIds)assert(sources.has(id),'Unknown source '+id);assert.equal(f.geometry.type,'Point');assert(f.geometry.coordinates.length===2&&f.geometry.coordinates.every(Number.isFinite));const a=read('src/content/articles/'+p.articleSlug+'.json');for(const id of p.articleSections)assert(id==='article-top'||a.sections.some(s=>s.id===id),'Bad section '+id);assert(p.snapshots.length===1&&p.startDate===p.snapshots[0]&&p.endDate===p.snapshots[0]);}
for(const row of coverage){assert(notes[row.date]?.length===3);assert(row.additions.studyLocalities>0);assert.equal(localities.features.filter(f=>f.properties.snapshots.includes(row.date)).length,row.additions.studyLocalities);assert(sections.some(s=>s.date===row.date));}
for(const file of ['formation-positions','historical-logistics','military-control','dated-fronts','europe-geometries','reference-borders']){const path=`public/data/history/${file}.geojson`;assert.equal(cp.execFileSync('git',['hash-object',path],{encoding:'utf8'}).trim(),cp.execFileSync('git',['rev-parse',baseline+':'+path],{encoding:'utf8'}).trim(),'Protected geography changed: '+file);}
const operations=read('public/data/history/military-operations.geojson').features;for(const f of operations.filter(f=>f.properties.id.startsWith('p3-')&&f.properties.id.includes('hiiumaa-bridgehead'))){assert.equal(f.properties.actor,'Soviet Union');assert(f.properties.note.includes('conflicting'));}
// PNG chunk bytes must retain full Unicode evidence, without changing image data.
const minimal=new Uint8Array([137,80,78,71,13,10,26,10,0,0,0,0,73,69,78,68,174,66,96,130]);const output=new Uint8Array(await (await pngWithEvidence(new Blob([minimal]),{date:'1941-11-28',uncertainty:'◇ approximate; not secure control'})).arrayBuffer());assert(new TextDecoder().decode(output).includes('approximate; not secure control'));assert.deepEqual(output.slice(-12),minimal.slice(-12));
console.log(`PASS: 49 map dates, ${sections.length} section assessments, ${passages} current passages, ${localities.features.length} locality references, ${civilian.features.length} new civilian records; all 50 article files and protected geometry unchanged.`);
