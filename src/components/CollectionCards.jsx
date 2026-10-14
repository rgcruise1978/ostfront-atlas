import React from 'react';
import { Link } from 'react-router-dom';
import { collections } from '../data/collections.js';

export default function CollectionCards() {
  return <div className="collection-cards">{collections.map((collection,index) => <article key={collection.key}>
    <p className="eyebrow">Collection {String(index+1).padStart(2,'0')} · {collection.range}</p>
    <h2><Link to={collection.introPath}>{collection.title}</Link></h2><p className="collection-subtitle">{collection.subtitle}</p>
    <p>{collection.description}</p><p className="collection-count">{collection.timeline.length} map dates · {collection.status}</p>
    <div className="collection-actions"><Link to={collection.mapPath}>Open map →</Link><Link to={collection.studiesPath}>Browse studies →</Link><Link to={collection.startPath}>{collection.briefs ? 'Start with the research brief' : 'Start reading'} →</Link></div>
  </article>)}</div>;
}
