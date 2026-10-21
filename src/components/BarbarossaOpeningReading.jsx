import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { articleBySlug } from '../content/articles.js';
import { PolandStudyContents, PolandEvidenceNotes } from './PolandReading.jsx';
import '../barbarossa-opening-reading.css';

const introduction = '/campaigns/barbarossa-1941?phase=1';
const readingOrder = [
  [null, 'Start here', 'Introduction'],
  ['barbarossa-before-the-storm-1941-06-21', '21 June', 'Before the storm'],
  ['barbarossa-begins-1941-06-22', '22 June', 'Invasion'],
  ['barbarossa-the-first-counterattacks-1941-06-25', '25 June', 'Counterattacks'],
  ['barbarossa-the-encirclement-of-minsk-1941-06-28', '28 June', 'Minsk'],
  ['barbarossa-the-war-moves-east-1941-07-01', '1 July', 'Ukraine'],
  ['barbarossa-the-soviet-union-responds-1941-07-03', '3 July', 'Soviet response'],
  ['barbarossa-the-battle-beyond-minsk-1941-07-06', '6 July', 'Lepel'],
  ['barbarossa-eighteen-days-of-war-1941-07-09', '9 July', 'Eighteen days'],
];

export function BarbarossaOpeningNavigation({ currentSlug = null }) {
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
  return <nav className="barbarossa-reading-nav" aria-label="Read Operation Barbarossa I">
    <details open={expanded} onToggle={event => setExpanded(event.currentTarget.open)}>
      <summary>Read this collection <span>21 June–9 July 1941</span></summary>
      <ol>{readingOrder.map(([slug, date, label]) => <li key={slug || 'introduction'}>
        <Link to={slug ? `/articles/${slug}` : introduction} aria-current={slug === currentSlug ? 'page' : undefined}
          aria-label={`${slug ? articleBySlug(slug).title : 'Operation Barbarossa I introduction'} · ${date}`}>
          <span>{date}</span><strong>{label}</strong>
        </Link>
      </li>)}</ol>
    </details>
  </nav>;
}

export const BarbarossaOpeningContents = PolandStudyContents;

export function BarbarossaOpeningEvidenceNotes({ article }) {
  return <>
    <PolandEvidenceNotes article={article} />
    {article.evidenceNotes?.some(note => note.relatedLinks?.length) && <p className="evidence-related-studies">
      For the earlier invasion and annexation documents cited in note b, see the{' '}
      {article.evidenceNotes.flatMap(note => note.relatedLinks || []).map((link, index, links) => <React.Fragment key={link.href}>
        <Link to={link.href}>{link.label}</Link>{index < links.length - 1 ? ', ' : '.'}
      </React.Fragment>)}
    </p>}
  </>;
}

export function BarbarossaOpeningIntroduction() {
  return <section className="collection-introduction" aria-labelledby="phase-i-introduction">
    <h2 id="phase-i-introduction">The opening assault: what could victory decide?</h2>
    <p>Germany invaded the Soviet Union on 22 June 1941. Hitler’s <a href="https://germanhistorydocs.org/en/nazi-germany-1933-1945/ghdi:document-1547">Directive 21</a>, issued the previous December, had set the immediate objective: destroy the main Soviet forces in the west before they could withdraw into the interior. The first eighteen days brought German advances and enormous Soviet losses. They did not settle whether the Soviet state could replace its defeated armies and continue the war. These eight studies follow that question from the preparations on 21 June to the unfinished battles on 9 July.</p>
    <h3>Three connected regions, different battles</h3>
    <p>Army Group North advanced through the Baltic lands, Army Group Centre through Belarus, and Army Group South into Ukraine. The German–Romanian offensive from the Prut widened the southern battle in July. An army group coordinated several armies; the Soviet term <em>front</em> likewise denotes a large command, not simply a line on the ground. Mobile formations could reach crossings far ahead of marching infantry. What they could achieve depended on supplies, secure communications and the forces following them. <Link to="/articles/barbarossa-before-the-storm-1941-06-21#three-army-groups-and-four-mobile-striking-forces">Before the Storm explains the commands and their tasks.</Link></p>
    <h3>From the frontier to another defence</h3>
    <p>Start with the preparations, the <Link to="/articles/barbarossa-begins-1941-06-22">invasion</Link> and the first Soviet counterattacks. At <Link to="/articles/barbarossa-the-encirclement-of-minsk-1941-06-28">Minsk</Link>, distinguish the city’s capture from the closing and reduction of the pockets. The <Link to="/articles/barbarossa-the-war-moves-east-1941-07-01">Ukraine study</Link> follows a different battle, while <Link to="/articles/barbarossa-the-soviet-union-responds-1941-07-03">The Soviet Union Responds</Link> examines mobilization, evacuation, emergency authority and coercion. The <Link to="/articles/barbarossa-the-battle-beyond-minsk-1941-07-06">Lepel counterstroke</Link> then tests the ability to turn fresh forces into a coordinated attack. <Link to="/articles/barbarossa-eighteen-days-of-war-1941-07-09">Eighteen Days of War</Link> brings the three regions together and assesses the campaign’s unresolved purpose.</p>
    <h3>Conquest and its human consequences</h3>
    <p>Criminal orders preceded the invasion. Their implementation accompanied the advance, alongside massacres of Jews and the detention and deprivation of Soviet prisoners. Soviet security organs also murdered prisoners during the retreat. The studies identify the perpetrators and evidence for each crime, including the persecution in Kaunas, Białystok, Lwów and Iași. An opponent’s crimes cannot transfer responsibility to innocent people or excuse subsequent violence.</p>
    <p>Read in sequence or enter through a dated study. Each study links to its sections, historical asides, detailed evidence notes and companion map. Orders establish intentions; reports contain estimates and gaps; later testimony and historical reconstruction require their own qualifications. The <Link to="/articles/barbarossa-eighteen-days-of-war-1941-07-09#article-notes">closing study’s evidence notes</Link> show how the campaign’s numerical assessments and civilian histories are supported. The collection ends on 9 July; later reports are identified by their own dates.</p>
  </section>;
}
