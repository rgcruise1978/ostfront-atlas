import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { collections } from '../data/collections.js';
import { isArticleDraft, articleStatusLabel } from '../content/articles.js';
import Breadcrumbs from '../components/Breadcrumbs.jsx';

export default function Articles() {
  const [params,setParams] = useSearchParams();
  const query=params.get('q') || '', selected=params.get('collection') || '', status=params.get('status') || '';
  const update=(key,value)=>{const next=new URLSearchParams(params);value?next.set(key,value):next.delete(key);setParams(next,{replace:true});};
  const groups=collections.filter(c=>!selected || c.key===selected).map(collection=>({...collection,results:collection.studies.filter(article=>(!status || article.status===status) && `${article.title} ${article.subtitle} ${article.summary || ''} ${article.historicalDate || ''} ${article.historicalPeriod}`.toLowerCase().includes(query.trim().toLowerCase()))}));
  const total=groups.reduce((sum,group)=>sum+group.results.length,0);
  const suffix=params.size?`?index=${encodeURIComponent(params.toString())}`:'';
  return <div className="page narrow archive-page"><Breadcrumbs items={[{label:'Historical Studies'}]}/><p className="eyebrow">Historical Studies / Collection index</p><h1>Historical Studies</h1><p className="section-lead">Find published studies, complete review drafts and research briefs. Introductions lead each collection, followed by its dated reading sequence.</p>
    <div className="index-filters"><label>Search studies<input type="search" value={query} onChange={e=>update('q',e.target.value)} placeholder="Title, date or subject"/></label><label>Collection<select value={selected} onChange={e=>update('collection',e.target.value)}><option value="">All collections</option>{collections.map(c=><option key={c.key} value={c.key}>{c.title}{c.phase?` · Phase ${c.phase.id}`:''}</option>)}</select></label><label>Status<select value={status} onChange={e=>update('status',e.target.value)}><option value="">All entries</option><option value="published">Published</option><option value="ready-for-review">Review drafts</option><option value="research-brief">Research briefs</option></select></label><button onClick={()=>setParams({},{replace:true})}>Reset filters</button></div>
    <p className="result-count" role="status">{total} {total===1?'entry':'entries'} found</p>{!total&&<div className="empty-state"><h2>No studies match these filters</h2><p>Try another title, date or subject, or reset the filters to see every collection.</p></div>}
    {groups.filter(group=>group.results.length).map(collection=><section className="article-collection" key={collection.key}><div className="collection-head"><div><h2><Link to={collection.introPath}>{collection.title}</Link></h2><p>{collection.phase?.title || 'Collection introduction and five dated studies'} · {collection.range}</p></div></div><div className="article-list">{collection.results.map(article=><article key={article.slug}><p className="article-meta">{article.historicalPeriod} · {articleStatusLabel(article)}</p><h3><Link to={`/articles/${article.slug}${suffix}`}>{article.title}</Link></h3><p>{article.subtitle}</p><Link to={`/articles/${article.slug}${suffix}`}>{article.isCollectionIntroduction?'Read collection introduction':isArticleDraft(article)?'Read research brief':'Read study'} →</Link></article>)}</div></section>)}
  </div>;
}
