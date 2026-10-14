import capitals from '../data/capitals.json';
import { controlColors } from './cartography.js';
const empty={type:'FeatureCollection',features:[]};
const fonts=['Arial','Helvetica','sans-serif'];
const actorColor=['match',['get','actor'],'Germany','#343C44','Soviet Union','#81282D','Slovakia','#4C633D','Romania','#716038','Finland','#42664E','Hungary','#605D33','Poland','#5C4B30','#645B46'];
const pointLabel=(id,source,field,size,minzoom=0,filter)=>({id,type:'symbol',source,minzoom,...(filter?{filter}:{}),layout:{'text-field':field,'text-font':fonts,'text-size':size,'text-max-width':12,'text-allow-overlap':false},paint:{'text-color':'#263841','text-halo-color':'#FAF7EC','text-halo-width':1.8}});
export function makeMapStyle() {
 return {version:8,name:'Ostfront Atlas · shared historical Europe',sources:{
  land:{type:'geojson',data:'/data/geography/europe-land.geojson',attribution:'Historical outlines © University of Minnesota · CC BY 3.0 US'},
  relief:{type:'image',url:'/data/geography/europe-relief.jpg',coordinates:[[-25,73],[60,73],[60,32],[-25,32]]},
  neighbors:{type:'geojson',data:empty,attribution:'Historical reconstructions: <a href="/sources#europe-vector-1939">Goran tek-en, Alphathon, maix and contributors · adaptations CC BY-SA 4.0</a>'},
  areaLabels:{type:'geojson',data:empty},
  places:{type:'geojson',data:'/data/geography/europe-places.geojson',attribution:'<a href="https://www.naturalearthdata.com/about/terms-of-use/">Natural Earth · public domain</a>'},
  rivers:{type:'geojson',data:'/data/geography/europe-rivers.geojson'},
  lakes:{type:'geojson',data:'/data/geography/europe-lakes.geojson'},
  boundary:{type:'geojson',data:'/data/history/poland-1939-reference.geojson'},
  history:{type:'geojson',data:empty},control:{type:'geojson',data:empty},operations:{type:'geojson',data:empty},changes:{type:'geojson',data:empty},
  capitals:{type:'geojson',data:{type:'FeatureCollection',features:capitals.map(c=>({type:'Feature',properties:c,geometry:{type:'Point',coordinates:c.coordinates}}))}}
 },layers:[
  {id:'water',type:'background',paint:{'background-color':'#BFD4DD'}},
  {id:'land',type:'fill',source:'land',paint:{'fill-color':'#EAE2CE'}},
  {id:'relief',type:'raster',source:'relief',paint:{'raster-opacity':0.24,'raster-saturation':-1,'raster-contrast':0.25}},
  {id:'neighbors-fill',type:'fill',source:'neighbors',paint:{'fill-color':['get','color'],'fill-opacity':0.82}},
  {id:'neighbors-pattern',type:'fill',source:'neighbors',filter:['!=',['get','pattern'],''],paint:{'fill-pattern':['get','pattern'],'fill-opacity':0.48}},
  {id:'neighbors-border-halo',filter:['!=',['get','visualCategory'],'unresolved'],type:'line',source:'neighbors',paint:{'line-color':'#F8F4E8','line-width':['interpolate',['linear'],['zoom'],3,2.2,7,3.6],'line-opacity':0.9}},
  {id:'neighbors-line',filter:['!=',['get','visualCategory'],'unresolved'],type:'line',source:'neighbors',paint:{'line-color':'#4A4C49','line-width':['interpolate',['linear'],['zoom'],3,0.85,7,1.5]}},
  {id:'control-fill',type:'fill',source:'control',paint:{'fill-color':['match',['get','visualCategory'],'contested','#BAA1AD','soviet-occupation','#CA8583','#BFC3C8'],'fill-opacity':0.88}},
  {id:'control-pattern',type:'fill',source:'control',paint:{'fill-pattern':['coalesce',['get','pattern'],'occupation-hatch'],'fill-opacity':0.65}},
  {id:'control-line',type:'line',source:'control',paint:{'line-color':['case',['==',['get','visualCategory'],'contested'],'#77586B','#343C44'],'line-width':1.7,'line-dasharray':[3,2]}},
  {id:'lakes-fill',type:'fill',source:'lakes',paint:{'fill-color':'#BFD4DD','fill-outline-color':'#7B9DAE'}},
  {id:'rivers-line',type:'line',source:'rivers',paint:{'line-color':'#407995','line-width':['interpolate',['linear'],['zoom'],3,0.6,5,1.1,8,2.2],'line-opacity':0.88}},
  {id:'boundary-line',type:'line',source:'boundary',paint:{'line-color':'#795A35','line-width':2,'line-dasharray':[5,3]}},
  {id:'history-line',type:'line',source:'history',filter:['==',['geometry-type'],'LineString'],paint:{'line-color':'#252C31','line-width':2.7,'line-dasharray':[2,2]}},
  {id:'history-point',type:'circle',source:'history',filter:['==',['geometry-type'],'Point'],paint:{'circle-radius':5,'circle-color':'#7B5A3A','circle-stroke-color':'#FFF8E7','circle-stroke-width':1.5}},
  {id:'advance-axis-line',type:'line',source:'operations',filter:['==',['geometry-type'],'LineString'],paint:{'line-color':actorColor,'line-width':['interpolate',['linear'],['zoom'],3,2,7,4.1],'line-opacity':0.95,'line-dasharray':[4,1.5]}},
  {id:'advance-axis-head',type:'symbol',source:'operations',filter:['==',['geometry-type'],'LineString'],layout:{'symbol-placement':'line-center','text-field':'➤','text-font':fonts,'text-size':22,'text-rotation-alignment':'map','text-keep-upright':false,'text-allow-overlap':true},paint:{'text-color':actorColor,'text-halo-color':'#FFF7E6','text-halo-width':1.4}},
  {id:'engagement-dot',type:'circle',source:'operations',filter:['==',['get','category'],'engagement'],paint:{'circle-radius':5,'circle-color':actorColor,'circle-stroke-color':'#FFF7E6','circle-stroke-width':2}},
  {id:'changes-outline',type:'line',source:'changes',paint:{'line-color':'#EBC259','line-width':4,'line-dasharray':[2,2]}},
  {id:'places-dot',type:'circle',source:'places',filter:['<=',['get','priority'],2],minzoom:4,paint:{'circle-color':'#293E49','circle-radius':2.8,'circle-stroke-color':'#FAF6E9','circle-stroke-width':1}},
  {id:'places-local-dot',type:'circle',source:'places',filter:['==',['get','priority'],3],minzoom:6.2,paint:{'circle-color':'#293E49','circle-radius':2,'circle-stroke-color':'#FAF6E9','circle-stroke-width':0.8}},
  {...pointLabel('places-major-label','places',['get','displayName'],11,4,['==',['get','priority'],1]),layout:{...pointLabel('x','places','',11).layout,'text-field':['get','displayName'],'text-anchor':'top','text-offset':[0,0.55]}},
  {...pointLabel('places-minor-label','places',['get','displayName'],10,5.3,['==',['get','priority'],2]),layout:{...pointLabel('x','places','',10).layout,'text-field':['get','displayName'],'text-anchor':'top','text-offset':[0,0.55]}},
  {...pointLabel('places-local-label','places',['get','displayName'],10,6.2,['==',['get','priority'],3]),layout:{...pointLabel('x','places','',10).layout,'text-field':['get','displayName'],'text-anchor':'top','text-offset':[0,0.55]}},
  {id:'rivers-label',type:'symbol',source:'rivers',minzoom:4.6,layout:{'symbol-placement':'line','symbol-spacing':450,'text-field':['get','name'],'text-font':fonts,'text-size':10,'text-max-angle':30},paint:{'text-color':'#2E6685','text-halo-color':'#F7F4E9','text-halo-width':1.5}},
  pointLabel('lakes-label','lakes',['get','name'],10,5),
  pointLabel('army-axis-label','operations',['get','label'],11,5.5,['==',['get','category'],'army_label']),
  pointLabel('army-group-label','operations',['get','label'],12,3,['==',['get','category'],'army_group']),
  pointLabel('engagement-label','operations',['get','label'],11,5,['==',['get','category'],'engagement']),
  {...pointLabel('neighbor-country-labels','areaLabels',['get','label'],['interpolate',['linear'],['zoom'],3,12,6,16],0,['all',['==',['get','minor'],false],['==',['get','primary'],false]]),layout:{...pointLabel('x','areaLabels','',12).layout,'text-field':['get','label'],'text-size':['interpolate',['linear'],['zoom'],3,12,6,16],'text-allow-overlap':false,'text-letter-spacing':0.06}},
  {...pointLabel('neighbor-primary-labels','areaLabels',['get','label'],['interpolate',['linear'],['zoom'],3,13,6,17],0,['==',['get','primary'],true]),layout:{...pointLabel('x','areaLabels','',13).layout,'text-field':['get','label'],'text-size':['interpolate',['linear'],['zoom'],3,13,6,17],'text-allow-overlap':true,'text-letter-spacing':0.06}},
  pointLabel('neighbor-minor-labels','areaLabels',['get','label'],11,5.6,['==',['get','minor'],true]),
  {id:'capital-stars',type:'symbol',source:'capitals',layout:{'text-field':['case',['==',['get','kind'],'administrative'],'◆','★'],'text-font':fonts,'text-size':18,'text-allow-overlap':true},paint:{'text-color':'#20343F','text-halo-color':'#FFF9EA','text-halo-width':1.8}},
  {...pointLabel('capital-labels','capitals',['get','name'],12,3),layout:{...pointLabel('x','capitals','',12).layout,'text-field':['get','name'],'text-anchor':'top','text-offset':[0,0.8]}}
 ]};
}
