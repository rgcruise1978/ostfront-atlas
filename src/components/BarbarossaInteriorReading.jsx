import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { articleBySlug } from '../content/articles.js';
import { PolandStudyContents, PolandEvidenceNotes } from './PolandReading.jsx';
import '../barbarossa-opening-reading.css';
import '../barbarossa-interior-reading.css';

const introduction = '/campaigns/barbarossa-1941?phase=2';
const readingOrder = [
  [null, 'Start here', 'Introduction'],
  ['barbarossa-beyond-the-dnieper-1941-07-10', '10 July', 'Beyond the Dnieper'],
  ['barbarossa-smolensk-under-assault-1941-07-16', '16 July', 'Smolensk'],
  ['barbarossa-the-red-army-strikes-back-1941-07-23', '23 July', 'Soviet counterattacks'],
  ['barbarossa-a-strategy-under-strain-1941-07-30', '30 July', 'Strategy under strain'],
  ['barbarossa-the-uman-encirclement-1941-08-06', '6 August', 'Uman'],
  ['barbarossa-the-war-widens-1941-08-12', '12 August', 'The war widens'],
  ['barbarossa-the-fight-for-gomel-1941-08-19', '19 August', 'Gomel'],
  ['barbarossa-the-decision-to-turn-south-1941-08-21', '21 August', 'The turn south'],
  ['barbarossa-a-front-divided-1941-08-25', '25 August', 'A front divided'],
];

export function BarbarossaInteriorNavigation({ currentSlug = null }) {
  const [expanded, setExpanded] = useState(() => window.matchMedia('(min-width:1101px)').matches);
  useEffect(() => {
    const query = window.matchMedia('(min-width:1101px)');
    const resize = () => setExpanded(query.matches);
    query.addEventListener('change', resize);
    return () => query.removeEventListener('change', resize);
  }, []);
  useEffect(() => {
    const reveal = () => {
      let id;
      try { id = decodeURIComponent(window.location.hash.slice(1)); } catch { return; }
      const target = id && document.getElementById(id);
      if (!target) return;
      for (let detail = target.closest('details'); detail; detail = detail.parentElement?.closest('details')) detail.open = true;
      requestAnimationFrame(() => {
        target.scrollIntoView({ block: 'start' });
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      });
    };
    reveal();
    window.addEventListener('hashchange', reveal);
    return () => window.removeEventListener('hashchange', reveal);
  }, [currentSlug]);
  return <nav className="barbarossa-reading-nav barbarossa-interior-nav" aria-label="Read Operation Barbarossa II">
    <details open={expanded} onToggle={event => setExpanded(event.currentTarget.open)}>
      <summary>Read this collection <span>10 July–25 August 1941</span></summary>
      <ol>{readingOrder.map(([slug, date, label]) => <li key={slug || 'introduction'}>
        <Link to={slug ? `/articles/${slug}` : introduction} aria-current={slug === currentSlug ? 'page' : undefined}
          aria-label={`${slug ? articleBySlug(slug).title : 'Operation Barbarossa II introduction'} · ${date}`}>
          <span>{date}</span><strong>{label}</strong>
        </Link>
      </li>)}</ol>
    </details>
  </nav>;
}

export const BarbarossaInteriorContents = PolandStudyContents;
export const BarbarossaInteriorEvidenceNotes = PolandEvidenceNotes;

export function BarbarossaInteriorIntroduction() {
  return <section className="collection-introduction" aria-labelledby="phase-ii-introduction">
    <h2 id="phase-ii-introduction">Victory that required another battle</h2>
    <p>On 10 July 1941, German troops crossed the river approaches to Smolensk while Soviet armies still held other sectors of the Dnieper. By 25 August, the main German mobile effort in the centre was turning south towards Ukraine, yet Soviet headquarters was ordering fresh attacks around Smolensk. These nine studies follow the interval: why did advances that destroyed formations and opened great distances fail to end Soviet resistance?</p>
    <h3>Follow the battles and the decisions</h3>
    <p>Begin <Link to="/articles/barbarossa-beyond-the-dnieper-1941-07-10">beyond the Dnieper</Link>, then follow German entry into <Link to="/articles/barbarossa-smolensk-under-assault-1941-07-16">Smolensk</Link> and the <Link to="/articles/barbarossa-the-red-army-strikes-back-1941-07-23">Soviet counterattacks</Link>. The capture of a city did not end the battle for its streets, crossings or supply routes. <Link to="/articles/barbarossa-a-strategy-under-strain-1941-07-30">A Strategy Under Strain</Link> examines the repairs, communications and diplomatic arrangements needed to keep armies fighting.</p>
    <p>The southern battle at <Link to="/articles/barbarossa-the-uman-encirclement-1941-08-06">Uman</Link> trapped the Soviet 6th and 12th Armies while the <Link to="/articles/barbarossa-the-war-widens-1941-08-12">war widened around Odessa and Staraya Russa</Link>. At <Link to="/articles/barbarossa-the-fight-for-gomel-1941-08-19">Gomel</Link>, the loss of a junction exposed routes towards northern Ukraine. <Link to="/articles/barbarossa-the-decision-to-turn-south-1941-08-21">Hitler’s decision of 21 August</Link> directed the larger German effort south; <Link to="/articles/barbarossa-a-front-divided-1941-08-25">A Front Divided</Link> closes with forces still committed in several directions.</p>
    <h3>The people within the campaign</h3>
    <p>Military reports sit alongside accounts of civilian flight, captivity, persecution and murder. The asides follow named people, surviving objects and the work of locating witnesses. Their evidence has its own dates: a later recollection or a later escape does not become an event on the study’s selected day. Each study links its asides and sections through the contents, with detailed notes and sources available below the narrative.</p>
    <h3>Read with the dated maps</h3>
    <p>Use the atlas link on each study to open its selected date. Map sources and precision notes distinguish reported positions from approximate sectors. Orders identify intended movements, while reports describe what headquarters knew at particular times. The sequence ends on 25 August, before Tallinn’s evacuation and the September encirclement at Kiev. <Link to="/articles/barbarossa-beyond-the-dnieper-1941-07-10">Start with Beyond the Dnieper →</Link></p>
  </section>;
}
