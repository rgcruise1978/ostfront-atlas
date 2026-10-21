import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { articleBySlug } from '../content/articles.js';
import { PolandStudyContents, PolandEvidenceNotes } from './PolandReading.jsx';
import '../barbarossa-opening-reading.css';
import '../barbarossa-objectives-reading.css';

const introduction = '/campaigns/barbarossa-1941?phase=3';
const readingOrder = [
  [null, 'Start here', 'Introduction'],
  ['barbarossa-the-southward-offensive-1941-08-26', '26 August', 'The southward offensive'],
  ['barbarossa-the-baltic-withdrawal-1941-08-29', '29 August', 'The Baltic withdrawal'],
  ['barbarossa-the-soviet-counterstroke-1941-09-03', '3 September', 'The Soviet counterstroke'],
  ['barbarossa-leningrad-cut-off-1941-09-08', '8 September', 'Leningrad cut off'],
  ['barbarossa-the-kiev-trap-1941-09-12', '12 September', 'The Kiev trap'],
  ['barbarossa-the-encirclement-closes-1941-09-16', '16 September', 'The encirclement closes'],
  ['barbarossa-the-fall-of-kiev-1941-09-19', '19 September', 'The fall of Kiev'],
  ['barbarossa-the-destruction-of-the-pocket-1941-09-26', '26 September', 'The pocket destroyed'],
  ['barbarossa-victory-and-catastrophe-1941-09-29', '29 September', 'Victory and catastrophe'],
];

export function BarbarossaObjectivesNavigation({ currentSlug = null }) {
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
      requestAnimationFrame(() => {
        target.scrollIntoView({ block: 'start' });
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      });
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
  return <nav className="barbarossa-reading-nav barbarossa-objectives-nav" aria-label="Read Operation Barbarossa III">
    <details open={expanded} onToggle={event => setExpanded(event.currentTarget.open)}>
      <summary>Read this collection <span>26 August–29 September 1941</span></summary>
      <ol>{readingOrder.map(([slug, date, label]) => <li key={slug || 'introduction'}>
        <Link to={slug ? `/articles/${slug}` : introduction} aria-current={slug === currentSlug ? 'page' : undefined}
          aria-label={`${slug ? articleBySlug(slug).title : 'Operation Barbarossa III introduction'} · ${date}`}>
          <span>{date}</span><strong>{label}</strong>
        </Link>
      </li>)}</ol>
    </details>
  </nav>;
}

export const BarbarossaObjectivesContents = PolandStudyContents;
export const BarbarossaObjectivesEvidenceNotes = PolandEvidenceNotes;

export function BarbarossaObjectivesIntroduction() {
  return <section className="collection-introduction" aria-labelledby="phase-iii-introduction">
    <h2 id="phase-iii-introduction">Victory, captivity and occupation</h2>
    <p>On 26 August 1941, a German crossing of the Desna opened a route behind the Soviet armies defending Ukraine. Five weeks later, much of Southwestern Front had been destroyed or captured. Germany had won a vast battle without ending Soviet resistance. These nine studies follow how that happened, alongside the struggles for Tallinn, Yelnya and Leningrad and the consequences of conquest for civilians and prisoners.</p>
    <h3>Follow the separate fronts</h3>
    <p><Link to="/articles/barbarossa-the-southward-offensive-1941-08-26">The Southward Offensive</Link> begins with a crossing whose value depended on roads, reinforcements and the fighting farther south. The next two studies follow <Link to="/articles/barbarossa-the-baltic-withdrawal-1941-08-29">the withdrawal from Tallinn</Link> and <Link to="/articles/barbarossa-the-soviet-counterstroke-1941-09-03">the Soviet attack at Yelnya</Link>. Saving a ship, recovering a town and preserving an army were different achievements. At <Link to="/articles/barbarossa-leningrad-cut-off-1941-09-08">Leningrad</Link>, cutting the land connection left a lake route whose capacity still had to be built.</p>
    <h3>From warnings to encirclement</h3>
    <p><Link to="/articles/barbarossa-the-kiev-trap-1941-09-12">The Kiev Trap</Link> examines warnings issued before the German forces joined and the decisions that kept Soviet armies in place. <Link to="/articles/barbarossa-the-encirclement-closes-1941-09-16">The Encirclement Closes</Link> distinguishes contact between advancing units from a perimeter strong enough to resist escape and relief. <Link to="/articles/barbarossa-the-fall-of-kiev-1941-09-19">The Fall of Kiev</Link> follows withdrawal and the first occupation days; <Link to="/articles/barbarossa-the-destruction-of-the-pocket-1941-09-26">The Destruction of the Pocket</Link> follows fragmented resistance, captivity and attempts to survive.</p>
    <h3>The people within the campaign</h3>
    <p>The asides preserve particular lives: evacuees at sea, families under bombardment, people sheltering a soldier, prisoners and witnesses to murder. Their accounts retain their own dates and limits. Occupation extended power over communities while battles continued elsewhere. <Link to="/articles/barbarossa-victory-and-catastrophe-1941-09-29">Victory and Catastrophe</Link> connects the unfinished German strategic effort with the organisation of the massacre at Babyn Yar, whose reported two-day total belongs to 29–30 September together.</p>
    <h3>Choose a study or read in sequence</h3>
    <p>Use the collection links above to enter at any date. Inside each study, the contents link to sections and asides; lettered notes provide detailed references and return to the passage they support. Numbered citations lead to the source list. The dated atlas links retain their separate map sources and precision notes. <Link to="/articles/barbarossa-the-southward-offensive-1941-08-26">Begin with The Southward Offensive →</Link></p>
  </section>;
}
