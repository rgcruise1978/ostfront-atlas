import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return <div className="page home-page">
    <section className="home-intro">
      <div><p className="eyebrow">A historical research project · In development</p><h1>The Eastern Front, <em>1939–1945</em></h1>
        <p className="lead">Explore the war through geography, dated events, historical writing, and the evidence behind them. The collections follow the partition of Poland in 1939 and the opening assault of Operation Barbarossa in 1941.</p>
        <Link className="button-link" to="/atlases/poland-1939">Explore the Poland atlas <span aria-hidden="true">→</span></Link>
      </div>
      <aside className="intro-note"><span className="note-number">02 COLLECTIONS</span><h2>History through geography</h2><p>Poland’s five dated entries include the August Pact prelude and four invasion, treaty and occupation snapshots. Barbarossa Phase I has eight full Historical Studies and a geographic map foundation.</p><span className="note-rule" /></aside>
    </section>
    <section className="home-grid" aria-label="Explore the project">
      <Link to="/atlases/poland-1939"><span className="card-index">01</span><h2>The Partition of Poland</h2><p>1 September–26 October 1939 · with a 23 August Pact prelude.</p><span className="card-arrow">View atlas →</span></Link>
      <Link to="/campaigns/barbarossa-1941"><span className="card-index">02</span><h2>Operation Barbarossa</h2><p>Phase I: The Opening Assault · 21 June–9 July 1941. Read eight complete studies and explore the geographic reference.</p><span className="card-arrow">Explore the collection →</span></Link>
      <Link to="/sources"><span className="card-index">03</span><h2>Primary Sources</h2><p>Inspect the source register behind the timeline and future map layers.</p><span className="card-arrow">Browse sources →</span></Link>
    </section>
    <section className="development-note"><h2>Work in progress</h2><p>The Poland atlas includes sourced operational directions and five published date studies. Barbarossa Phase I now has eight complete Historical Studies; its current map provides geographic orientation, with its military coverage and limitations explained on the atlas page.</p></section>
  </div>;
}
