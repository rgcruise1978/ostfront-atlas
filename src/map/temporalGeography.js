import states from '../data/territorial-states.json';
import snapshots from '../data/map-snapshot-index.json';
import { territoryColor, territorialCategories } from './cartography.js';

export const emptyCollection = {type:'FeatureCollection',features:[]};
export const onDate = (feature,date) => {
  const p=feature.properties || feature;
  return p.snapshots ? p.snapshots.includes(date) : (!p.startDate || p.startDate<=date) && (!p.endDate || date<=p.endDate);
};
export function territorialState(date,geometries) {
  const byId=new Map(geometries.features.map(f=>[f.properties.id,f.geometry]));
  return {type:'FeatureCollection',features:states.filter(r=>onDate(r,date)).map(r=>({type:'Feature',geometry:byId.get(r.geometryRef),properties:{...r,title:r.name,actor:r.militaryControl,color:territoryColor(r),pattern:territorialCategories[r.visualCategory]?.pattern || '',selectedDate:date}})).filter(f=>f.geometry)};
}
export function datedFeatures(data,date,region='theatre') {
  return {...emptyCollection,features:data.features.filter(f=>onDate(f,date) && (region==='theatre' || !f.properties.region || f.properties.region===region || (region==='lepel' && f.properties.region==='center') || (region==='prut' && f.properties.region==='south')))};
}
export function relevantLegend(date) {
  return [...new Set([...states.filter(r=>onDate(r,date)).map(r=>r.visualCategory),...(snapshots[date]?.controlCategories||[])])].map(key=>({key,...territorialCategories[key]}));
}
