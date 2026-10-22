import React from 'react';
import { Link } from 'react-router-dom';
import { collections } from '../data/collections.js';
import { collectionGuides } from '../data/collectionGuides.js';
export default function CollectionGuide({collection}) {
  const guide=collectionGuides[collection.key],index=collections.findIndex(c=>c.key===collection.key);
  return <section className="collection-map-guide" aria-labelledby="collection-map-guide"><h2 id="collection-map-guide">What you can explore here</h2><p>{guide.scope}</p><p>{guide.questions}</p><p><strong>On the maps.</strong> {guide.maps}</p><p>{guide.continuity}</p><p>{collection.timeline.length} map dates · {collection.published} published dated studies{collection.introductions?` · ${collection.introductions} introductory essay`:''}. Phase boundaries organize the reading; operations did not change everywhere at once.</p><div className="chapter-actions"><Link to={collection.mapPath}>Explore the dated maps →</Link><Link to={`/sources?collection=${encodeURIComponent(collection.key)}`}>Sources used in this collection →</Link></div><nav className="collection-neighbours" aria-label="Adjacent collections">{index>0&&<Link to={collections[index-1].introPath}>← {collections[index-1].phase?.title||collections[index-1].title}</Link>}{index<collections.length-1&&<Link to={collections[index+1].introPath}>{collections[index+1].phase?.title||collections[index+1].title} →</Link>}</nav></section>;
}
