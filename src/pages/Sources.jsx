import React, { useEffect } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import sources from '../data/sources.json';
import { collections } from '../data/collections.js';
import { articles } from '../content/articles.js';
import Breadcrumbs from '../components/Breadcrumbs.jsx';

const institutions=[...new Set(sources.map(source=>source.institution))].sort();
const types=[...new Set(sources.map(source=>source.type))].sort();
const dates=[...new Map(collections.flatMap(c=>c.timeline.map(event=>[event.date,event.label]))).entries()].sort();
const referencedBy=id=>articles.filter(article=>article.sourceIds.includes(id));
const relevantTo=(source,collection)=>collection.studies.some(article=>article.sourceIds.includes(source.id)) || collection.timeline.some(event=>event.sourceIds.includes(source.id) || source.supports.includes(event.date));
function SourceRecord({source}) {
  const studies=referencedBy(source.id);
  return <article id={source.id}><p className="article-meta">{source.type}{source.date?` · ${source.date}`:''}</p><h2><a href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a></h2><p><strong>{source.institution}</strong></p><p>{source.relevance}</p><dl><dt>Supports</dt><dd>{source.supports.join(', ')}</dd><dt>Use and uncertainty</dt><dd>{source.notes}</dd><dt>Rights</dt><dd>{source.reuseRights}</dd></dl>{studies.length>0&&<details className="source-reading-links"><summary>Referenced in {studies.length} {studies.length===1?'study':'studies'}</summary><ul>{studies.map(article=><li key={article.slug}><Link to={`/articles/${article.slug}#source-${source.id}`}>{article.title} · {article.historicalPeriod}</Link></li>)}</ul></details>}</article>;
}
export default function Sources() {
  const [params,setParams]=useSearchParams(), location=useLocation();
  const query=params.get('q') || '', institution=params.get('institution') || '', type=params.get('type') || '', selected=params.get('collection') || '', date=params.get('date') || '';
  const collection=collections.find(c=>c.key===selected);
  const matches=sources.filter(source=>(!institution || source.institution===institution) && (!type || source.type===type) && (!collection || relevantTo(source,collection)) && (!date || source.supports.includes(date) || referencedBy(source.id).some(article=>article.historicalDate===date) || collections.some(c=>c.timeline.some(event=>event.date===date&&event.sourceIds.includes(source.id)))) && `${source.title} ${source.institution} ${source.type} ${source.relevance} ${source.supports.join(' ')}`.toLowerCase().includes(query.trim().toLowerCase()));
  const linked=sources.find(source=>`#${source.id}`===location.hash);
  const pinned=linked&&!matches.some(source=>source.id===linked.id);
  const update=(key,value)=>{const next=new URLSearchParams(params);value?next.set(key,value):next.delete(key);setParams(next,{replace:true});};
  useEffect(()=>{if(linked)document.getElementById(linked.id)?.scrollIntoView();},[location.hash,linked]);
  return <div className="page narrow evidence-page"><Breadcrumbs items={[{label:'Sources'}]}/><p className="eyebrow">Sources / Evidence register</p><h1>Evidence behind the atlas</h1><p className="section-lead">Search archival documents, scholarly studies, institutional historical references and geographic datasets. Each record identifies its purpose, limitations and reuse rights.</p><p className="source-clarification">A source link does not grant permission to reproduce its text or images. The recorded source type distinguishes historical accounts and datasets from primary documents.</p>
    <div className="index-filters source-filters"><label>Search sources<input type="search" placeholder="Title, institution or subject" value={query} onChange={e=>update('q',e.target.value)}/></label><label>Institution<select value={institution} onChange={e=>update('institution',e.target.value)}><option value="">All institutions and authors</option>{institutions.map(value=><option key={value} value={value}>{value}</option>)}</select></label><label>Source type<select value={type} onChange={e=>update('type',e.target.value)}><option value="">All source types</option>{types.map(value=><option key={value} value={value}>{value}</option>)}</select></label><label>Referenced collection<select value={selected} onChange={e=>update('collection',e.target.value)}><option value="">All collections</option>{collections.map(c=><option key={c.key} value={c.key}>{c.title}{c.phase?` · Phase ${c.phase.id}`:''}</option>)}</select></label><label>Historical date<select value={date} onChange={e=>update('date',e.target.value)}><option value="">All dates</option>{dates.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label><button onClick={()=>setParams({},{replace:true})}>Reset filters</button></div>
    <p className="result-count" role="status">{matches.length} source {matches.length===1?'record':'records'} found</p>{pinned&&<p className="linked-source-note">Your linked source is shown below even though it is outside these filters.</p>}{!matches.length&&!pinned&&<div className="empty-state"><h2>No sources match these filters</h2><p>Try another subject or reset the filters.</p></div>}
    <div className="source-list">{pinned&&<SourceRecord source={linked}/>}{matches.map(source=><SourceRecord key={source.id} source={source}/>)}</div>
  </div>;
}
