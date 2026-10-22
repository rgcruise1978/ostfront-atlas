import fs from 'node:fs';
import assert from 'node:assert/strict';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const sourceIds=new Set(read('src/data/sources.json').map(s=>s.id));
let featureCount=0,coordinateCount=0;
for(const directory of ['public/data/history','public/data/geography'])for(const name of fs.readdirSync(directory).filter(n=>n.endsWith('.geojson'))){
 const data=read(directory+'/'+name);assert.equal(data.type,'FeatureCollection');
 for(const f of data.features){featureCount++;const p=f.properties||{};
  const walk=coords=>{assert(Array.isArray(coords));if(typeof coords[0]==='number'){assert(coords.length>=2&&coords.every(Number.isFinite));assert(coords[0]>=-180&&coords[0]<=180&&coords[1]>=-90&&coords[1]<=90);coordinateCount++;}else for(const c of coords)walk(c);};
  walk(f.geometry.coordinates);for(const id of [...(p.sourceIds||[]),...(p.sourceId?[p.sourceId]:[])])assert(sourceIds.has(id),`${name}: unknown source ${id}`);
  if(p.snapshots&&p.startDate&&p.endDate)for(const date of p.snapshots)assert(p.startDate<=date&&date<=p.endDate,`${name}: ${p.id} outside validity`);
  if(f.geometry.type==='Polygon'||f.geometry.type==='MultiPolygon'){for(const polygon of f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates)for(const ring of polygon){assert(ring.length>=4);assert.deepEqual(ring[0],ring.at(-1),`${name}: unclosed polygon`);}}
 }
}
console.log(`PASS: ${featureCount} geographic records, ${coordinateCount} coordinate pairs, source references, polygon closure and snapshot validity. These structural checks do not prove historical accuracy.`);
