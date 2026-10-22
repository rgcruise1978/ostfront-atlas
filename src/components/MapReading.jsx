import React from 'react';
import { Link } from 'react-router-dom';
import sources from '../data/sources.json';
import notes from '../data/snapshot-notes.json';
import { fold, sectionConnections } from '../map/studyConnections.js';

export function DateExplanation({active,previous,study,studyLink,context}) {
  const [change,significance,limitations]=notes[active.date];
  const civilian=context?.sections.filter(s=>/civilian|people|occupation|prisoner|shelter|famil|persecution|hunger|captiv|pogrom|murder/i.test(s.label)) || [];
  return <section className="snapshot-explanation" aria-label="About this dated reconstruction">
    <p className="eyebrow">Reading this date · {active.label}</p><h2>{active.title}</h2>
    <p><strong>What this map shows.</strong> {study?.summary||active.summary}</p>
    <details><summary>{previous?`Changes since ${previous.label}`:'The opening situation'}</summary><p>{change}</p><p><strong>Why it mattered.</strong> {significance}</p><p>The comparison covers selected snapshots; it is not a continuous record of the intervening days.</p></details>
    <details><summary>Political, operational and civilian context</summary><p>The study explains command decisions, geography and the people affected. Its opening and section contents remain available under <strong>Study context</strong>, including passages that concern earlier or later dates.</p>{civilian.length>0&&<ul>{civilian.map(s=><li key={s.id}><Link to={`${studyLink}#${s.id}`}>{s.label}</Link></li>)}</ul>}<Link to={studyLink}>Read the dated study and its evidence →</Link></details>
    <p className="accuracy-note"><strong>Limits of this view.</strong> {limitations}</p>
    <Link to={`/sources?date=${active.date}`}>Source records for this date →</Link>
  </section>;
}

export function StudyContextPanel({context,records,query,sectionId,studyLink,onFeature}) {
  const sections=sectionConnections(context,records);
  const filtered=sections.map(s=>({...s,passages:s.passages.filter(row=>!query||fold(row.text+' '+s.label).includes(fold(query)))})).filter(s=>s.passages.length);
  return <div className="map-study-context" aria-label="Study context"><p className="finder-count">{context?.paragraphs.length||0} passages · {sections.length} sections</p>
    <p className="accuracy-note">Text comes directly from the current study. Reading connections identify a shared subject; each feature's own evidence supports its geography. Locality references can concern earlier or later events and never assert a same-day position.</p>
    {!filtered.length&&<p>No passage matches this search.</p>}
    {filtered.map(section=><details key={section.id} open={sectionId===section.id||Boolean(query)}><summary>{section.label} · {section.passages.length} passages</summary><Link to={`${studyLink}#${section.id}`}>Read this section in the study ↗</Link><p className="context-disposition">{section.disposition}</p>
      {section.featureIds.length>0&&<div className="context-feature-links">{section.featureIds.map(id=>{const feature=records.find(r=>r.id===id);return <button key={id} onClick={()=>onFeature(feature)}>{feature.title} ↗</button>;})}</div>}
      {section.passages.map(row=><div className="map-context-passage" id={row.id} key={row.id}><p>{row.text}</p><details><summary>Passage evidence and temporal limits</summary><p>{row.temporalScope}</p>
        {row.sourceIds.length===0&&<p>No separate citation is attached to this passage. Read the section's adjoining references; this paragraph alone is not evidence for a plotted feature.</p>}
        <ul>{row.sourceIds.map(id=>{const source=sources.find(s=>s.id===id);return source&&<li key={id}><Link to={`/sources#${id}`}>{source.institution}: {source.title}</Link>{row.sourceLocators[id]?.length>0&&<small>{row.sourceLocators[id].join(' · ')}</small>}</li>;})}</ul>
        {row.evidenceNotes.map(note=><p key={note.id}><Link to={`${studyLink}#${note.id}`}>Evidence note {note.label}</Link>: {note.text}</p>)}
      </details></div>)}
    </details>)}
  </div>;
}
