import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { articleBySlug } from '../content/articles.js';
import '../poland-reading.css';

const readingOrder = [
  ['poland-1939-introduction', 'Begin here', 'Introduction'],
  ['molotov-ribbentrop-pact-1939-08-23', '23 August', 'The pact'],
  ['german-invasion-poland-1939-09-01', '1 September', 'German invasion'],
  ['soviet-invasion-poland-1939-09-17', '17 September', 'Soviet invasion'],
  ['german-soviet-boundary-treaty-1939-09-28', '28 September', 'Boundary treaty'],
  ['german-occupation-administration-1939-10-26', '26 October', 'Occupation'],
];

export function PolandReadingNavigation({ currentSlug }) {
  useEffect(() => {
    const revealFragment = () => {
      let id;
      try { id = decodeURIComponent(window.location.hash.slice(1)); } catch { return; }
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      let container = target.closest('details');
      while (container) {
        container.open = true;
        container = container.parentElement?.closest('details');
      }
      requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }));
    };
    revealFragment();
    window.addEventListener('hashchange', revealFragment);
    return () => window.removeEventListener('hashchange', revealFragment);
  }, [currentSlug]);

  return <nav className="poland-reading-nav" aria-label="Read the Partition of Poland collection">
    <p className="eyebrow">Read the collection · 1939</p>
    <ol>{readingOrder.map(([slug, date, label]) => <li key={slug}>
      <Link to={`/articles/${slug}`} aria-current={slug === currentSlug ? 'page' : undefined} aria-label={`${articleBySlug(slug).title} · ${date}`}>
        <span>{date}</span><strong>{label}</strong>
      </Link>
    </li>)}</ol>
  </nav>;
}

export function PolandStudyContents({ article }) {
  const [expanded, setExpanded] = useState(() => window.matchMedia('(min-width:751px)').matches);
  useEffect(() => {
    const query = window.matchMedia('(min-width:751px)');
    const changed = () => setExpanded(query.matches);
    query.addEventListener('change', changed);
    return () => query.removeEventListener('change', changed);
  }, []);
  return <nav className="article-contents poland-contents" aria-label="Study contents">
    <details open={expanded} onToggle={event => setExpanded(event.currentTarget.open)}>
      <summary>In this study</summary>
      <ol>{article.sections.map(section => <li key={section.id}>
        <a href={`#${section.id}`}>{section.label}</a>
        {section.asides?.length > 0 && <ul>{section.asides.map(aside => <li key={aside.id}><a href={`#${aside.id}`}>{aside.label}</a></li>)}</ul>}
      </li>)}</ol>
      {article.evidenceNotes?.length > 0 && <a className="contents-sources" href="#article-notes">Notes and evidence</a>}
      <a className="contents-sources" href="#article-sources">Sources and Further Reading</a>
      <a className="contents-top" href="#article-top">↑ Back to top</a>
    </details>
  </nav>;
}

export function PolandEvidenceNotes({ article }) {
  if (!article.evidenceNotes?.length) return null;
  return <section className="evidence-notes" id="article-notes" aria-labelledby="evidence-notes-title">
    <h2 id="evidence-notes-title">Notes and evidence</h2>
    <p>Lettered notes give detailed references and qualifications. Numbered citations link directly to the sources below.</p>
    <details>
      <summary>Read {article.evidenceNotes.length} evidence notes</summary>
      <ol>{article.evidenceNotes.map(note => <li key={note.id} id={note.id}>
        <p>{note.text}</p>
        <div className="evidence-note-links"><span>Sources: </span>{note.sourceIds.map(id => <a key={id} href={`#source-${id}`} aria-label={`Source ${article.sourceIds.indexOf(id) + 1}`}>
          {article.sourceIds.indexOf(id) + 1}
        </a>)}<a className="citation-return" href={`#ref-${note.id}`} aria-label={`Return to passage for evidence note ${note.label}`}>↩ Return to passage</a></div>
      </li>)}</ol>
    </details>
  </section>;
}
