import React from 'react';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs.jsx';
import CollectionCards from '../components/CollectionCards.jsx';

export default function Collections() {
  return <div className="page collections-page"><Breadcrumbs items={[{label:'Collections'}]}/><p className="eyebrow">Maps, chronology and historical writing</p><h1>Explore the collections</h1><p className="section-lead">Choose a collection, then follow its dated maps and studies. Published writing and research still in preparation are identified throughout.</p><CollectionCards/><p className="guide-link"><Link to="/guide">New to the atlas? Read the guide →</Link></p></div>;
}
