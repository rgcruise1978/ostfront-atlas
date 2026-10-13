import { geography } from '../data/geography.js';
import { controlColors } from './cartography.js';
import capitals from '../data/capitals.json';

export const mapStyle = {
  version: 8,
  name: 'Ostfront Atlas geographic reference',
  sources: {
    land: { type: 'geojson', data: geography.landUrl, attribution: '<a href="https://www.naturalearthdata.com/" target="_blank" rel="noopener noreferrer">Natural Earth</a>' },
    places: { type: 'geojson', data: geography.placesUrl, attribution: '<a href="https://www.naturalearthdata.com/" target="_blank" rel="noopener noreferrer">Natural Earth places</a>' },
    rivers: { type: 'geojson', data: geography.riversUrl, attribution: '<a href="https://www.naturalearthdata.com/" target="_blank" rel="noopener noreferrer">Natural Earth rivers</a>' },
    secondaryRivers: { type: 'geojson', data: geography.secondaryRiversUrl, attribution: '<a href="https://www.naturalearthdata.com/" target="_blank" rel="noopener noreferrer">Natural Earth rivers</a>' },
    surroundingRivers: { type: 'geojson', data: geography.surroundingRiversUrl, attribution: '<a href="https://www.naturalearthdata.com/" target="_blank" rel="noopener noreferrer">Natural Earth rivers</a>' },
    riverLabels: { type: 'geojson', data: geography.riverLabelsUrl },
    boundary: { type: 'geojson', data: geography.boundaryUrl, attribution: '<a href="https://doi.org/10.13020/146x-1412" target="_blank" rel="noopener noreferrer">University of Minnesota historical boundaries (CC BY 3.0 US)</a>' },
    neighbors: { type: 'geojson', data: geography.neighborsUrl, attribution: '<a href="https://doi.org/10.13020/146x-1412" target="_blank" rel="noopener noreferrer">University of Minnesota historical boundaries (CC BY 3.0 US)</a>' },
    areaLabels: { type: 'geojson', data: geography.areaLabelsUrl },
    history: { type: 'geojson', data: { type: 'FeatureCollection', features: [] } },
    control: { type: 'geojson', data: { type: 'FeatureCollection', features: [] } },
    operations: { type: 'geojson', data: { type: 'FeatureCollection', features: [] } }
  },
  layers: [
    { id: 'water', type: 'background', paint: { 'background-color': '#d9e4e5' } },
    { id: 'land', type: 'fill', source: 'land', paint: { 'fill-color': '#eee9da', 'fill-outline-color': '#a9b4ae' } },
    { id: 'neighbors-fill', type: 'fill', source: 'neighbors', paint: { 'fill-color': ['match', ['get', 'name'], 'Germany', '#d2d9d6', 'Soviet Union', '#dcd9cb', 'Hungary', '#e0d7cd', 'Lithuania', '#d9dfd2', 'Latvia', '#d4ded7', 'Romania', '#dfd5d4', 'Estonia', '#d2dedb', '#d9d5c9'], 'fill-opacity': 0.88 } },
    { id: 'neighbors-border-halo', type: 'line', source: 'neighbors', paint: { 'line-color': '#f7f3e9', 'line-width': ['interpolate', ['linear'], ['zoom'], 4, 4, 7, 5], 'line-opacity': 0.95 } },
    { id: 'neighbors-line', type: 'line', source: 'neighbors', paint: { 'line-color': '#615b51', 'line-width': ['interpolate', ['linear'], ['zoom'], 4, 2, 7, 2.7], 'line-opacity': 0.96 } },
    { id: 'boundary-fill', type: 'fill', source: 'boundary', paint: { 'fill-color': controlColors.Poland, 'fill-opacity': 0.35 } },
    { id: 'control-fill', type: 'fill', source: 'control', paint: { 'fill-color': ['match', ['get', 'actor'], 'Germany', controlColors.Germany, 'Soviet Union', controlColors['Soviet Union'], '#8c8780'], 'fill-opacity': 0.38 } },
    { id: 'control-line', type: 'line', source: 'control', paint: { 'line-color': ['match', ['get', 'actor'], 'Germany', controlColors.Germany, 'Soviet Union', controlColors['Soviet Union'], '#8c8780'], 'line-width': 1, 'line-opacity': 0.75, 'line-dasharray': [2, 2] } },
    { id: 'rivers-line', type: 'line', source: 'rivers', paint: { 'line-color': '#6d9aaa', 'line-width': ['interpolate', ['linear'], ['zoom'], 4, 1.3, 7, 2.4], 'line-opacity': 0.9 } },
    { id: 'secondary-rivers-line', type: 'line', source: 'secondaryRivers', minzoom: 5.5, paint: { 'line-color': '#83a7b2', 'line-width': 1.1, 'line-opacity': 0.82 } },
    { id: 'surrounding-rivers-major-line', type: 'line', source: 'surroundingRivers', filter: ['==', ['get', 'importance'], 'major'], paint: { 'line-color': '#6d9aaa', 'line-width': ['interpolate', ['linear'], ['zoom'], 4, 1.2, 7, 2.3], 'line-opacity': 0.88 } },
    { id: 'surrounding-rivers-minor-line', type: 'line', source: 'surroundingRivers', filter: ['==', ['get', 'importance'], 'secondary'], minzoom: 5.3, paint: { 'line-color': '#83a7b2', 'line-width': 1.1, 'line-opacity': 0.8 } },
    { id: 'boundary-line', type: 'line', source: 'boundary', paint: { 'line-color': '#845137', 'line-width': ['interpolate', ['linear'], ['zoom'], 4, 2.4, 7, 3.6] } },
    { id: 'history-fill', type: 'fill', source: 'history', filter: ['==', ['geometry-type'], 'Polygon'], paint: { 'fill-color': '#8a5a42', 'fill-opacity': 0.42 } },
    { id: 'history-line', type: 'line', source: 'history', filter: ['==', ['geometry-type'], 'LineString'], paint: { 'line-color': '#a43f4b', 'line-width': 3.6, 'line-dasharray': [2, 1.5] } },
    { id: 'history-point', type: 'circle', source: 'history', filter: ['==', ['geometry-type'], 'Point'], paint: { 'circle-color': '#8a5a42', 'circle-radius': 6, 'circle-stroke-color': '#fff', 'circle-stroke-width': 2 } },
    { id: 'advance-axis-line', filter: ['==', ['geometry-type'], 'LineString'], type: 'line', source: 'operations', paint: { 'line-color': ['match', ['get', 'actor'], 'Germany', controlColors.Germany, 'Soviet Union', controlColors['Soviet Union'], '#65615c'], 'line-width': ['interpolate', ['linear'], ['zoom'], 4, 2.8, 7, 4.5], 'line-opacity': 0.92, 'line-dasharray': [3, 1.5] } },
    { id: 'advance-axis-head', filter: ['==', ['geometry-type'], 'LineString'], type: 'symbol', source: 'operations', layout: { 'symbol-placement': 'line-center', 'text-field': '➤', 'text-font': ['Arial', 'Helvetica', 'sans-serif'], 'text-size': 21, 'text-rotation-alignment': 'map', 'text-keep-upright': false, 'text-allow-overlap': true }, paint: { 'text-color': ['match', ['get', 'actor'], 'Germany', controlColors.Germany, 'Soviet Union', controlColors['Soviet Union'], '#65615c'], 'text-halo-color': '#f8f5ed', 'text-halo-width': 1.5 } },
    { id: 'neighbor-region-labels', type: 'symbol', source: 'areaLabels', filter: ['!', ['in', ['get', 'kind'], ['literal', ['main', 'boundary']]]], layout: { 'text-field': ['get', 'label'], 'text-font': ['Arial', 'Helvetica', 'sans-serif'], 'text-size': 11, 'text-max-width': 10, 'text-allow-overlap': false }, paint: { 'text-color': '#625c51', 'text-halo-color': '#f7f3e9', 'text-halo-width': 2 } },
    { id: 'places-dot', type: 'circle', source: 'places', filter: ['<=', ['get', 'priority'], 2], paint: { 'circle-color': '#233c49', 'circle-radius': ['case', ['==', ['get', 'priority'], 1], 4.6, 3], 'circle-stroke-color': '#fff', 'circle-stroke-width': 1.5 } },
    { id: 'places-local-dot', type: 'circle', source: 'places', filter: ['==', ['get', 'priority'], 3], minzoom: 6.2, paint: { 'circle-color': '#37505a', 'circle-radius': 2.6, 'circle-stroke-color': '#fff', 'circle-stroke-width': 1 } },
    { id: 'places-major-label', type: 'symbol', source: 'places', filter: ['==', ['get', 'priority'], 1], layout: { 'text-field': ['get', 'name'], 'text-font': ['Arial', 'Helvetica', 'sans-serif'], 'text-size': 12, 'text-anchor': 'top', 'text-offset': [0, 0.65], 'text-allow-overlap': false }, paint: { 'text-color': '#20343e', 'text-halo-color': '#faf8ef', 'text-halo-width': 1.7 } },
    { id: 'places-minor-label', type: 'symbol', source: 'places', filter: ['==', ['get', 'priority'], 2], minzoom: 5, layout: { 'text-field': ['get', 'name'], 'text-font': ['Arial', 'Helvetica', 'sans-serif'], 'text-size': 11, 'text-anchor': 'top', 'text-offset': [0, 0.55], 'text-allow-overlap': false }, paint: { 'text-color': '#3f555d', 'text-halo-color': '#faf8ef', 'text-halo-width': 1.5 } },
    { id: 'places-local-label', type: 'symbol', source: 'places', filter: ['==', ['get', 'priority'], 3], minzoom: 6.2, layout: { 'text-field': ['get', 'name'], 'text-font': ['Arial', 'Helvetica', 'sans-serif'], 'text-size': 10, 'text-anchor': 'top', 'text-offset': [0, 0.45], 'text-allow-overlap': false }, paint: { 'text-color': '#425861', 'text-halo-color': '#faf8ef', 'text-halo-width': 1.4 } },
    { id: 'surrounding-rivers-major-label', type: 'symbol', source: 'surroundingRivers', filter: ['==', ['get', 'importance'], 'major'], minzoom: 4.7, layout: { 'symbol-placement': 'line', 'symbol-spacing': 340, 'text-field': ['get', 'name'], 'text-font': ['Arial', 'Helvetica', 'sans-serif'], 'text-size': 10, 'text-max-angle': 25 }, paint: { 'text-color': '#47758a', 'text-halo-color': '#f8f7f2', 'text-halo-width': 1.5 } },
    { id: 'surrounding-rivers-minor-label', type: 'symbol', source: 'surroundingRivers', filter: ['==', ['get', 'importance'], 'secondary'], minzoom: 6.1, layout: { 'symbol-placement': 'line', 'symbol-spacing': 400, 'text-field': ['get', 'name'], 'text-font': ['Arial', 'Helvetica', 'sans-serif'], 'text-size': 10, 'text-max-angle': 25 }, paint: { 'text-color': '#5b8799', 'text-halo-color': '#f8f7f2', 'text-halo-width': 1.3 } },
    { id: 'rivers-label', type: 'symbol', source: 'riverLabels', layout: { 'text-field': ['get', 'name'], 'text-font': ['Arial', 'Helvetica', 'sans-serif'], 'text-size': 11, 'text-allow-overlap': false }, paint: { 'text-color': '#47758a', 'text-halo-color': '#f8f7f2', 'text-halo-width': 1.5 } },
    { id: 'neighbor-country-labels', type: 'symbol', source: 'areaLabels', filter: ['in', ['get', 'kind'], ['literal', ['main', 'boundary']]], layout: { 'text-field': ['upcase', ['get', 'label']], 'text-font': ['Arial', 'Helvetica', 'sans-serif'], 'text-size': ['case', ['==', ['get', 'kind'], 'main'], 17, 15], 'text-letter-spacing': 0.09, 'text-max-width': 12, 'text-allow-overlap': true }, paint: { 'text-color': ['case', ['==', ['get', 'kind'], 'main'], '#744a32', '#3f4a49'], 'text-halo-color': '#faf7ec', 'text-halo-width': 2.6 } },
    { id: 'army-axis-label', type: 'symbol', source: 'operations', filter: ['==', ['get', 'category'], 'army_label'], minzoom: 5.2, layout: { 'symbol-placement': 'point', 'text-field': ['get', 'label'], 'text-font': ['Arial', 'Helvetica', 'sans-serif'], 'text-size': 11, 'text-offset': [0, -0.8], 'text-allow-overlap': true, 'text-ignore-placement': true }, paint: { 'text-color': ['match', ['get', 'actor'], 'Soviet Union', '#285c87', '#7b292c'], 'text-halo-color': '#fff9ec', 'text-halo-width': 2 } },
    { id: 'engagement-dot', type: 'circle', source: 'operations', filter: ['==', ['get', 'category'], 'engagement'], paint: { 'circle-color': '#243844', 'circle-radius': 5, 'circle-stroke-color': '#fff8e9', 'circle-stroke-width': 2 } },
    { id: 'engagement-label', type: 'symbol', source: 'operations', filter: ['==', ['get', 'category'], 'engagement'], layout: { 'text-field': ['get', 'label'], 'text-font': ['Arial', 'Helvetica', 'sans-serif'], 'text-size': 12, 'text-anchor': 'left', 'text-offset': [0.65, 0], 'text-allow-overlap': true }, paint: { 'text-color': '#243844', 'text-halo-color': '#fff8e9', 'text-halo-width': 2 } },
    { id: 'army-group-label', type: 'symbol', source: 'operations', filter: ['==', ['get', 'category'], 'army_group'], layout: { 'text-field': ['get', 'label'], 'text-font': ['Arial', 'Helvetica', 'sans-serif'], 'text-size': 13, 'text-max-width': 22, 'text-line-height': 1.35, 'text-allow-overlap': true }, paint: { 'text-color': ['match', ['get', 'actor'], 'Soviet Union', '#285c87', '#7b292c'], 'text-halo-color': '#fff8e9', 'text-halo-width': 2.5 } }
  ]
};

const empty = { type: 'FeatureCollection', features: [] };
export function makeMapStyle(geographicConfig) {
  const style = structuredClone(mapStyle);
  for (const [source, key] of Object.entries({land:'landUrl',places:'placesUrl',rivers:'riversUrl',secondaryRivers:'secondaryRiversUrl',surroundingRivers:'surroundingRiversUrl',riverLabels:'riverLabelsUrl',boundary:'boundaryUrl',neighbors:'neighborsUrl',areaLabels:'areaLabelsUrl'})) {
    style.sources[source].data = geographicConfig[key] || empty;
    if (!geographicConfig[key]) delete style.sources[source].attribution;
  }
  style.sources.capitals = {type:'geojson',data:{type:'FeatureCollection',features:capitals.map(capital=>({type:'Feature',properties:{id:capital.id,name:capital.name,capitalOf:capital.capitalOf},geometry:{type:'Point',coordinates:capital.coordinates}}))}};
  const ordinaryCities = ['!', ['in', ['get','name'], ['literal', capitals.map(capital=>capital.name)]]];
  for (const layer of style.layers.filter(layer=>layer.source==='places')) layer.filter = ['all',layer.filter,ordinaryCities];
  style.layers.push(
    {id:'capital-stars',type:'symbol',source:'capitals',layout:{'text-field':'★','text-font':['Arial','Helvetica','sans-serif'],'text-size':22,'text-allow-overlap':true,'text-ignore-placement':true},paint:{'text-color':'#233c49','text-halo-color':'#fff9ec','text-halo-width':2}},
    {id:'capital-labels',type:'symbol',source:'capitals',layout:{'text-field':['get','name'],'text-font':['Arial','Helvetica','sans-serif'],'text-size':13,'text-anchor':'top','text-offset':[0,1],'text-allow-overlap':true,'text-ignore-placement':true},paint:{'text-color':'#233c49','text-halo-color':'#fff9ec','text-halo-width':2}}
  );
  return style;
}
