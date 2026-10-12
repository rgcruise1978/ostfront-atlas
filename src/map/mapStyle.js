import { geography } from '../data/geography.js';

export const mapStyle = {
  version: 8,
  name: 'Ostfront Atlas geographic reference',
  sources: {
    land: { type: 'geojson', data: geography.landUrl, attribution: '<a href="https://www.naturalearthdata.com/" target="_blank" rel="noopener noreferrer">Natural Earth</a>' },
    places: { type: 'geojson', data: geography.placesUrl, attribution: 'Natural Earth populated places' },
    history: { type: 'geojson', data: { type: 'FeatureCollection', features: [] } }
  },
  layers: [
    { id: 'water', type: 'background', paint: { 'background-color': '#d9e4e5' } },
    { id: 'land', type: 'fill', source: 'land', paint: { 'fill-color': '#eee9da', 'fill-outline-color': '#a9b4ae' } },
    { id: 'history-fill', type: 'fill', source: 'history', filter: ['==', ['geometry-type'], 'Polygon'], paint: { 'fill-color': '#8a5a42', 'fill-opacity': 0.42 } },
    { id: 'history-line', type: 'line', source: 'history', filter: ['==', ['geometry-type'], 'LineString'], paint: { 'line-color': '#8a5a42', 'line-width': 3 } },
    { id: 'history-point', type: 'circle', source: 'history', filter: ['==', ['geometry-type'], 'Point'], paint: { 'circle-color': '#8a5a42', 'circle-radius': 6, 'circle-stroke-color': '#fff', 'circle-stroke-width': 2 } },
    { id: 'places-dot', type: 'circle', source: 'places', paint: { 'circle-color': '#233c49', 'circle-radius': 5, 'circle-stroke-color': '#fff', 'circle-stroke-width': 2 } }
  ]
};
