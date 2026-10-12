import React, { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import AtlasMap from '../map/AtlasMap.jsx';
import timeline from '../data/timeline.json';
import sources from '../data/sources.json';

export default function Atlas() {
  const [activeId, setActiveId] = useState(timeline[0].id);
  const [showPlaces, setShowPlaces] = useState(true);
  const [showHistory, setShowHistory] = useState(true);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const active = timeline.find(item => item.id === activeId);
  const selectFeature = useCallback(feature => setSelectedFeature(feature), []);
  return <div className="page atlas-page">
    <div className="atlas-heading"><div><p className="eyebrow">Interactive Atlas · No. 01</p><h1>The Partition of Poland, 1939</h1><p className="section-lead">Four dated records, one geographic frame. Select a date to read what changed.</p></div><span className="atlas-status">Historical layers pending</span></div>
    <div className="atlas-layout"><div className="map-column"><AtlasMap date={active.date} showPlaces={showPlaces} showHistory={showHistory} onFeatureSelect={selectFeature} />
      <div className="map-tools"><div className="legend"><strong>Map key</strong><span><i className="swatch land" /> Land</span><span><i className="swatch water" /> Water</span><span><i className="swatch place" /> Geographic reference place</span></div>
        <div className="layer-toggles"><strong>Layers</strong><label><input type="checkbox" checked={showPlaces} onChange={e => setShowPlaces(e.target.checked)} /> Reference places</label><label><input type="checkbox" checked={showHistory} onChange={e => setShowHistory(e.target.checked)} /> Verified historical features <small>(none yet)</small></label></div></div>
      <p className="map-disclaimer">Geographic reference only. This map does not depict 1939 political borders, military front lines, occupation zones, or sovereignty. Land and city positions: Natural Earth, public domain. <Link to="/sources#natural-earth-50m">Source details</Link>.</p>
    </div><aside className="atlas-panel"><section className="timeline-panel"><p className="eyebrow">Timeline · 1939</p><h2>Select a date</h2><div className="date-list" role="group" aria-label="Historical date">{timeline.map(item => <button key={item.id} type="button" className={item.id === activeId ? 'active' : ''} aria-pressed={item.id === activeId} onClick={() => { setActiveId(item.id); setSelectedFeature(null); }}><span>{item.label}</span><small>{item.kind}</small></button>)}</div></section>
      <details className="info-panel" open><summary>Historical information</summary><div className="info-content"><p className="event-kind">{active.kind} · {active.label}</p><h2>{active.title}</h2><p>{active.summary}</p>{active.dateRationale && <p className="rationale"><strong>Why this date:</strong> {active.dateRationale}</p>}
      <h3>Sources for this date</h3><ul>{active.sourceIds.map(id => { const source = sources.find(item => item.id === id); return source ? <li key={id}><a href={source.url} target="_blank" rel="noreferrer">{source.institution}: {source.title} ↗</a></li> : null; })}</ul>
      {selectedFeature && <div className="feature-detail"><h3>Selected map feature</h3><strong>{selectedFeature.title}</strong><p>{selectedFeature.note}</p>{selectedFeature.coordinates && <p>Coordinates: {selectedFeature.coordinates[1].toFixed(4)}° N, {selectedFeature.coordinates[0].toFixed(4)}° E</p>}</div>}
      </div></details></aside></div>
  </div>;
}
