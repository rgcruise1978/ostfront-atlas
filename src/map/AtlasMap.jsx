import {pngWithEvidence} from './evidenceExport.js';
import React,{useEffect,useRef,useState,useImperativeHandle,forwardRef} from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import capitals from '../data/capitals.json';
import {capitalStatus} from '../data/capitalStatus.js';
import {makeMapStyle} from './mapStyle.js';
import {historicalLayerGroups,movementKinds,controlColors,territorialCategories} from './cartography.js';
import {emptyCollection,territorialState,easternPoliticalReference,datedFeatures} from './temporalGeography.js';
import snapshots from '../data/map-snapshot-index.json';
maplibregl.setWorkerUrl(workerUrl);
const ids=v=>Array.isArray(v)?v:typeof v==='string'?JSON.parse(v):[];
function addPatterns(map){
 for(const name of ['occupation-hatch','claim-hatch','soviet-hatch','civil-dots','contested-cross','reference-hatch']){
  if(map.hasImage(name))continue;
  const pixels=new Uint8Array(16*16*4);
  for(let y=0;y<16;y++)for(let x=0;x<16;x++){
   const mark=name==='civil-dots'?(x===4&&y===4):name==='contested-cross'?((x+y)%16===0||(x-y+16)%16===0):(x+y)%16===0;
   if(mark){const i=(y*16+x)*4;pixels[i]=name==='reference-hatch'?129:name==='soviet-hatch'?105:45;pixels[i+1]=name==='reference-hatch'?72:name==='soviet-hatch'?30:48;pixels[i+2]=name==='reference-hatch'?77:name==='soviet-hatch'?35:52;pixels[i+3]=110;}
  }
  map.addImage(name,{width:16,height:16,data:pixels});
 }
}
const majorNames=new Set(['GERMAN REICH','SOVIET UNION','POLAND','FRANCE','UNITED KINGDOM','ITALY','SPAIN','PORTUGAL','NORWAY','SWEDEN','FINLAND','ROMANIA','HUNGARY','BULGARIA','GREECE','YUGOSLAVIA','TURKEY','LITHUANIA','LATVIA','ESTONIA','BELGIUM','NETHERLANDS','DENMARK','SWITZERLAND','SLOVAKIA','IRELAND','CROATIA','BOHEMIA & MORAVIA','ALBANIA','ICELAND','ALGERIA','MOROCCO','TUNISIA']);
const aliases={Vyborg:'Viipuri / Vyborg',Minsk:'Minsk',Kyiv:'Kiev',Dnipro:'Dnepropetrovsk',Dnipropetrovsk:'Dnepropetrovsk',Khmelnytskyy:'Proskurov',Khmelnytskyi:'Proskurov',Ternopil:'Tarnopol',Lviv:'Lwów',Gdansk:'Danzig','Gdańsk':'Danzig',Kaliningrad:'Königsberg','Saint Petersburg':'Leningrad','St. Petersburg':'Leningrad',Gomel:'Gomel',Homyel:'Gomel',Brest:'Brest-Litovsk',Volgograd:'Stalingrad','Nizhny Novgorod':'Gorky',Samara:'Kuibyshev','Cluj-Napoca':'Cluj'};
const degrees=r=>r*180/Math.PI;
function withArrowheads(collection){
 const heads=[];
 for(const f of collection.features){
  if(f.geometry.type!=='LineString'||f.properties.category==='civilian'||f.properties.domain==='civilian')continue;const coords=f.geometry.coordinates;if(coords.length<2)continue;
  const b=coords.at(-1);let a=coords.at(-2);if(Math.hypot(b[0]-a[0],b[1]-a[1])<.001)continue;
  const dx=(b[0]-a[0])*Math.cos(b[1]*Math.PI/180),dy=b[1]-a[1];
  // The triangle points east at zero degrees; MapLibre rotates clockwise.
  heads.push({...f,geometry:{type:'Point',coordinates:b},properties:{...f.properties,id:f.properties.id+'-head',category:'arrowhead',bearing:degrees(Math.atan2(-dy,dx))}});
 }
 return {type:'FeatureCollection',features:[...collection.features,...heads]};
}
function labelsFor(states,map,formations=[]){
 const b=map.getBounds(),c=map.getCenter(),w=b.getWest(),e=b.getEast(),s=b.getSouth(),n=b.getNorth();
 const groups=new Map();
 for(const f of states.features){
  const p=f.properties;if(p.visualCategory==='unresolved')continue;
  const name=p.countryName||p.name;const candidates=(p.labelAnchors||[p.labelCoordinates]).filter(x=>x&&x[0]>w&&x[0]<e&&x[1]>s&&x[1]<n);
  if(!candidates.length)continue;
  const preferred=p.labelCoordinates;
  const datedCapitals=capitals.filter(x=>x.startDate<=f.properties.selectedDate&&f.properties.selectedDate<=x.endDate);
  const spaced=candidates.filter(x=>{const q=map.project(x);return datedCapitals.every(k=>{const a=map.project(k.coordinates);return Math.hypot(q.x-a.x,q.y-a.y)>48;})&&formations.filter(k=>['army-group','front'].includes(k.properties.echelon)).every(k=>{const a=map.project(k.geometry.coordinates);return Math.abs(q.x-a.x)>95||Math.abs(q.y-a.y)>42;});});
  const choices=spaced.length?spaced:candidates;
  const coordinate=choices.find(x=>preferred&&x[0]===preferred[0]&&x[1]===preferred[1])||choices.reduce((a,x)=>Math.abs(x[0]-c.lng)+Math.abs(x[1]-c.lat)*1.4<Math.abs(a[0]-c.lng)+Math.abs(a[1]-c.lat)*1.4?x:a);
  const group=groups.get(name);if(group)group.candidates.push({p,coordinate});else groups.set(name,{candidates:[{p,coordinate}]});
 }
 return {type:'FeatureCollection',features:[...groups].map(([name,value])=>{
  const target=({'POLAND':[20,52],'FRANCE':[2,47]})[name]||[c.lng,c.lat];
  const maxPriority=Math.max(...value.candidates.map(x=>x.p.labelPriority??1));
  const item=value.candidates.filter(x=>(x.p.labelPriority??1)===maxPriority).reduce((a,x)=>Math.abs(x.coordinate[0]-target[0])+Math.abs(x.coordinate[1]-target[1])<Math.abs(a.coordinate[0]-target[0])+Math.abs(a.coordinate[1]-target[1])?x:a);
  return {type:'Feature',geometry:{type:'Point',coordinates:item.coordinate},properties:{...item.p,label:name,minor:!majorNames.has(name),subtitle:item.p.subtitle||''}};
 })};
}
function countryCallouts(states){
 const targets={'LUXEMBOURG':[3.3,49.25],'LIECHTENSTEIN':[11.9,47.6],'MONACO':[5.1,42.7],'SAN MARINO':[15.7,43.2],'VATICAN CITY':[10.5,40.7],'ANDORRA':[-.2,42.0],'DANZIG':[16.4,55.2]};
 return {type:'FeatureCollection',features:states.features.filter(f=>targets[f.properties.countryName]).flatMap(f=>{
  const p=f.properties,xy=p.labelCoordinates,to=targets[p.countryName];return [{type:'Feature',geometry:{type:'LineString',coordinates:[xy,to]},properties:{...p,label:p.countryName}},{type:'Feature',geometry:{type:'Point',coordinates:to},properties:{...p,label:p.countryName}}];
 })};
}
function wrap(ctx,text,x,y,width,lineHeight,maxLines=3){
 let line='',count=0;for(const word of text.split(/\s+/)){
  const next=line?line+' '+word:word;if(ctx.measureText(next).width>width&&line){ctx.fillText(line,x,y);y+=lineHeight;count++;line=word;if(count>=maxLines-1)break;}else line=next;
 }if(line)ctx.fillText(line,x,y);return y+lineHeight;
}
const AtlasMap=forwardRef(function AtlasMap({campaign,viewRequest,date,operationRegion='theatre',layers,onFeatureSelect,onViewChange,onInventory},ref){
 const node=useRef(null),mapRef=useRef(null),current=useRef({});
 current.current={date,onFeatureSelect,onViewChange,onInventory,viewRequest,layers};
 const [data,setData]=useState(null),[error,setError]=useState(''),[loaded,setLoaded]=useState(false),[renderedDate,setRenderedDate]=useState('');
 const statesRef=useRef(emptyCollection),formationsRef=useRef([]);
 useImperativeHandle(ref,()=>({
  async exportMap({title,label,preset,evidence}){
   const map=mapRef.current;if(!map||!loaded)throw Error('The map is still loading.');
   const previous={center:map.getCenter(),zoom:map.getZoom(),bearing:map.getBearing(),pitch:map.getPitch()},container=node.current,oldW=container.style.width,oldH=container.style.height;
   let blob;
   const textSizes=map.getStyle().layers.filter(l=>l.type==='symbol'&&l.layout?.['text-size']).map(l=>[l.id,l.layout['text-size']]);
   try{
   for(const [id,size] of textSizes){let enlarged=size;if(typeof size==='number')enlarged=size*1.65;else if(Array.isArray(size)&&size[0]==='interpolate'){enlarged=[...size];for(let i=4;i<enlarged.length;i+=2)if(typeof enlarged[i]==='number')enlarged[i]*=1.65;}map.setLayoutProperty(id,'text-size',enlarged);}
   const bounds=map.getBounds();
   const rendered=new Promise((resolve,reject)=>{const finish=()=>{clearTimeout(timer);resolve();};const timer=setTimeout(()=>{map.off('idle',finish);map.loaded()?resolve():reject(Error('The map did not finish rendering for export. Please try again.'));},12000);map.once('idle',finish);});
   container.style.width='2560px';container.style.height='1110px';map.resize();map.fitBounds(bounds,{padding:45,duration:0});map.triggerRepaint();
   await rendered;
   const canvas=document.createElement('canvas');canvas.width=2560;canvas.height=1440;const ctx=canvas.getContext('2d');
   ctx.fillStyle='#F0E3C4';ctx.fillRect(0,0,2560,1440);ctx.fillStyle='#201F1A';ctx.font='bold 44px Georgia';ctx.fillText(title,64,68);ctx.font='25px Arial';ctx.fillText(label+'  ·  '+preset+'  ·  Ostkrieg',64,110);
   const referenceOnly=snapshots[date]?.timeConvention?.startsWith('Geographic reference');
   ctx.font='17px Arial';ctx.fillText(referenceOnly?'Geographic reference only · dated military reconstruction pending':'Dated regional synthesis · component reporting times and feature precision are recorded in the atlas',64,135);
   ctx.drawImage(map.getCanvas(),0,140,2560,1110);
   ctx.fillStyle='#201F1A';ctx.font='bold 18px Arial';ctx.fillText('N ↑',2490,185);
   const metresPerPixel=Math.cos(map.getCenter().lat*Math.PI/180)*2*Math.PI*6378137/(512*2**map.getZoom());const km=[10,20,50,100,200,500,1000].find(x=>x*1000/metresPerPixel>=100)||1000;const px=km*1000/metresPerPixel;
   ctx.fillStyle='#FFF9E9';ctx.fillRect(48,1170,Math.max(px+32,315),62);ctx.strokeStyle='#263331';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(64,1205);ctx.lineTo(64+px,1205);ctx.stroke();ctx.font='18px Arial';ctx.fillStyle='#201F1A';ctx.fillText(km+' km · scale near map centre',64,1190);
   const keys=current.current.layers.control?(referenceOnly?[['#E6D1CD','21 June political reference · dated control pending']]:[[controlColors.Germany,'German authority'],[controlColors['Soviet Union'],'Soviet authority'],[territorialCategories.operational.color,'Hatched: forward reach / occupation'],[territorialCategories.contested.color,'Contested / continued resistance']]):[];
   if(current.current.layers.control&&!referenceOnly&&date>='1941-08-29')keys.push([territorialCategories['finnish-operational'].color,'Finnish forward reach']);
   if(current.current.layers.control&&!referenceOnly&&date>='1941-09-30')keys.push([territorialCategories['romanian-military'].color,'Romanian administration']);
   keys.forEach(([color,text],i)=>{ctx.fillStyle=color;ctx.fillRect(64+i*(2440/keys.length),1280,24,20);ctx.fillStyle='#201F1A';ctx.font=(keys.length>5?'15px':'19px')+' Arial';ctx.fillText(text,100+i*(2440/keys.length),1297);});
   ctx.font='15px Arial';const legend=[];if(!referenceOnly&&current.current.layers.movements)legend.push('Solid: advance · long dash: counterattack · short dash: withdrawal · compound: transfer · dotted: plan · broken: breakout · orange marker: checked · ⇢ naval');if(current.current.layers.studyPlaces)legend.push('◇ Study locality: reading reference, not a same-day event');if(current.current.layers.civilian)legend.push('Violet ring / dashed route: civilian and occupation context');if(current.current.layers.changes)legend.push('Yellow: new reported reach · blue: withdrawn / revised reach');if(!referenceOnly&&current.current.layers.formations)legend.push('XXXXX: group/front; XXXX: army; XXX: corps; XX: division; ⚓ fleet');if(current.current.layers.capitals)legend.push('★ capital; ◆ administrative seat');if(!referenceOnly&&current.current.layers.alignment)legend.push('Outlines: ochre Axis; blue Allied; green co-belligerent');if(current.current.layers.logistics)legend.push('Purple: rail/road corridor; blue: sea link');wrap(ctx,legend.join('  ·  '),64,1332,2420,24,2);
   ctx.font='16px Arial';wrap(ctx,(referenceOnly?'Faded political reference: 21 June 1941, not control on the selected date. Phase V military reconstruction pending. ':(date>='1941-11-15'?'Regional reconstruction; approximate reach is not secure control. Military: Ziemke & Bauer, Moscow to Stalingrad (1987), maps 3–5; dated study references. ':'Approximate forward reach is distinct from secure control. Full source records and feature limitations are embedded in this PNG; Save evidence provides readable JSON. '))+'Geography: University of Minnesota CC BY 3.0; adapted historical geometry CC BY-SA 4.0; Natural Earth public domain; additional waterways © OpenStreetMap contributors ODbL · openstreetmap.org/copyright.',64,1373,2420,22,2);
   blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw Error('The browser returned an empty image.');
   }finally{
   for(const [id,size] of textSizes)map.setLayoutProperty(id,'text-size',size);
   container.style.width=oldW;container.style.height=oldH;map.resize();map.jumpTo(previous);
   }
   if(evidence)blob=await pngWithEvidence(blob,evidence);
   const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`ost-krieg-${date}-${preset.toLowerCase().replace(/[^a-z]+/g,'-')}.png`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return a.download;
  }
 }),[loaded,date]);
 useEffect(()=>{
  const controller=new AbortController();const urls=['/data/history/europe-geometries.geojson','/data/history/military-control.geojson','/data/history/military-operations.geojson','/data/history/territorial-changes.geojson',campaign.map.historicalUrl,'/data/history/formation-positions.geojson','/data/history/dated-fronts.geojson','/data/history/historical-logistics.geojson','/data/history/reference-borders.geojson','/data/geography/europe-places.geojson','/data/geography/phase-iv-places.geojson','/data/geography/phase-iv-focus-places.geojson','/data/geography/additional-natural-rivers.geojson','/data/geography/phase-iv-natural-rivers.geojson','/data/geography/phase-v-places.geojson','/data/geography/phase-v-focus-places.geojson','/data/geography/phase-v-waterways.geojson','/data/history/study-localities.geojson','/data/history/additional-civilian-context.geojson'];
  Promise.all(urls.map(url=>fetch(url,{signal:controller.signal}).then(r=>{if(!r.ok)throw Error(url);return r.json();}))).then(([geometries,control,operations,changes,history,formations,fronts,logistics,referenceBorders,places,phaseFourPlaces,focusPlaces,riverDetails,phaseFourRivers,phaseFivePlaces,phaseFiveFocus,phaseFiveWater,studyPlaces,civilianContext])=>setData({geometries,control,operations,changes,history,formations,fronts,logistics,referenceBorders,places,phaseFourPlaces,focusPlaces,riverDetails,phaseFourRivers,phaseFivePlaces,phaseFiveFocus,phaseFiveWater,studyPlaces,civilianContext})).catch(e=>{if(e.name!=='AbortError')setError('A historical map layer could not be loaded. Please reload.');});return()=>controller.abort();
 },[campaign.id]);
 useEffect(()=>{
  const map=new maplibregl.Map({container:node.current,style:makeMapStyle(),center:campaign.map.center,zoom:4.4,minZoom:2.3,maxZoom:10,maxBounds:[[-25,32],[60,73]],canvasContextAttributes:{preserveDrawingBuffer:true,antialias:true},attributionControl:false});mapRef.current=map;if(import.meta.env.DEV)node.current.__atlasMap=map;
  map.on('styleimagemissing',()=>addPatterns(map));
  map.addControl(new maplibregl.NavigationControl(),'top-right');map.addControl(new maplibregl.FullscreenControl(),'top-right');map.addControl(new maplibregl.ScaleControl({maxWidth:130,unit:'metric'}),'bottom-left');map.addControl(new maplibregl.AttributionControl({compact:true}),'bottom-right');
  const observer=new ResizeObserver(()=>map.resize());observer.observe(node.current);
  map.on('load',()=>{addPatterns(map);const v=current.current.viewRequest;v?.coordinates?map.jumpTo({center:v.coordinates,zoom:v.zoom||6.2}):map.fitBounds(v?.bounds||campaign.map.bounds,{padding:35,duration:0});setLoaded(true);});
  const updateLabels=()=>{if(map.getSource('areaLabels'))map.getSource('areaLabels').setData(labelsFor(statesRef.current,map,formationsRef.current));};
  map.on('moveend',()=>{updateLabels();const c=map.getCenter();current.current.onViewChange?.({coordinates:[+c.lng.toFixed(5),+c.lat.toFixed(5)],zoom:+map.getZoom().toFixed(3)});});
  const clickLayers=['study-locality-label','study-locality-point','places-major-label','places-minor-label','places-local-label','phase-four-focus-label','river-detail-label','river-detail-line','phase-four-command-label','phase-four-unit-label','phase-four-formation-symbol','phase-four-movement-label','phase-four-transport-label','formation-label','formation-detail-label','formation-symbol','capital-stars','capital-labels','checked-symbol','civilian-point','civilian-route','engagement-dot','engagement-label','logistics-point','logistics-route','front-line','history-line','boundary-line','control-fill','neighbor-country-labels','neighbors-fill','eastern-reference-fill',...Object.keys(movementKinds).map(k=>'movement-'+k)];
  map.on('click',event=>{
   const features=map.queryRenderedFeatures(event.point,{layers:clickLayers.filter(id=>map.getLayer(id))}),chosen=clickLayers.map(id=>features.find(f=>f.layer.id===id)).find(Boolean);if(!chosen)return;
   const p=chosen.properties,d=current.current.date;
   if(chosen.layer.source==='capitals'){const c=capitals.find(c=>c.id===p.id);if(c)current.current.onFeatureSelect({kind:'capital',title:c.name+' · '+c.capitalOf,note:capitalStatus(c,d),sourceIds:c.sourceIds,coordinates:c.coordinates,accuracy:c.accuracy});return;}
   current.current.onFeatureSelect({...p,kind:p.category||'territory',title:p.title||p.displayName||p.name,note:p.note,selectedDate:d,sourceIds:ids(p.sourceIds||(p.sourceId?[p.sourceId]:[])),coordinates:chosen.geometry.type==='Point'?chosen.geometry.coordinates:null});
  });
  map.on('mousemove',e=>{map.getCanvas().style.cursor=map.queryRenderedFeatures(e.point,{layers:clickLayers.filter(id=>map.getLayer(id))}).length?'pointer':'';});
  map.on('error',event=>{if(event.error){console.error(event.error);setError('A map layer could not be rendered. Please reload.');}});
  return()=>{observer.disconnect();map.remove();mapRef.current=null;setLoaded(false);};
 },[campaign.id]);
 useEffect(()=>{
  const map=mapRef.current;if(!data||!loaded||!map)return;
  setRenderedDate('');
  const politicalReferenceDate=campaign.timeline.find(event=>event.date===date)?.politicalReferenceDate;
  const activeOps=politicalReferenceDate?emptyCollection:datedFeatures({...data.operations,features:[...data.operations.features,...data.civilianContext.features]},date),activeFormations=politicalReferenceDate?emptyCollection:datedFeatures(data.formations,date);formationsRef.current=activeFormations.features;
  const territorial=territorialState(politicalReferenceDate||date,data.geometries);
  const states=politicalReferenceDate?{...territorial,features:territorial.features.map(feature=>({...feature,properties:{...feature.properties,referenceOnly:true,referencePeriod:'Political reference · 21 June 1941',selectedDate:date,title:feature.properties.title+' · 21 June reference',name:feature.properties.name+' · 21 June reference',subtitle:'21 June political reference',pattern:'reference-hatch',note:'Earlier political geography for orientation only. It does not assert military control on the selected date. '+feature.properties.note}}))}:territorial;
  const reference=politicalReferenceDate?emptyCollection:easternPoliticalReference(date,data.geometries);
  const labelStates={...states,features:[...states.features,...reference.features.filter(f=>['preinvasion-soviet-union','preinvasion-soviet-estonia'].includes(f.properties.id)&&!states.features.some(s=>s.properties.countryName===f.properties.countryName))]};
  statesRef.current=labelStates;
  for(const id of ['rivers-line','rivers-label'])map.setFilter(id,date>='1941-11-15'?['!=',['get','name'],'Don']:null);
  const focus={...data.focusPlaces,features:[...data.focusPlaces.features,...(date>='1941-11-15'?data.phaseFiveFocus.features:[])]};
  map.getSource('riverDetails').setData({...data.riverDetails,features:[...data.riverDetails.features,...(date>='1941-09-30'?data.phaseFourRivers.features:[]),...(date>='1941-11-15'?data.phaseFiveWater.features:[])]});
  map.getSource('focusPlaces').setData(date>='1941-09-30'?focus:emptyCollection);
  map.getSource('neighbors').setData(states);map.getSource('easternReference').setData(reference);map.getSource('areaLabels').setData(labelsFor(labelStates,map,formationsRef.current));map.getSource('countryCallouts').setData(countryCallouts(states));
  activeFormations.features=activeFormations.features.map(f=>({...f,properties:{...f.properties,symbol:['army-group','front'].includes(f.properties.echelon)?'XXXXX':f.properties.echelon==='division'?'XX':f.properties.echelon==='corps'?'XXX':f.properties.echelon==='fleet'?'⚓':f.properties.echelon==='battalion'?'II':f.properties.echelon==='brigade'?'X':f.properties.echelon==='regiment'?'III':f.properties.echelon==='contingent'?'◇':'XXXX'}}));
  const collectionFeatures={studyPlaces:datedFeatures(data.studyPlaces,date),control:datedFeatures(data.control,date),operations:withArrowheads(activeOps),history:datedFeatures(data.history,date),changes:{...emptyCollection,features:data.changes.features.filter(f=>f.properties.snapshotDate===date)},formations:activeFormations,fronts:datedFeatures(data.fronts,date),logistics:datedFeatures(data.logistics,date),referenceBorders:datedFeatures(data.referenceBorders,date)};
  if(politicalReferenceDate){for(const name of ['control','operations','history','changes','formations','fronts','logistics'])collectionFeatures[name]=emptyCollection;collectionFeatures.referenceBorders=datedFeatures(data.referenceBorders,politicalReferenceDate);}
  for(const [name,fc] of Object.entries(collectionFeatures))map.getSource(name).setData(fc);
  const placeFeatures=[...data.places.features,...(date>='1941-09-30'?data.phaseFourPlaces.features:[]),...(date>='1941-11-15'?data.phaseFivePlaces.features:[])].filter(f=>!['Volgodonsk','Zheleznogorsk','Dubna'].includes(f.properties.name)).map(f=>date>='1941-11-15'&&f.properties.name==='Donetsk'&&f.geometry.coordinates[0]<39?{...f,properties:{...f.properties,name:'Stalino',modernName:'Donetsk'}}:f);
  map.getSource('places').setData({...data.places,features:placeFeatures.filter(f=>(date<'1941-09-30'||!focus.features.some(c=>Math.abs(c.geometry.coordinates[0]-f.geometry.coordinates[0])<.06&&Math.abs(c.geometry.coordinates[1]-f.geometry.coordinates[1])<.06))&&!capitals.some(c=>c.startDate<=date&&date<=c.endDate&&Math.abs(c.coordinates[0]-f.geometry.coordinates[0])<.08&&Math.abs(c.coordinates[1]-f.geometry.coordinates[1])<.08)).map(f=>({...f,properties:{...f.properties,periodName:f.properties.name==='Wilno'&&date.startsWith('1941')?'Vilnius':aliases[f.properties.name.replace(/\s+/g,' ')]||f.properties.name}}))});
  for(const id of ['capital-stars','capital-labels'])map.setFilter(id,['all',['<=',['get','startDate'],date],['>=',['get','endDate'],date]]);
  const inventory={date,studyPlaces:collectionFeatures.studyPlaces.features,countries:[...states.features,...reference.features],operations:activeOps.features,formations:activeFormations.features,logistics:collectionFeatures.logistics.features,places:placeFeatures};
  current.current.onInventory?.(inventory);
  const markRendered=()=>setRenderedDate(date);map.once('idle',markRendered);map.triggerRepaint();
  return()=>map.off('idle',markRendered);
 },[data,date,loaded]);
 useEffect(()=>{
  const map=mapRef.current;if(!loaded||!map)return;
  const groups={...historicalLayerGroups,studyPlaces:['study-locality-point','study-locality-label'],movements:Object.keys(movementKinds).flatMap(k=>['movement-'+k,'movement-'+k+'-halo','movement-'+k+'-heads']).concat(['engagement-dot','engagement-label','checked-symbol','phase-four-movement-label']),countries:['neighbor-country-labels','neighbor-primary-labels','neighbor-minor-labels','country-subtitle','country-callout-lines','country-callout-labels'],neighbors:['neighbors-border-halo','neighbors-line'],rivers:['rivers-line','rivers-label','lakes-label','river-detail-line','river-detail-label']};
  groups.places=[...groups.places,'phase-four-focus-label','phase-four-focus-dot'];groups.formations=[...groups.formations,'phase-four-formation-symbol','phase-four-command-label','phase-four-unit-label'];groups.logistics=[...groups.logistics,'phase-four-transport-label'];
  for(const [group,list] of Object.entries(groups))for(const id of list)if(map.getLayer(id))map.setLayoutProperty(id,'visibility',layers[group]===false?'none':'visible');
  if(map.getLayer('study-locality-label'))map.setLayoutProperty('study-locality-label','visibility',layers.studyPlaces&&layers.places===false?'visible':'none');
  if(map.getLayer('phase-four-movement-label'))map.setFilter('phase-four-movement-label',['all',['in',['get','phaseId'],['literal',['4','5']]],['==',['geometry-type'],'LineString'],['!=',['get','domain'],'civilian'],...(layers.plans===false?[['!=',['get','movementType'],'planned']]:[])]);
  for(const id of ['movement-planned','movement-planned-halo','movement-planned-heads'])if(map.getLayer(id))map.setLayoutProperty(id,'visibility',layers.movements===false||layers.plans===false?'none':'visible');
 },[loaded,layers]);
 useEffect(()=>{
  const map=mapRef.current;if(!loaded||!map||!viewRequest)return;
  viewRequest.coordinates?map.flyTo({center:viewRequest.coordinates,zoom:viewRequest.zoom||6.2,duration:0}):map.fitBounds(viewRequest.bounds||campaign.map.bounds,{padding:35,duration:0});
 },[loaded,viewRequest]);
 return <div className="map-frame" data-date={date} data-map-ready={loaded&&!!data&&renderedDate===date?'true':'false'}><div ref={node} className="atlas-map" role="application" aria-label={`Interactive ${campaign.title} map for ${date}; countries, formations and sources also available through search and the feature list`}/>{error&&<p className="map-error" role="alert">{error}</p>}</div>;
});
export default AtlasMap;
