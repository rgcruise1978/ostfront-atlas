import { geography } from '../data/geography.js';

export const mapStyle = {
  version: 8,
  name: 'Ostfront Atlas geographic reference',
  sources: {
    land: { type: 'geojson', data: geography.landUrl, attribution: '<a href="https://www.naturalearthdata.com/" target="_blank" rel="noopener noreferrer">Natural Earth</a>' },
    places: { type: 'geojson', data: geography.placesUrl, attribution: '<a href="https://www.naturalearthdata.com/" target="_blank" rel="noopener noreferrer">Natural Earth places</a>' },
    rivers: { type: 'geojson', data: geography.riversUrl, attribution: '<a href="https://www.naturalearthdata.com/" target="_blank" rel="noopener noreferrer">Natural Earth rivers</a>' },
    riverLabels: { type: 'geojson', data: geography.riverLabelsUrl },
    boundary: { type: 'geojson', data: geography.boundaryUrl, attribution: '<a href="https://doi.org/10.13020/146x-1412" target="_blank" rel="noopener noreferrer">University of Minnesota historical boundaries (CC BY 3.0 US)</a>' },
    neighbors: { type: 'geojson', data: geography.neighborsUrl, attribution: '<a href="https://doi.org/10.13020/146x-1412" target="_blank" rel="noopener noreferrer">University of Minnesota historical boundaries (CC BY 3.0 US)</a>' },
    areaLabels: { type: 'geojson', data: geography.areaLabelsUrl },
    history: { type: 'geojson', data: { type: 'FeatureCollection', features: [] } }
  },
  layers: [
    { id: 'water', type: 'background', paint: { 'background-color': '#d9e4e5' } },
    { id: 'land', type: 'fill', source: 'land', paint: { 'fill-color': '#eee9da', 'fill-outline-color': '#a9b4ae' } },
    { id: 'neighbors-fill', type: 'fill', source: 'neighbors', paint: { 'fill-color': '#d9d5c9', 'fill-opacity': 0.66 } },
    { id: 'neighbors-line', type: 'line', source: 'neighbors', paint: { 'line-color': '#9c978a', 'line-width': 1.2, 'line-opacity': 0.85 } },
    { id: 'boundary-fill', type: 'fill', source: 'boundary', paint: { 'fill-color': '#d3bd8e', 'fill-opacity': 0.27 } },
    { id: 'rivers-line', type: 'line', source: 'rivers', paint: { 'line-color': '#6d9aaa', 'line-width': ['interpolate', ['linear'], ['zoom'], 4, 1.3, 7, 2.4], 'line-opacity': 0.9 } },
    { id: 'boundary-line', type: 'line', source: 'boundary', paint: { 'line-color': '#845137', 'line-width': ['interpolate', ['linear'], ['zoom'], 4, 2.4, 7, 3.6] } },
    { id: 'history-fill', type: 'fill', source: 'history', filter: ['==', ['geometry-type'], 'Polygon'], paint: { 'fill-color': '#8a5a42', 'fill-opacity': 0.42 } },
    { id: 'history-line', type: 'line', source: 'history', filter: ['==', ['geometry-type'], 'LineString'], paint: { 'line-color': '#a43f4b', 'line-width': 3.6, 'line-dasharray': [2, 1.5] } },
    { id: 'history-point', type: 'circle', source: 'history', filter: ['==', ['geometry-type'], 'Point'], paint: { 'circle-color': '#8a5a42', 'circle-radius': 6, 'circle-stroke-color': '#fff', 'circle-stroke-width': 2 } },
    { id: 'neighbor-labels', type: 'symbol', source: 'areaLabels', layout: { 'text-field': ['get', 'label'], 'text-font': ['Arial', 'Helvetica', 'sans-serif'], 'text-size': ['case', ['==', ['get', 'kind'], 'main'], 16, ['==', ['get', 'kind'], 'boundary'], 13, 11], 'text-max-width': 10, 'text-allow-overlap': false }, paint: { 'text-color': ['case', ['==', ['get', 'kind'], 'main'], '#71553d', '#6b655a'], 'text-halo-color': '#f6f1e7', 'text-halo-width': 2 } },
    { id: 'places-dot', type: 'circle', source: 'places', paint: { 'circle-color': '#233c49', 'circle-radius': ['case', ['==', ['get', 'priority'], 1], 4.6, 3], 'circle-stroke-color': '#fff', 'circle-stroke-width': 1.5 } },
    { id: 'places-major-label', type: 'symbol', source: 'places', filter: ['==', ['get', 'priority'], 1], layout: { 'text-field': ['get', 'name'], 'text-font': ['Arial', 'Helvetica', 'sans-serif'], 'text-size': 12, 'text-anchor': 'top', 'text-offset': [0, 0.65], 'text-allow-overlap': false }, paint: { 'text-color': '#20343e', 'text-halo-color': '#faf8ef', 'text-halo-width': 1.7 } },
    { id: 'places-minor-label', type: 'symbol', source: 'places', filter: ['==', ['get', 'priority'], 2], minzoom: 5, layout: { 'text-field': ['get', 'name'], 'text-font': ['Arial', 'Helvetica', 'sans-serif'], 'text-size': 11, 'text-anchor': 'top', 'text-offset': [0, 0.55], 'text-allow-overlap': false }, paint: { 'text-color': '#3f555d', 'text-halo-color': '#faf8ef', 'text-halo-width': 1.5 } },
    { id: 'rivers-label', type: 'symbol', source: 'riverLabels', layout: { 'text-field': ['get', 'name'], 'text-font': ['Arial', 'Helvetica', 'sans-serif'], 'text-size': 11, 'text-allow-overlap': false }, paint: { 'text-color': '#47758a', 'text-halo-color': '#f8f7f2', 'text-halo-width': 1.5 } }
  ]
};
