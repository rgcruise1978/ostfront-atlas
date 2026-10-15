import states from '../data/territorial-states.json';
import snapshots from '../data/map-snapshot-index.json';
import { territoryColor, territorialCategories } from './cartography.js';

export const emptyCollection = {type:'FeatureCollection',features:[]};
export const onDate = (feature,date) => {
  const p=feature.properties || feature;
  return p.snapshots ? p.snapshots.includes(date) : (!p.startDate || p.startDate<=date) && (!p.endDate || date<=p.endDate);
};
function alignmentFor(record,date) {
 const actor=record.militaryControl;
 if(actor==='Soviet Union')return {key:date>='1941-06-22'?'allied':'independent',label:date>='1941-07-12'?'Anglo-Soviet allies':date>='1941-06-22'?'Fighting Germany; agreement with Britain follows on 12 July':'Separate power; pact with Germany is not a formal military alliance'};
 if(actor==='Finland')return {key:date>='1941-06-25'?'cobelligerent':date>='1941-06-21'?'independent':'neutral',label:date>='1941-06-25'?'German co-belligerent; not a Tripartite Pact member':date>='1941-06-21'?'Military cooperation; war with USSR follows':'Independent / neutral'};
 const period=record.alignmentByPeriod?.find(p=>p.startDate<=date&&date<=p.endDate);
 return period || {key:'independent',label:record.politicalAlignment};
}
export function territorialState(date,geometries) {
  const byId=new Map(geometries.features.map(f=>[f.properties.id,f.geometry]));
  return {type:'FeatureCollection',features:states.filter(r=>onDate(r,date)).map(r=>({type:'Feature',geometry:byId.get(r.geometryRef),properties:{...r,title:r.name,actor:r.militaryControl,alignmentKey:alignmentFor(r,date).key,alignmentLabel:alignmentFor(r,date).label,color:territoryColor(r),pattern:territorialCategories[r.visualCategory]?.pattern || '',selectedDate:date}})).filter(f=>f.geometry)};
}
const easternReferenceIds=['soviet-union','soviet-poland-1941','soviet-estonia','finnish-cessions'];
export function easternPoliticalReference(date,geometries) {
  if(date<'1941-08-26'||date>'1941-09-29')return emptyCollection;
  const byId=new Map(geometries.features.map(f=>[f.properties.id,f.geometry]));
  return {type:'FeatureCollection',features:easternReferenceIds.map(id=>states.find(record=>record.id===id)).filter(Boolean).map(record=>({
    type:'Feature',geometry:byId.get(record.geometryRef),properties:{
      id:`preinvasion-${record.id}`,name:`${record.name} · preinvasion reference`,countryName:['soviet-union','soviet-estonia'].includes(record.id)?record.countryName:`${record.countryName} · PREINVASION REFERENCE`,subtitle:'Preinvasion reference',
      title:`${record.name} · preinvasion political reference`,referenceOnly:true,referencePeriod:record.id==='soviet-union'?'1939 annual territorial outline':'Territorial situation before 22 June 1941',
      sourceIds:[...new Set([...record.sourceIds,'europe-vector-1939'])],accuracy:record.accuracy,uncertainty:record.uncertainty,
      note:'This faint hatched area identifies preinvasion political geography. It does not claim Soviet military control on the selected Phase III date.',
      color:'#E6D1CD',pattern:'reference-hatch',labelCoordinates:record.id==='soviet-union'?[38,54]:record.labelCoordinates,labelAnchors:record.id==='soviet-union'?[[38,54],...(record.labelAnchors||[])]:record.labelAnchors
    }
  })).filter(feature=>feature.geometry)};
}
export function datedFeatures(data,date,region='theatre') {
  return {...emptyCollection,features:data.features.filter(f=>onDate(f,date) && (region==='theatre' || !f.properties.region || f.properties.region===region || (region==='lepel' && f.properties.region==='center') || (region==='prut' && f.properties.region==='south')))};
}
export function relevantLegend(date) {
  return [...new Set([...states.filter(r=>onDate(r,date)).map(r=>r.visualCategory),...(snapshots[date]?.controlCategories||[])])].map(key=>({key,...territorialCategories[key]}));
}
