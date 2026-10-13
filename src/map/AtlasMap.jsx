import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import capitals from '../data/capitals.json';
import { capitalStatus } from '../data/capitalStatus.js';
import { makeMapStyle } from './mapStyle.js';
import { historicalLayerGroups } from './cartography.js';

const historyLayers = ['history-fill', 'history-line', 'history-point'];
const emptyCollection = { type: 'FeatureCollection', features: [] };
const sourceIdsFor = value => Array.isArray(value) ? value : value ? JSON.parse(value) : [];
const onDate = (feature, date) => {
  const p = feature.properties || {};
  if (p.snapshots) return p.snapshots.includes(date);
  return p.startDate <= date && (!p.endDate || date <= p.endDate);
};

maplibregl.setWorkerUrl(workerUrl);

export default function AtlasMap({ campaign, viewRequest, date, showCapitals, showPlaces, showRivers, showBoundary, showNeighbors, showControl, showMovements, onFeatureSelect }) {
  const geography = campaign.map;
  const dateRef = useRef(date);
  dateRef.current = date;
  const container = useRef(null);
  const mapRef = useRef(null);
  const [historyData, setHistoryData] = useState(emptyCollection);
  const [controlData, setControlData] = useState(emptyCollection);
  const [operationsData, setOperationsData] = useState(emptyCollection);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!container.current || mapRef.current) return;
    let map;
    try {
      map = new maplibregl.Map({ container: container.current, style: makeMapStyle(geography), center: geography.center, zoom: 4.7, minZoom: 3, maxZoom: 11, maxBounds: [[4, 38], [45, 66]], attributionControl: false });
      mapRef.current = map;
      map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');
      map.addControl(new maplibregl.ScaleControl({ maxWidth: 120, unit: 'metric' }), 'bottom-left');
      map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
      const resizeObserver = new ResizeObserver(() => map.resize());
      resizeObserver.observe(container.current);
      map.on('load', () => {
        map.fitBounds(geography.bounds, { padding: 28, duration: 0 });
        for (const layer of ['capital-stars', 'capital-labels']) map.on('click', layer, event => {
          const capital = capitals.find(item => item.id === event.features?.[0]?.properties.id);
          if (capital) onFeatureSelect({kind:'capital',title:`${capital.name} · ${capital.capitalOf}`,note:capitalStatus(capital,dateRef.current),coordinates:capital.coordinates,accuracy:capital.accuracy,sourceIds:capital.sourceIds});
        });
        for (const layer of ['places-dot', 'places-local-dot']) map.on('click', layer, (event) => {
          const feature = event.features?.[0];
          if (feature) onFeatureSelect({ kind: 'place', title: feature.properties.name, note: feature.properties.note, coordinates: feature.geometry.coordinates, sourceIds: [feature.properties.sourceId, feature.properties.nameSourceId].filter(Boolean) });
        });
        for (const layer of ['rivers-line', 'surrounding-rivers-major-line', 'surrounding-rivers-minor-line', 'boundary-line']) map.on('click', layer, (event) => {
          const feature = event.features?.[0];
          if (feature) onFeatureSelect({ kind: layer === 'boundary-line' ? 'boundary' : 'river', title: feature.properties.name || feature.properties.title, note: feature.properties.note, sourceIds: feature.properties.sourceId ? [feature.properties.sourceId] : sourceIdsFor(feature.properties.sourceIds) });
        });
        for (const layer of historyLayers) map.on('click', layer, (event) => {
          const feature = event.features?.[0];
          if (feature) onFeatureSelect({ kind: 'historical', title: feature.properties.title, note: feature.properties.note, sourceIds: sourceIdsFor(feature.properties.sourceIds), uncertainty: feature.properties.uncertainty });
        });
        for (const layer of ['control-fill', 'advance-axis-line', 'advance-axis-head', 'army-axis-label', 'army-group-label', 'engagement-dot', 'engagement-label']) map.on('click', layer, (event) => {
          const feature = event.features?.[0];
          if (!feature) return;
          const p = feature.properties;
          onFeatureSelect({ kind: p.category, title: p.title, note: p.note, actor: p.actor, legalStatus: p.legalStatus, period: p.startDate === p.endDate ? p.startDate : `${p.startDate}–${p.endDate}`, accuracy: p.accuracy, uncertainty: p.uncertainty, sourceIds: sourceIdsFor(p.sourceIds) });
        });
        for (const layer of ['capital-stars', 'capital-labels', 'places-dot', 'places-local-dot', 'rivers-line', 'surrounding-rivers-major-line', 'surrounding-rivers-minor-line', 'boundary-line', 'control-fill', 'advance-axis-line', 'advance-axis-head', 'army-axis-label', 'army-group-label', 'engagement-dot', 'engagement-label', ...historyLayers]) {
          map.on('mouseenter', layer, () => { map.getCanvas().style.cursor = 'pointer'; });
          map.on('mouseleave', layer, () => { map.getCanvas().style.cursor = ''; });
        }
      });
      map.on('error', (event) => { if (event.error) setError('The map could not load its geographic data. Please reload the page.'); });
      if (geography.historicalUrl) fetch(geography.historicalUrl).then(response => { if (!response.ok) throw new Error('Historical data unavailable'); return response.json(); })
        .then(data => setHistoryData(data))
        .catch(() => setError('The historical layer data could not be loaded.'));
      for (const [url, setter] of [[geography.controlUrl, setControlData], [geography.operationsUrl, setOperationsData]]) {
        if (!url) continue;
        fetch(url).then(response => { if (!response.ok) throw new Error('Layer data unavailable'); return response.json(); })
          .then(setter).catch(() => setError('The dated map layers could not be loaded.'));
      }
      return () => { resizeObserver.disconnect(); map.remove(); mapRef.current = null; };
    } catch {
      setError('This browser could not start the interactive map.');
    }
  }, [onFeatureSelect, campaign]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const update = () => {
      const eligible = historyData.features.filter(feature => {
        return onDate(feature, date);
      });
      const source = map.getSource('history');
      if (source) source.setData({ ...emptyCollection, features: eligible });
      const control = map.getSource('control');
      if (control) control.setData({ ...emptyCollection, features: controlData.features.filter(feature => onDate(feature, date)) });
      const operations = map.getSource('operations');
      if (operations) operations.setData({ ...emptyCollection, features: operationsData.features.filter(feature => onDate(feature, date)) });
      for (const [group, visible] of [['capitals', showCapitals], ['places', showPlaces], ['rivers', showRivers], ['boundary', showBoundary], ['neighbors', showNeighbors], ['control', showControl], ['movements', showMovements]]) {
        for (const layer of historicalLayerGroups[group]) if (map.getLayer(layer)) map.setLayoutProperty(layer, 'visibility', visible ? 'visible' : 'none');
      }
    };
    if (map.isStyleLoaded()) update(); else map.once('load', update);
  }, [date, showCapitals, showPlaces, showRivers, showBoundary, showNeighbors, showControl, showMovements, historyData, controlData, operationsData]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !viewRequest) return;
    const changeView = () => {
      if (viewRequest.coordinates) map.flyTo({center:viewRequest.coordinates,zoom:6.4,duration:0});
      else map.fitBounds(viewRequest.bounds || geography.bounds,{padding:28,duration:0});
    };
    if (map.isStyleLoaded()) changeView(); else map.once('load',changeView);
    return () => map.off('load',changeView);
  }, [viewRequest, geography]);

  return <div className="map-frame"><div ref={container} className="atlas-map" role="application" aria-label={`Interactive ${campaign.title} map; use the capital locators and region controls to navigate, or zoom and pan the map`} />{error && <p className="map-error" role="alert">{error}</p>}</div>;
}
