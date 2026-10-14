import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { campaignById, selectedPhase } from '../data/campaigns.js';
import { collectionByKey } from '../data/collections.js';
import { articleBySlug, isArticleDraft } from '../content/articles.js';
import Breadcrumbs from '../components/Breadcrumbs.jsx';

export default function Campaign({campaignId='barbarossa-1941'}) {
  const campaign=campaignById(campaignId), [params]=useSearchParams();
  const phase=selectedPhase(campaign,params), phaseTwo=phase?.id==='2';
  const collection=collectionByKey(phase?`${campaign.id}:${phase.id}`:campaign.id);
  return <div className="page campaign-page"><Breadcrumbs items={[{label:'Collections',href:'/collections'},{label:phase?`${campaign.title} · Phase ${phase.id}`:campaign.title}]}/><p className="eyebrow">Historical collection · {collection.range}</p><h1>{campaign.title}</h1><p className="section-lead">{collection.subtitle}</p>
    {campaign.phases&&<nav className="phase-navigation" aria-label="Barbarossa phases">{campaign.phases.map(item=><Link key={item.id} to={`${campaign.introPath}?phase=${item.id}`} aria-current={phase.id===item.id?'page':undefined}>{item.title} · {item.range}</Link>)}</nav>}
    <p className="lead">{collection.description}</p><div className="collection-actions"><Link className="button-link" to={collection.mapPath}>Open the campaign map →</Link><Link to={collection.studiesPath}>Browse these studies →</Link><Link to={collection.startPath}>{phaseTwo?'Start with the research brief':'Start reading'} →</Link></div>
    <div className="development-note"><h2>{collection.status}</h2><p>{phaseTwo?'The article outlines and dated map links are ready. Full narratives and military snapshots remain in preparation. The map uses the shared physical geography and an explicitly dated opening territorial reference.':campaign.phases?'The eight completed studies by R.G. Cruise can be read in sequence or alongside their dated maps. Numbered notes connect the narrative to its evidence.':'Begin with the collection introduction, then follow the five dates from the August Pact prelude to the October occupation arrangements. The main invasion and occupation sequence runs from 1 September to 26 October.'}</p></div>
    {!phase&&<section className="collection-introduction"><h2><Link to={collection.startPath}>{collection.studies[0].title}</Link></h2><p>{collection.studies[0].summary}</p><Link to={collection.startPath}>Read the collection introduction →</Link></section>}
    <section className="campaign-chapters" aria-label={phase?`Phase ${phase.id==='1'?'I':'II'} studies`:'Poland date studies'}>{collection.timeline.map((event,index)=>{const article=articleBySlug(event.articleSlug);return <article key={event.id}><p className="eyebrow">{String(index+1).padStart(2,'0')} · {event.label}</p><h2><Link to={`/articles/${event.articleSlug}`}>{event.title}</Link></h2><p>{article?.summary || event.summary}</p><p className="article-meta">{isArticleDraft(article)?'Research brief · full study in preparation':`Published ${article.publicationDate}`} · R.G. Cruise</p><div className="chapter-actions"><Link to={`/articles/${event.articleSlug}`}>{isArticleDraft(article)?'Read the research brief':'Read the study'} →</Link><Link to={`${campaign.mapPath}?date=${event.date}${phase?`&phase=${phase.id}`:''}`}>Open this dated entry ↗</Link></div></article>;})}</section>
  </div>;
}
