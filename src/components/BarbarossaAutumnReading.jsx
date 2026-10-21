import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { articleBySlug } from '../content/articles.js';
import { PolandEvidenceNotes } from './PolandReading.jsx';
import '../barbarossa-opening-reading.css';
import '../barbarossa-autumn-reading.css';

const introduction = '/campaigns/barbarossa-1941?phase=4';
const readingOrder = [
  [null, 'Start here', 'Introduction'],
  ['barbarossa-the-offensive-begins-1941-09-30', '30 September', 'The Offensive Begins'],
  ['barbarossa-the-drive-on-moscow-1941-10-02', '2 October', 'The Drive on Moscow'],
  ['barbarossa-armies-in-the-trap-1941-10-07', '7 October', 'Armies in the Trap'],
  ['barbarossa-the-road-to-moscow-1941-10-13', '13 October', 'The Road to Moscow'],
  ['barbarossa-crisis-at-the-capital-1941-10-16', '16 October', 'Crisis at the Capital'],
  ['barbarossa-moscow-under-siege-1941-10-19', '19 October', 'Moscow Under Siege'],
  ['barbarossa-the-southern-advance-1941-10-24', '24 October', 'The Southern Advance'],
  ['barbarossa-the-offensive-slows-1941-11-02', '2 November', 'The Offensive Slows'],
  ['barbarossa-the-battle-for-tikhvin-1941-11-09', '9 November', 'The Battle for Tikhvin'],
  ['barbarossa-the-edge-of-winter-1941-11-14', '14 November', 'The Edge of Winter'],
];

export function BarbarossaAutumnNavigation({ currentSlug = null }) {
  const [expanded, setExpanded] = useState(() => window.matchMedia('(min-width:1101px)').matches);
  useEffect(() => {
    const query = window.matchMedia('(min-width:1101px)');
    const resize = () => setExpanded(query.matches);
    query.addEventListener('change', resize);
    return () => query.removeEventListener('change', resize);
  }, []);
  useEffect(() => {
    const reveal = requestedId => {
      let id;
      try { id = decodeURIComponent(typeof requestedId === 'string' ? requestedId : window.location.hash.slice(1)); } catch { return; }
      const target = id && document.getElementById(id);
      if (!target) return;
      for (let detail = target.closest('details'); detail; detail = detail.parentElement?.closest('details')) detail.open = true;
      target.scrollIntoView({ block: 'start' });
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    };
    const followFragment = event => {
      const link = event.target.closest?.('a[href^="#"]');
      if (link) reveal(link.getAttribute('href').slice(1));
    };
    reveal();
    window.addEventListener('hashchange', reveal);
    document.addEventListener('click', followFragment);
    return () => {
      window.removeEventListener('hashchange', reveal);
      document.removeEventListener('click', followFragment);
    };
  }, [currentSlug]);
  return <nav className="barbarossa-reading-nav barbarossa-autumn-nav" aria-label="Read Operation Barbarossa IV">
    <details open={expanded} onToggle={event => setExpanded(event.currentTarget.open)}>
      <summary>Read this collection <span>30 September–14 November 1941</span></summary>
      <ol>{readingOrder.map(([slug, date, label]) => <li key={slug || 'introduction'}>
        <Link to={slug ? `/articles/${slug}` : introduction} aria-current={slug === currentSlug ? 'page' : undefined}
          aria-label={`${slug ? articleBySlug(slug).title : 'Operation Barbarossa IV introduction'} · ${date}`}>
          <span>{date}</span><strong>{label}</strong>
        </Link>
      </li>)}</ol>
    </details>
  </nav>;
}

export function BarbarossaAutumnContents({ article, atlasLink }) {
  const [expanded, setExpanded] = useState(() => window.matchMedia('(min-width:751px)').matches);
  useEffect(() => {
    const query = window.matchMedia('(min-width:751px)');
    const resize = () => setExpanded(query.matches);
    query.addEventListener('change', resize);
    return () => query.removeEventListener('change', resize);
  }, []);
  return <nav className="article-contents poland-contents" aria-label="Study contents">
    <details open={expanded} onToggle={event => setExpanded(event.currentTarget.open)}>
      <summary>In this study</summary>
      <ol>{article.sections.map(section => <li key={section.id}>
        <a href={`#${section.id}`}>{section.label}</a>
        <Link className="section-map-link" to={`${atlasLink}&section=${section.id}`}>Map &amp; context ↗</Link>
        {section.asides?.length > 0 && <ul>{section.asides.map(aside => <li key={aside.id}><a href={`#${aside.id}`}>{aside.label}</a></li>)}</ul>}
      </li>)}</ol>
      <a className="contents-sources" href="#article-notes">Notes and evidence</a>
      <a className="contents-sources" href="#article-sources">Sources and Further Reading</a>
      <a className="contents-top" href="#article-top">↑ Back to top</a>
    </details>
  </nav>;
}

export const BarbarossaAutumnEvidenceNotes = PolandEvidenceNotes;

export function BarbarossaAutumnIntroduction() {
  return <section className="collection-introduction" aria-labelledby="phase-iv-introduction">
    <h2 id="phase-iv-introduction">The autumn offensive and the defence that survived</h2>
    <p>Germany opened Operation Typhoon on 30 September 1941 with Guderian’s southern attack. The main assault followed on 2 October. German commanders expected the destruction of the armies west of Moscow to produce the decisive result the summer campaign had failed to deliver. The enclosures at Vyazma and Bryansk inflicted a catastrophe, yet another Soviet defence took shape beyond them. These ten studies follow that struggle through 14 November, as German leaders prepared a renewed attempt.</p>
    <h3>From the opening attacks to Moscow’s approaches</h3>
    <p><Link to="/articles/barbarossa-the-offensive-begins-1941-09-30">The Offensive Begins</Link> examines the German concentration alongside Soviet defensive plans and the search for intelligence. <Link to="/articles/barbarossa-the-drive-on-moscow-1941-10-02">The Drive on Moscow</Link> follows command decisions made with incomplete information; <Link to="/articles/barbarossa-armies-in-the-trap-1941-10-07">Armies in the Trap</Link> follows resistance, withdrawal orders and captivity after the main escape routes were cut. In <Link to="/articles/barbarossa-the-road-to-moscow-1941-10-13">The Road to Moscow</Link>, surviving troops, fresh formations and redirected supplies become the means of rebuilding a defence.</p>
    <h3>A capital under threat</h3>
    <p><Link to="/articles/barbarossa-crisis-at-the-capital-1941-10-16">Crisis at the Capital</Link> enters Moscow as government offices leave and public alarm spreads. Work and resistance continued beside disorder. <Link to="/articles/barbarossa-moscow-under-siege-1941-10-19">Moscow Under Siege</Link> distinguishes the emergency decree from a military encirclement: the city remained connected to Soviet territory. The decree assigned defensive responsibilities and authorised coercive powers whose implementation requires evidence beyond the order itself.</p>
    <h3>Other fronts and the people within them</h3>
    <p><Link to="/articles/barbarossa-the-southern-advance-1941-10-24">The Southern Advance</Link> connects Kharkov’s capture with industrial evacuation, occupation policy and the separate responsibility for massacres at Odessa. <Link to="/articles/barbarossa-the-offensive-slows-1941-11-02">The Offensive Slows</Link> follows Tula’s defence and the reconstruction of damaged Soviet commands. <Link to="/articles/barbarossa-the-battle-for-tikhvin-1941-11-09">The Battle for Tikhvin</Link> follows the threatened railway feeding Leningrad’s lake supply route. Civilian survival and prisoners’ treatment were integral to the campaign, with responsibility established through particular institutions and decisions.</p>
    <h3>Read in sequence or enter at any date</h3>
    <p><Link to="/articles/barbarossa-the-edge-of-winter-1941-11-14">The Edge of Winter</Link> closes with the Orsha conference, Soviet adaptation and preparations for further attacks. Each study has links to its sections, two historical asides, detailed evidence notes and the dated atlas. Lettered notes return to the passages they support; numbered citations lead to sources. Use the collection links above to choose a date, or <Link to="/articles/barbarossa-the-offensive-begins-1941-09-30">begin with The Offensive Begins →</Link></p>
  </section>;
}
