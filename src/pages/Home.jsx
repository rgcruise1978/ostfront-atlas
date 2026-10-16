import React from 'react';
import { Link } from 'react-router-dom';
import { collections } from '../data/collections.js';
import { articles, isArticleDraft, articleStatusLabel } from '../content/articles.js';
import CollectionCards from '../components/CollectionCards.jsx';

export default function Home() {
  const published = articles.filter(article=>article.status==='published').length;
  const briefs = articles.filter(isArticleDraft).length;
  const reviews = articles.filter(article=>article.status==='ready-for-review').length;
  const dates = collections.reduce((total,collection)=>total+collection.timeline.length,0);
  return <div className="page home-page">
    <section className="record-hero" aria-labelledby="home-title"><div className="record-intro">
      <p className="eyebrow">Ostfront Atlas / A historical record in progress</p><h1 id="home-title">The Eastern Front <span>in maps &amp; evidence.</span></h1><p className="record-years">1939 <span aria-hidden="true">—</span> 1945</p>
      <p className="lead">Follow the changing geography of the war through dated maps, historical studies and the sources behind them. Begin with Poland in 1939 or any of the four available phases of Operation Barbarossa.</p>
      <div className="record-actions"><Link className="button-link" to="/collections">Choose a collection ↗</Link><Link className="text-link" to="/articles">Find a historical study →</Link></div><p className="record-caution">Current dated entries: August–October 1939 and June–December 1941. Phases I–IV have published studies and military maps. Phase V adds eight published studies and geographic reference views; its dated military layers remain in preparation.</p>
    </div><div className="record-plate"><div className="plate-head"><span>Index of collections</span><span>Eastern Front</span></div><div className="plate-title">A war read <em>through place.</em></div><div className="plate-grid" aria-hidden="true"><span className="plate-cross plate-cross-one">+</span><span className="plate-cross plate-cross-two">+</span><span className="plate-route"/></div>
      <div className="plate-entries">{collections.map((collection,index)=><Link key={collection.key} to={collection.introPath}><span className="plate-number">{String(index+1).padStart(2,'0')}</span><span><strong>{collection.title}</strong><small>{collection.phase?.title || collection.range}</small><small>{collection.status}</small></span><span aria-hidden="true">↗</span></Link>)}</div><p className="plate-foot">{dates} map dates · {published} published studies{reviews > 0 && ` · ${reviews} studies awaiting review`}{briefs > 0 && ` · ${briefs} research briefs`}</p>
    </div></section>
    <section className="archive-index" aria-labelledby="index-title"><div className="section-heading"><p className="eyebrow">The collections / 01—{String(collections.length).padStart(2,'0')}</p><h2 id="index-title">Explore the record</h2><p>Every collection brings together its maps, historical writing and source trail.</p></div><CollectionCards/></section>
    <section className="featured-studies" aria-labelledby="featured-title"><div className="section-heading"><p className="eyebrow">A place to begin</p><h2 id="featured-title">Read across the collections</h2></div><div className="featured-grid">{collections.map(collection=>{const study=collection.studies[0];return <article key={collection.key}><p className="eyebrow">{collection.phase?.title || collection.title}</p><h3><Link to={collection.startPath}>{study.title}</Link></h3><p>{study.summary || study.subtitle}</p><p className="article-meta">{articleStatusLabel(study)} · R.G. Cruise</p><Link to={collection.startPath}>{isArticleDraft(study)?'Read the research brief':'Read the study'} →</Link></article>;})}</div></section>
    <section className="record-bottom"><div className="record-feature"><p className="eyebrow">The reader’s desk</p><h2>Find your way through the atlas.</h2><p>Move between collections, dates, regions and studies. The guide explains map symbols, citations and research-status labels.</p><Link to="/guide">How to Use this Site →</Link></div><div className="source-feature"><p className="eyebrow">The evidence desk</p><h2>Follow the source trail.</h2><p>Search documents, scholarship and geographic data. Each record explains what it supports and where its limits lie.</p><Link to="/sources">Search the source register ↗</Link><div className="source-feature-foot">An independent historical atlas · R.G. Cruise</div></div></section>
  </div>;
}
