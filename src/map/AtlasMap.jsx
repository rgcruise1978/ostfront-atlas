import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { geography } from '../data/geography.js';
import { mapStyle } from './mapStyle.js';

const historyLayers = ['history-fill', 'history-line', 'history-point'];
const emptyCollection = { type: 'FeatureCollection', features: [] };

export default function AtlasMap({ date, showPlaces, showHistory, onFeatureSelect }) {
  const container = useRef(null);
  const mapRef = useRef(null);
  const [historyData, setHistoryData] = useState(emptyCollection);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!container.current || mapRef.current) return;
    let map;
    try {
      map = new maplibregl.Map({ container: container.current, style: mapStyle, center: geography.center, zoom: 4.7, minZoom: 3, maxZoom: 11, maxBounds: [[4, 38], [44, 64]], attributionControl: false });
      mapRef.current = map;
      map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');
      map.addControl(new maplibregl.ScaleControl({ maxWidth: 120, unit: 'metric' }), 'bottom-left');
      map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
      const resizeObserver = new ResizeObserver(() => map.resize());
      resizeObserver.observe(container.current);
      map.on('load', () => {
        map.fitBounds(geography.bounds, { padding: 28, duration: 0 });
        map.on('click', 'places-dot', (event) => {
          const feature = event.features?.[0];
          if (feature) onFeatureSelect({ kind: 'place', title: feature.properties.name, note: feature.properties.note, coordinates: feature.geometry.coordinates, sourceIds: [feature.properties.sourceId] });
        });
        for (const layer of historyLayers) map.on('click', layer, (event) => {
          const feature = event.features?.[0];
          if (feature) onFeatureSelect({ kind: 'historical', title: feature.properties.title, note: feature.properties.note, sourceIds: JSON.parse(feature.properties.sourceIds || '[]') });
        });
        for (const layer of ['places-dot', ...historyLayers]) {
          map.on('mouseenter', layer, () => { map.getCanvas().style.cursor = 'pointer'; });
          map.on('mouseleave', layer, () => { map.getCanvas().style.cursor = ''; });
        }
      });
      map.on('error', (event) => { if (event.error) setError('The map could not load its geographic data. Please reload the page.'); });
      fetch(geography.historicalUrl).then(response => { if (!response.ok) throw new Error('Historical data unavailable'); return response.json(); })
        .then(data => setHistoryData(data))
        .catch(() => setError('The historical layer data could not be loaded.'));
      return () => { resizeObserver.disconnect(); map.remove(); mapRef.current = null; };
    } catch {
      setError('This browser could not start the interactive map.');
    }
  }, [onFeatureSelect]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const update = () => {
      const eligible = historyData.features.filter(feature => {
        const p = feature.properties || {};
        return p.startDate <= date && (!p.endDate || date <= p.endDate);
      });
      const source = map.getSource('history');
      if (source) source.setData({ ...emptyCollection, features: eligible });
      if (map.getLayer('places-dot')) map.setLayoutProperty('places-dot', 'visibility', showPlaces ? 'visible' : 'none');
      for (const layer of historyLayers) if (map.getLayer(layer)) map.setLayoutProperty(layer, 'visibility', showHistory ? 'visible' : 'none');
    };
    if (map.isStyleLoaded()) update(); else map.once('load', update);
  }, [date, showPlaces, showHistory, historyData]);

  return <div className="map-frame"><div ref={container} className="atlas-map" role="application" aria-label="Interactive geographic reference map centered on Poland; use map controls to zoom or pan" />{error && <p className="map-error" role="alert">{error}</p>}</div>;
}
