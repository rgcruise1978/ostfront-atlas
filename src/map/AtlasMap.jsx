import React,{useEffect,useRef,useState} from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import capitals from '../data/capitals.json';
import {capitalStatus} from '../data/capitalStatus.js';
import {makeMapStyle} from './mapStyle.js';
import {historicalLayerGroups} from './cartography.js';
import {emptyCollection,territorialState,datedFeatures} from './temporalGeography.js';
maplibregl.setWorkerUrl(workerUrl);
const ids=v=>Array.isArray(v)?v:typeof v==='string'?JSON.parse(v):[];
function addPatterns(map) {
 for(const name of ['occupation-hatch','claim-hatch','soviet-hatch','civil-dots','contested-cross']) {
  if(map.hasImage(name))continue;
  const pixels=new Uint8Array(12*12*4);
  for(let y=0;y<12;y++)for(let x=0;x<12;x++) {
   const mark=name==='civil-dots'?(x===3&&y===3):name==='contested-cross'?((x+y)%12===0||(x-y+12)%12===0):(x+y)%12<2;
   if(mark){const i=(y*12+x)*4; pixels[i]=name==='soviet-hatch'?105:45;pixels[i+1]=name==='soviet-hatch'?30:48;pixels[i+2]=name==='soviet-hatch'?35:52;pixels[i+3]=130;}
  }
  map.addImage(name,{width:12,height:12,data:pixels});
 }
}
const anchors={'German Reich':[9,51.2],'Soviet Union':[36,53.4],'Poland':[22,52.7],'Slovak Republic':[19.2,48.75],'Protectorate of Bohemia and Moravia':[15.0,49.5],'France':[2.1,46.5],'United Kingdom':[-3,55.4],'Norway':[9,62.3],'Sweden':[15.8,62.7],'Finland':[25.5,64],'Italy':[12.8,42.8],'Romania':[25.2,45.5],'Hungary':[19.7,47.1]};
export default function AtlasMap({campaign,viewRequest,date,operationRegion='theatre',showCapitals,showPlaces,showRivers,showBoundary,showNeighbors,showControl,showMovements,showChanges,showRelief,onFeatureSelect,onViewChange}) {
 const node=useRef(null),mapRef=useRef(null),current=useRef({date,onFeatureSelect,onViewChange,viewRequest});current.current={date,onFeatureSelect,onViewChange,viewRequest};
 const [data,setData]=useState(null),[error,setError]=useState('');
 useEffect(()=>{
  const abort=new AbortController();setData(null);
  const load=url=>fetch(url,{signal:abort.signal}).then(r=>{if(!r.ok)throw new Error(url);return r.json();});
  Promise.all(['/data/history/europe-geometries.geojson','/data/history/military-control.geojson','/data/history/military-operations.geojson','/data/history/territorial-changes.geojson',campaign.map.historicalUrl].map(load))
   .then(([geometries,control,operations,changes,history])=>setData({geometries,control,operations,changes,history})).catch(e=>{if(e.name!=='AbortError')setError('The dated geographic data could not be loaded.');});
  return()=>abort.abort();
 },[campaign]);
 useEffect(()=>{
  if(!node.current)return;
  const map=new maplibregl.Map({container:node.current,style:makeMapStyle(),center:campaign.map.center,zoom:4.7,minZoom:2.4,maxZoom:10,maxBounds:[[-25,33],[55,72]],attributionControl:false});mapRef.current=map;
  map.on('styleimagemissing',()=>addPatterns(map));
  map.addControl(new maplibregl.NavigationControl(),'top-right');map.addControl(new maplibregl.ScaleControl({maxWidth:120,unit:'metric'}),'bottom-left');map.addControl(new maplibregl.AttributionControl({compact:true}),'bottom-right');
  const observer=new ResizeObserver(()=>map.resize());observer.observe(node.current);
  map.on('load',()=>{addPatterns(map);const view=current.current.viewRequest;view?.coordinates?map.jumpTo({center:view.coordinates,zoom:view.zoom || 6.4}):map.fitBounds(view?.bounds || campaign.map.bounds,{padding:28,duration:0});});
  map.on('moveend',()=>{const center=map.getCenter();current.current.onViewChange?.({coordinates:[Number(center.lng.toFixed(5)),Number(center.lat.toFixed(5))],zoom:Number(map.getZoom().toFixed(3))});});
  const clickLayers=['capital-stars','capital-labels','engagement-dot','engagement-label','army-group-label','army-axis-label','advance-axis-line','advance-axis-head','places-dot','places-local-dot','history-point','history-line','boundary-line','control-fill','neighbors-fill'];
  map.on('click',event=>{
   const features=map.queryRenderedFeatures(event.point,{layers:clickLayers.filter(id=>map.getLayer(id))});
   const chosen=clickLayers.map(id=>features.find(f=>f.layer.id===id)).find(Boolean);if(!chosen)return;
   const p=chosen.properties,d=current.current.date;
   if(chosen.layer.source==='capitals') {const c=capitals.find(c=>c.id===p.id);if(c)current.current.onFeatureSelect({kind:'capital',title:`${c.name} · ${c.capitalOf}`,note:capitalStatus(c,d),sourceIds:c.sourceIds,coordinates:c.coordinates,accuracy:c.accuracy});return;}
   current.current.onFeatureSelect({...p,kind:p.category||'territory',title:p.title||p.displayName||p.name,note:p.note,selectedDate:d,referenceDate:p.selectedDate && p.selectedDate!==d ? p.selectedDate : undefined,sourceIds:ids(p.sourceIds||(p.sourceId?[p.sourceId]:[])),coordinates:chosen.geometry.type==='Point'?chosen.geometry.coordinates:null});
  });
  map.on('mousemove',event=>{map.getCanvas().style.cursor=map.queryRenderedFeatures(event.point,{layers:clickLayers.filter(id=>map.getLayer(id))}).length?'pointer':'';});

  map.on('error',event=>{if(event.error)setError('A map layer could not be loaded. Please reload the page.');});
  return()=>{observer.disconnect();map.remove();mapRef.current=null;};
 },[campaign]);
 useEffect(()=>{
  const map=mapRef.current;if(!map)return;
  const update=()=>{
   if(data){
    const referenceDate=campaign.map.territorialReferenceDate || date;
    const states=territorialState(referenceDate,data.geometries);map.getSource('neighbors').setData(states);
    map.getSource('areaLabels').setData({...emptyCollection,features:states.features.filter(f=>!['Algeria','Morocco','Tunisia','Gibraltar','Guernsey','Jersey','Isle of Man','Faroe Islands','Peripheral geography · status outside verified coverage'].includes(f.properties.name)).map(f=>({type:'Feature',properties:{...f.properties,label:({'Polish areas claimed for German incorporation':'German incorporation claims','Polish areas under German incorporation claim':'German incorporation claims','Former eastern Poland under Soviet incorporation claim':'Soviet incorporation claim','Eastern Poland under Soviet occupation':'Eastern Poland\nSoviet occupation','Soviet Union · occupied Polish treaty sector':'Soviet occupation\nTreaty sector','Germany · occupied Polish treaty sector':'German occupation\nTreaty sector'}[f.properties.name] || f.properties.name).replace(': German incorporation claim','').replace(' under German occupation','\nGerman occupation').replace(' under Soviet occupation','\nSoviet occupation'),primary:['German Reich','Soviet Union','Slovak Republic','Poland'].includes(f.properties.name),minor:f.properties.visualCategory==='unresolved'||['Andorra','Monaco','San Marino','Vatican City','Liechtenstein','Malta','Cyprus','Luxembourg','Free City of Danzig','Danzig: German incorporation claim'].includes(f.properties.name)},geometry:{type:'Point',coordinates:anchors[f.properties.name] || f.properties.labelCoordinates || [0,0]}})).filter(f=>f.geometry.coordinates[0]!==0)});
    map.getSource('control').setData(datedFeatures(data.control,date));
    map.getSource('operations').setData(datedFeatures(data.operations,date,operationRegion));
    map.getSource('history').setData(datedFeatures(data.history,referenceDate));
    map.getSource('changes').setData({...emptyCollection,features:data.changes.features.filter(f=>f.properties.snapshotDate===date)});
   }
   map.setFilter('capital-stars',['all',['<=',['get','startDate'],date],['>=',['get','endDate'],date]]);map.setFilter('capital-labels',['all',['<=',['get','startDate'],date],['>=',['get','endDate'],date]]);
   for(const [group,visible] of [['capitals',showCapitals],['places',showPlaces],['rivers',showRivers],['boundary',showBoundary],['neighbors',showNeighbors],['control',showControl],['movements',showMovements],['changes',showChanges],['relief',showRelief]])for(const id of historicalLayerGroups[group])if(map.getLayer(id))map.setLayoutProperty(id,'visibility',visible?'visible':'none');
  };
  if(map.getSource('neighbors'))update();else map.once('load',update);
  return()=>map.off('load',update);
 },[data,date,campaign,operationRegion,showCapitals,showPlaces,showRivers,showBoundary,showNeighbors,showControl,showMovements,showChanges,showRelief]);
 useEffect(()=>{
  const map=mapRef.current;if(!map||!viewRequest)return;
  const move=()=>viewRequest.coordinates?map.flyTo({center:viewRequest.coordinates,zoom:viewRequest.zoom || 6.4,duration:0}):map.fitBounds(viewRequest.bounds||campaign.map.bounds,{padding:28,duration:0});
  if(map.getLayer('water'))move();else map.once('load',move);return()=>map.off('load',move);
 },[viewRequest,campaign]);
 return <div className="map-frame"><div ref={node} className="atlas-map" role="application" aria-label={`Interactive ${campaign.title} map; use region controls or zoom and pan`} />{error&&<p className="map-error" role="alert">{error}</p>}</div>;
}
