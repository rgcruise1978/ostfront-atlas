import React, { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import AtlasMap from '../map/AtlasMap.jsx';
import timeline from '../data/timeline.json';
import sources from '../data/sources.json';

export default function Atlas() {
  const [activeId, setActiveId] = useState(timeline[0].id);
  const [showPlaces, setShowPlaces] = useState(true);
  const [showRivers, setShowRivers] = useState(true);
  const [showBoundary, setShowBoundary] = useState(true);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const active = timeline.find(item => item.id === activeId);
  const selectFeature = useCallback(feature => setSelectedFeature(feature), []);
  return <div className="page atlas-page">
    <div className="atlas-heading"><div><p className="eyebrow">Interactive Atlas · No. 01</p><h1>The Partition of Poland, 1939</h1><p className="section-lead">Five dated records, Poland’s 1939 outline, cities, and rivers. Select a date to read what changed.</p></div><span className="atlas-status">Occupation lines pending</span></div>
    <div className="atlas-layout"><div className="map-column"><AtlasMap date={active.date} showPlaces={showPlaces} showRivers={showRivers} showBoundary={showBoundary} onFeatureSelect={selectFeature} />
      <div className="map-tools"><div className="legend"><strong>Map key</strong><span><i className="swatch border" /> Poland’s 1939 border</span><span><i className="swatch river" /> Major river</span><span><i className="swatch place" /> City location</span></div>
        <div className="layer-toggles"><strong>Layers</strong><label><input type="checkbox" checked={showBoundary} onChange={e => setShowBoundary(e.target.checked)} /> 1939 border</label><label><input type="checkbox" checked={showRivers} onChange={e => setShowRivers(e.target.checked)} /> Rivers</label><label><input type="checkbox" checked={showPlaces} onChange={e => setShowPlaces(e.target.checked)} /> Cities</label></div></div>
      <p className="map-disclaimer">The outlined 1939 Polish border is a generalized pre-invasion reference and stays fixed as dates change. Rivers and city locations show physical and geographic context. Occupation lines, troop positions, and battle crossings are not yet mapped. <Link to="/sources#umn-historical-borders-1939">Boundary source</Link> · <Link to="/sources#natural-earth-10m">Geography source</Link>.</p>
    </div><aside className="atlas-panel"><section className="timeline-panel"><p className="eyebrow">Timeline · 1939</p><h2>Select a date</h2><div className="date-list" role="group" aria-label="Historical date">{timeline.map(item => <button key={item.id} type="button" className={item.id === activeId ? 'active' : ''} aria-pressed={item.id === activeId} onClick={() => { setActiveId(item.id); setSelectedFeature(null); }}><span>{item.label}</span><small>{item.kind}</small></button>)}</div></section>
      <details className="info-panel" open><summary>Historical information</summary><div className="info-content"><p className="event-kind">{active.kind} · {active.label}</p><h2>{active.title}</h2><p>{active.summary}</p>{active.dateRationale && <p className="rationale"><strong>Why this date:</strong> {active.dateRationale}</p>}
      <p><Link to={`/articles/${active.articleSlug}`}>Open full article placeholder →</Link></p>
      <h3>Sources for this date</h3><ul>{active.sourceIds.map(id => { const source = sources.find(item => item.id === id); return source ? <li key={id}><a href={source.url} target="_blank" rel="noreferrer">{source.institution}: {source.title} ↗</a></li> : null; })}</ul>
      {selectedFeature && <div className="feature-detail"><h3>Selected map feature</h3><strong>{selectedFeature.title}</strong><p>{selectedFeature.note}</p>{selectedFeature.coordinates && <p>Coordinates: {selectedFeature.coordinates[1].toFixed(4)}° N, {selectedFeature.coordinates[0].toFixed(4)}° E</p>}</div>}
      </div></details></aside></div>
  </div>;
}
