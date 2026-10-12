import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return <div className="page home-page">
    <section className="home-intro">
      <div><p className="eyebrow">A historical research project · In development</p><h1>The Eastern Front, <em>1939–1945</em></h1>
        <p className="lead">Explore the war through geography, dated events, historical writing, and the evidence behind them. The first atlas examines the partition and occupation of Poland in 1939.</p>
        <Link className="button-link" to="/atlases/poland-1939">Explore the Poland atlas <span aria-hidden="true">→</span></Link>
      </div>
      <aside className="intro-note"><span className="note-number">01 / 04</span><h2>The first atlas</h2><p>Four documented dates trace invasion, treaty, and occupation administration. Geographic reconstruction is being prepared separately from the modern reference map.</p><span className="note-rule" /></aside>
    </section>
    <section className="home-grid" aria-label="Explore the project">
      <Link to="/atlases/poland-1939"><span className="card-index">01</span><h2>Interactive Atlases</h2><p>Use a geographic map and a source-linked timeline to explore Poland, 1939.</p><span className="card-arrow">View atlas →</span></Link>
      <Link to="/articles"><span className="card-index">02</span><h2>Historical Articles</h2><p>Read context and interpretation with explicit source references.</p><span className="card-arrow">Read articles →</span></Link>
      <Link to="/sources"><span className="card-index">03</span><h2>Primary Sources</h2><p>Inspect the source register behind the timeline and future map layers.</p><span className="card-arrow">Browse sources →</span></Link>
    </section>
    <section className="development-note"><h2>Work in progress</h2><p>This foundation includes a working map and documented timeline. Historical borders and military positions are pending source-supported geographic research; the map does not claim to reconstruct them yet.</p></section>
  </div>;
}
