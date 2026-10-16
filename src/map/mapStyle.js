import capitals from '../data/capitals.json';
import { actorColors, coalitionColors, movementKinds, territorialCategories } from './cartography.js';
const empty={type:'FeatureCollection',features:[]};
const fonts=['Arial','Helvetica','sans-serif'];
const matchColors=(field,colors,fallback)=>['match',['get',field],...Object.entries(colors).flat(),fallback];
const actorColor=matchColors('actor',actorColors,'#5E5340');
const point=(id,source,field,size,minzoom=0,filter)=>({id,type:'symbol',source,minzoom,...(filter?{filter}:{}),layout:{'text-field':field,'text-font':fonts,'text-size':size,'text-max-width':13,'text-allow-overlap':false,'text-padding':3},paint:{'text-color':'#22353F','text-halo-color':'#FFF9E9','text-halo-width':1.7}});
export function makeMapStyle(){
 const style={version:8,name:'Ostfront Atlas · dated Europe',sources:{
  land:{type:'geojson',data:'/data/geography/europe-land.geojson',attribution:'Historical outlines © University of Minnesota · CC BY 3.0 US'},
  relief:{type:'image',url:'/data/geography/europe-relief.jpg',coordinates:[[-25,73],[60,73],[60,32],[-25,32]]},
  neighbors:{type:'geojson',data:empty,attribution:'Historical geometry: <a href="/sources#europe-vector-1939">Goran tek-en, Alphathon, maix and contributors · adapted CC BY-SA 4.0</a>'},
  easternReference:{type:'geojson',data:empty},
  areaLabels:{type:'geojson',data:empty},countryCallouts:{type:'geojson',data:empty},focusPlaces:{type:'geojson',data:empty},places:{type:'geojson',data:'/data/geography/europe-places.geojson',attribution:'Natural Earth · public domain'},
  rivers:{type:'geojson',data:'/data/geography/europe-rivers.geojson'},
  riverDetails:{type:'geojson',data:'/data/geography/additional-natural-rivers.geojson',attribution:'Additional river courses © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors · ODbL</a>'},
  lakes:{type:'geojson',data:'/data/geography/europe-lakes.geojson'},
  boundary:{type:'geojson',data:'/data/history/poland-1939-reference.geojson'},
  history:{type:'geojson',data:empty},control:{type:'geojson',data:empty},operations:{type:'geojson',data:empty},changes:{type:'geojson',data:empty},
  formations:{type:'geojson',data:empty},fronts:{type:'geojson',data:empty},logistics:{type:'geojson',data:empty},referenceBorders:{type:'geojson',data:empty},
  capitals:{type:'geojson',data:{type:'FeatureCollection',features:capitals.map(c=>({type:'Feature',properties:c,geometry:{type:'Point',coordinates:c.coordinates}}))}}
 },layers:[
  {id:'water',type:'background',paint:{'background-color':'#BFD5DF'}},
  {id:'land',type:'fill',source:'land',paint:{'fill-color':'#ECE3CF'}},
  {id:'eastern-reference-fill',type:'fill',source:'easternReference',paint:{'fill-color':'#E6D1CD','fill-opacity':.75}},
  {id:'eastern-reference-hatch',type:'fill',source:'easternReference',paint:{'fill-pattern':'reference-hatch','fill-opacity':.36}},
  {id:'neighbors-fill',type:'fill',source:'neighbors',paint:{'fill-color':['get','color'],'fill-opacity':['case',['boolean',['get','referenceOnly'],false],.4,.87]}},
  {id:'relief',type:'raster',source:'relief',paint:{'raster-opacity':.1,'raster-saturation':-1,'raster-contrast':.15}},
  {id:'neighbors-pattern',type:'fill',source:'neighbors',filter:['!=',['get','pattern'],''],paint:{'fill-pattern':['get','pattern'],'fill-opacity':.32}},
  {id:'control-fill',type:'fill',source:'control',paint:{'fill-color':matchColors('visualCategory',Object.fromEntries(Object.entries(territorialCategories).map(([key,value])=>[key,value.color])),territorialCategories.operational.color),'fill-opacity':.86}},
  {id:'control-pattern',type:'fill',source:'control',paint:{'fill-pattern':['coalesce',['get','pattern'],'occupation-hatch'],'fill-opacity':.34}},
  {id:'lakes-fill',type:'fill',source:'lakes',paint:{'fill-color':'#BFD5DF','fill-outline-color':'#7196A8'}},
  {id:'rivers-line',type:'line',source:'rivers',paint:{'line-color':'#326F90','line-width':['interpolate',['linear'],['zoom'],3,.65,5,1.25,8,2.5],'line-opacity':.85}},
  {id:'river-detail-line',type:'line',source:'riverDetails',minzoom:5,paint:{'line-color':'#326F90','line-width':['interpolate',['linear'],['zoom'],5,1.2,8,2.4]}},
  {id:'neighbors-border-halo',type:'line',source:'neighbors',filter:['!=',['coalesce',['get','operationalContext'],false],true],paint:{'line-color':'#FFF9E9','line-width':['interpolate',['linear'],['zoom'],3,3.3,7,4.7],'line-opacity':.9}},
  {id:'neighbors-line',type:'line',source:'neighbors',filter:['!=',['coalesce',['get','operationalContext'],false],true],paint:{'line-color':'#333D42','line-width':['interpolate',['linear'],['zoom'],3,1.2,7,2]}},
  {id:'alignment-line',type:'line',source:'neighbors',filter:['all',['!=',['coalesce',['get','operationalContext'],false],true],['!=',['coalesce',['get','referenceOnly'],false],true]],paint:{'line-color':matchColors('alignmentKey',coalitionColors,'#8B8170'),'line-width':2.3,'line-opacity':.8}},
  {id:'reference-border-line',type:'line',source:'referenceBorders',paint:{'line-color':'#5C4D37','line-width':1.25,'line-dasharray':[6,4],'line-opacity':.7}},
  {id:'boundary-line',type:'line',source:'boundary',paint:{'line-color':'#70532F','line-width':2.1,'line-dasharray':[5,3]}},
  {id:'history-line',type:'line',source:'history',filter:['==',['geometry-type'],'LineString'],paint:{'line-color':'#222B33','line-width':2.7,'line-dasharray':[8,2,1,2]}},
  {id:'history-point',type:'circle',source:'history',filter:['==',['geometry-type'],'Point'],paint:{'circle-radius':5,'circle-color':'#765B3A','circle-stroke-color':'#FFF8E7','circle-stroke-width':1.5}},
  {id:'control-line',type:'line',source:'control',paint:{'line-color':['case',['==',['get','visualCategory'],'contested'],'#74566B','#485763'],'line-width':1,'line-dasharray':[2,3],'line-opacity':.6}},
  {id:'front-halo',type:'line',source:'fronts',paint:{'line-color':'#FFF8E9','line-width':5,'line-opacity':.85}},
  {id:'front-line',type:'line',source:'fronts',paint:{'line-color':'#4A3A43','line-width':2.5,'line-dasharray':[5,2]}},
  {id:'logistics-route',type:'line',source:'logistics',filter:['==',['geometry-type'],'LineString'],paint:{'line-color':['match',['get','category'],'sea-route','#2B648B','planned-sea-route','#7098AD','road-corridor','#8A6738','#665475'],'line-width':2,'line-dasharray':[7,2],'line-opacity':.8}},
  {id:'logistics-point',type:'circle',source:'logistics',filter:['==',['geometry-type'],'Point'],paint:{'circle-radius':5,'circle-color':'#665475','circle-stroke-color':'#FFF8E7','circle-stroke-width':1.8}},
  {id:'changes-outline',type:'line',source:'changes',paint:{'line-color':['case',['==',['get','changeKind'],'loss'],'#287C99','#C29117'],'line-width':4,'line-dasharray':[2,2]}},
  {id:'places-dot',type:'circle',source:'places',filter:['<=',['get','priority'],2],minzoom:4,paint:{'circle-color':'#223844','circle-radius':2.7,'circle-stroke-color':'#FFF9EC','circle-stroke-width':1}},
  {id:'places-local-dot',type:'circle',source:'places',filter:['==',['get','priority'],3],minzoom:5.8,paint:{'circle-color':'#223844','circle-radius':2,'circle-stroke-color':'#FFF9EC','circle-stroke-width':.8}},
  {...point('places-major-label','places',['get','periodName'],11,4,['==',['get','priority'],1]),layout:{...point('x','places','',11).layout,'text-field':['get','periodName'],'text-anchor':'top','text-offset':[0,.5],'text-variable-anchor':['top','bottom','left','right']}},
  {...point('places-minor-label','places',['get','periodName'],10,5,['==',['get','priority'],2]),layout:{...point('x','places','',10).layout,'text-field':['get','periodName'],'text-anchor':'top','text-offset':[0,.5]}},
  {...point('places-local-label','places',['get','periodName'],10,5.8,['==',['get','priority'],3]),layout:{...point('x','places','',10).layout,'text-field':['get','periodName'],'text-anchor':'top','text-offset':[0,.4]}},
  {id:'rivers-label',type:'symbol',source:'rivers',minzoom:4.8,layout:{'symbol-placement':'line','symbol-spacing':400,'text-field':['get','name'],'text-font':fonts,'text-size':10,'text-max-angle':35},paint:{'text-color':'#205F80','text-halo-color':'#FFF9EC','text-halo-width':1.5}},
  {id:'river-detail-label',type:'symbol',source:'riverDetails',minzoom:5.3,layout:{'symbol-placement':'line','symbol-spacing':350,'text-field':['get','name'],'text-font':fonts,'text-size':11},paint:{'text-color':'#205F80','text-halo-color':'#FFF9EC','text-halo-width':1.5}},
  point('lakes-label','lakes',['get','name'],10,5,['!=',['get','name'],'Natural lake']),
  {id:'country-callout-lines',type:'line',source:'countryCallouts',maxzoom:5.2,filter:['==',['geometry-type'],'LineString'],paint:{'line-color':'#4F5E64','line-width':.8,'line-opacity':.8}},
  {...point('country-callout-labels','countryCallouts',['get','label'],9,2.3,['==',['geometry-type'],'Point']),maxzoom:5.2,layout:{...point('x','countryCallouts','',9).layout,'text-field':['get','label'],'text-size':9,'text-allow-overlap':true,'text-ignore-placement':true}},
  {id:'neighbor-country-labels',type:'symbol',source:'areaLabels',filter:['==',['get','minor'],false],layout:{'text-field':['get','label'],'text-font':fonts,'text-size':['interpolate',['linear'],['zoom'],2.4,10,4,13,6,['case',['==',['get','phaseId'],'4'],14,18]],'text-max-width':7,'text-letter-spacing':.065,'text-allow-overlap':true,'text-ignore-placement':false,'text-padding':5},paint:{'text-color':['case',['boolean',['get','referenceOnly'],false],'#705E63','#26323A'],'text-halo-color':'#FFF9E9','text-halo-width':2,'text-opacity':['case',['boolean',['get','referenceOnly'],false],.82,.98]}},
  point('neighbor-primary-labels','areaLabels','',1,24),
  {...point('neighbor-minor-labels','areaLabels',['get','label'],10,5.2,['==',['get','minor'],true]),layout:{...point('x','areaLabels','',10).layout,'text-field':['get','label'],'text-size':10,'text-variable-anchor':['top','bottom','left','right'],'text-radial-offset':.7}},
  {...point('country-subtitle','areaLabels',['get','subtitle'],10,5.2),layout:{...point('x','areaLabels','',10).layout,'text-field':['get','subtitle'],'text-anchor':'top','text-offset':[0,1.8],'text-max-width':18}},
  {id:'engagement-dot',type:'circle',source:'operations',filter:['all',['==',['get','category'],'engagement'],['==',['geometry-type'],'Point']],paint:{'circle-radius':5,'circle-color':actorColor,'circle-stroke-color':'#FFF8E7','circle-stroke-width':2}},
  point('engagement-label','operations',['get','label'],11,5,['==',['get','category'],'engagement']),
  {id:'checked-symbol',type:'circle',source:'operations',filter:['all',['==',['geometry-type'],'Point'],['==',['get','eventKind'],'checked']],paint:{'circle-radius':8,'circle-color':'#B56D2E','circle-stroke-color':'#FFF9E9','circle-stroke-width':2.5}},
  {id:'civilian-route',type:'line',source:'operations',filter:['all',['==',['geometry-type'],'LineString'],['any',['==',['get','category'],'civilian'],['==',['get','domain'],'civilian']]],paint:{'line-color':'#704775','line-width':3,'line-dasharray':[2,3]}},
  {id:'civilian-point',type:'circle',source:'operations',minzoom:5,filter:['all',['==',['geometry-type'],'Point'],['==',['get','category'],'civilian']],paint:{'circle-radius':7,'circle-color':'#FFF9E9','circle-stroke-color':'#704775','circle-stroke-width':3}},
  {...point('civilian-label','operations',['get','label'],11,6,['all',['==',['geometry-type'],'Point'],['==',['get','category'],'civilian']]),layout:{...point('x','operations','',11).layout,'text-field':['get','label'],'text-variable-anchor':['top','bottom','left','right'],'text-radial-offset':1.2,'text-max-width':14,'symbol-sort-key':['case',['==',['get','eventKind'],'massacre'],0,1]},paint:{'text-color':'#704775','text-halo-color':'#FFF9E9','text-halo-width':1.8}},
  {...point('formation-symbol','formations',['get','symbol'],16,4.3),paint:{'text-color':actorColor,'text-halo-color':'#FFF9EC','text-halo-width':2}},
  {...point('formation-label','formations',['get','displayLabel'],11,3.2,['in',['get','echelon'],['literal',['army-group','front']]]),layout:{...point('x','formations','',11).layout,'text-field':['get','displayLabel'],'text-size':11,'text-max-width':16,'text-anchor':'top','text-offset':[0,.55],'text-allow-overlap':true},paint:{'text-color':actorColor,'text-halo-color':'#FFF9EC','text-halo-width':1.8}},
  {...point('formation-detail-label','formations',['get','displayLabel'],10,5.4,['!', ['in',['get','echelon'],['literal',['army-group','front']]]]),layout:{...point('x','formations','',10).layout,'text-field':['get','displayLabel'],'text-size':10,'text-max-width':16,'text-anchor':'top','text-offset':[0,.5]},paint:{'text-color':actorColor,'text-halo-color':'#FFF9EC','text-halo-width':1.6}},
  point('army-axis-label','operations','',1,24),point('army-group-label','operations','',1,24),
  {...point('logistics-label','logistics',['get','label'],10,5.7,['==',['geometry-type'],'Point']),paint:{'text-color':'#574267','text-halo-color':'#FFF9EC','text-halo-width':1.6}},
  {id:'capital-stars',type:'symbol',source:'capitals',layout:{'text-field':['case',['==',['get','kind'],'administrative'],'◆','★'],'text-font':fonts,'text-size':16,'text-allow-overlap':true,'text-ignore-placement':true},paint:{'text-color':'#173746','text-halo-color':'#FFF9EC','text-halo-width':1.8}},
  {...point('capital-labels','capitals',['get','name'],12,2.8),layout:{...point('x','capitals','',12).layout,'text-field':['get','name'],'text-anchor':'top','text-offset':[0,.7],'text-variable-anchor':['top','bottom','left','right'],'text-radial-offset':.8}}
 ]};

 // Critical Phase IV junctions receive label placement priority over formations.
 const focusIndex=style.layers.findIndex(l=>l.id==='places-dot');
 style.layers.splice(focusIndex,0,{id:'phase-four-focus-dot',type:'circle',source:'focusPlaces',minzoom:3.8,paint:{'circle-color':'#223844','circle-radius':3.2,'circle-stroke-color':'#FFF9EC','circle-stroke-width':1.3}}, {id:'phase-four-focus-label',type:'symbol',source:'focusPlaces',minzoom:3.8,layout:{'text-field':['get','periodName'],'text-font':fonts,'text-size':13,'text-variable-anchor':['top','bottom','left','right'],'text-radial-offset':.75,'text-padding':4,'text-max-width':13},paint:{'text-color':'#173746','text-halo-color':'#FFF9EC','text-halo-width':2}});
 // Each movement type has its own stroke; actor identity stays consistent.
 const insert=style.layers.findIndex(l=>l.id==='places-dot');
 const lines=Object.entries(movementKinds).flatMap(([kind,value])=>[
  {id:'movement-'+kind+'-halo',type:'line',source:'operations',filter:['all',['==',['geometry-type'],'LineString'],['==',['get','movementType'],kind],['!=',['coalesce',['get','domain'],''],'civilian']],paint:{'line-color':'#FFF7E4','line-width':['interpolate',['linear'],['zoom'],3,3.8,7,7],'line-opacity':.75}},
  {id:'movement-'+kind,type:'line',source:'operations',filter:['all',['==',['geometry-type'],'LineString'],['==',['get','movementType'],kind],['!=',['coalesce',['get','domain'],''],'civilian']],layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':actorColor,'line-width':['interpolate',['linear'],['zoom'],3,2.2,7,4.5],...(kind==='advance'?{}:{'line-dasharray':value.dash}),'line-opacity':kind==='planned'?.65:.95}},
  {id:'movement-'+kind+'-heads',type:'symbol',source:'operations',filter:['all',['==',['geometry-type'],'Point'],['==',['get','category'],'arrowhead'],['==',['get','movementType'],kind],['!=',['coalesce',['get','domain'],''],'civilian']],layout:{'text-field':['case',['==',['get','domain'],'naval'],'⇢',kind==='retreat'?'▷':kind==='planned'?'›':'▶'],'text-font':fonts,'text-size':kind==='planned'?24:17,'text-rotate':['get','bearing'],'text-rotation-alignment':'map','text-allow-overlap':true,'text-ignore-placement':true},paint:{'text-color':actorColor,'text-halo-color':'#FFF7E4','text-halo-width':1.2}}
 ]);
 style.layers.splice(insert,0,...lines);
 // Phase IV corridor labels follow the shared movement colours and collision rules.
 for(const id of ['formation-symbol','formation-label','formation-detail-label']) {const layer=style.layers.find(l=>l.id===id);const old=layer.filter;layer.filter=['all',...(old?[old]:[]),['!=',['coalesce',['get','phaseId'],''],'4']];}
 style.layers.push({id:'phase-four-formation-symbol',type:'symbol',source:'formations',minzoom:4.4,filter:['==',['get','phaseId'],'4'],layout:{'text-field':['get','symbol'],'text-font':fonts,'text-size':['case',['in',['get','echelon'],['literal',['army-group','front']]],15,13],'text-padding':4,'symbol-sort-key':['get','labelPriority']},paint:{'text-color':actorColor,'text-halo-color':'#FFF9E9','text-halo-width':2}});
 style.layers.push({id:'phase-four-command-label',type:'symbol',source:'formations',minzoom:3.4,filter:['all',['==',['get','phaseId'],'4'],['in',['get','echelon'],['literal',['army-group','front']]]],layout:{'text-field':['get','displayLabel'],'text-font':fonts,'text-size':12,'text-max-width':15,'text-variable-anchor':['top','bottom','left','right'],'text-radial-offset':.8,'text-padding':7,'symbol-sort-key':['get','labelPriority']},paint:{'text-color':actorColor,'text-halo-color':'#FFF9E9','text-halo-width':2}});
 style.layers.push({id:'phase-four-unit-label',type:'symbol',source:'formations',minzoom:4.8,filter:['all',['==',['get','phaseId'],'4'],['!', ['in',['get','echelon'],['literal',['army-group','front']]]]],layout:{'text-field':['get','displayLabel'],'text-font':fonts,'text-size':12,'text-max-width':15,'text-variable-anchor':['top','bottom','left','right'],'text-radial-offset':.8,'text-padding':5,'symbol-sort-key':['get','labelPriority']},paint:{'text-color':actorColor,'text-halo-color':'#FFF9E9','text-halo-width':1.8}});
 style.layers.push({id:'phase-four-movement-label',type:'symbol',source:'operations',minzoom:4.8,filter:['all',['==',['get','phaseId'],'4'],['==',['geometry-type'],'LineString'],['!=',['get','domain'],'civilian']],layout:{'symbol-placement':'line','symbol-spacing':420,'text-field':['coalesce',['get','shortLabel'],['get','label']],'text-font':fonts,'text-size':12,'text-max-angle':35,'text-padding':6},paint:{'text-color':actorColor,'text-halo-color':'#FFF9E9','text-halo-width':2}});
 style.layers.push({id:'phase-four-transport-label',type:'symbol',source:'logistics',minzoom:6.2,filter:['all',['==',['get','phaseId'],'4'],['==',['geometry-type'],'LineString']],layout:{'symbol-placement':'line','symbol-spacing':500,'text-field':['get','label'],'text-font':fonts,'text-size':12,'text-max-angle':30,'text-padding':6},paint:{'text-color':'#574267','text-halo-color':'#FFF9E9','text-halo-width':2}});
 // Symbol collision placement starts at the top of the style. Keep essential
 // locality names above military labels so Vyazma and Tikhvin remain visible.
 for(const id of ['phase-four-focus-dot','phase-four-focus-label']) {
  const index=style.layers.findIndex(layer=>layer.id===id);
  style.layers.push(...style.layers.splice(index,1));
 }
 // Readable labels retain placement/collision rules and an opaque light halo.
 for (const layer of style.layers) {
  const size=layer.layout?.['text-size'];
  if(typeof size==='number') layer.layout['text-size']=Math.max(12,size);
  else if(Array.isArray(size)&&size[0]==='interpolate') { const next=[...size];for(let i=4;i<next.length;i+=2)if(typeof next[i]==='number')next[i]=Math.max(12,next[i]);layer.layout['text-size']=next; }
 }
 return style;
}
