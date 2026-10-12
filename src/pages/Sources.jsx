import React from 'react';
import sources from '../data/sources.json';

export default function Sources() {
  return <div className="page narrow"><p className="eyebrow">Primary Sources &amp; Source Register</p><h1>Evidence behind the atlas</h1>
    <p className="section-lead">This register includes archival documents, institutional historical references, and geographic data. Each record states what it supports and how it may be used.</p>
    <p className="source-clarification">A link to a source does not grant permission to reproduce its text or images. Historical reference articles are identified as such; they are not presented as primary documents.</p>
    <div className="source-list">{sources.map(source => <article key={source.id} id={source.id}>
      <p className="article-meta">{source.type}{source.date ? ` · ${source.date}` : ''}</p>
      <h2><a href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a></h2><p><strong>{source.institution}</strong></p><p>{source.relevance}</p>
      <dl><dt>Supports</dt><dd>{source.supports.join(', ')}</dd><dt>Use and uncertainty</dt><dd>{source.notes}</dd><dt>Rights</dt><dd>{source.reuseRights}</dd></dl>
    </article>)}</div>
  </div>;
}
