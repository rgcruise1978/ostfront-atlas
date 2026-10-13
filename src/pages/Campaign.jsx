import React from 'react';
import { Link } from 'react-router-dom';
import { campaignById } from '../data/campaigns.js';

export default function Campaign() {
  const campaign = campaignById('barbarossa-1941');
  return <div className="page campaign-page">
    <p className="eyebrow">Historical collection · {campaign.range}</p>
    <h1>{campaign.title}</h1><p className="section-lead">{campaign.phase}</p>
    <p className="lead">This collection follows the opening assault from the preparations of 21 June to the situation on 9 July 1941. The eight chapters will connect military operations with geography, decisions and civilian experience.</p>
    <Link className="button-link" to={campaign.mapPath}>Open the campaign map →</Link>
    <div className="development-note"><h2>Research in progress</h2><p>The chapter pages below are research briefs. The map currently provides geographic orientation and date navigation. Dated formations, movements, 1941 boundaries and territorial control will be added as their evidence is verified.</p></div>
    <section className="campaign-chapters" aria-label="Phase I chapters">{campaign.timeline.map((event, index) => <article key={event.id}>
      <p className="eyebrow">{String(index + 1).padStart(2, '0')} · {event.label}</p><h2><Link to={`/articles/${event.articleSlug}`}>{event.title}</Link></h2>
      <p>{event.summary.replace('Chapter research focus: ', '')}</p><p className="article-meta">Research brief · R.G. Cruise</p>
      <div className="chapter-actions"><Link to={`/articles/${event.articleSlug}`}>Read the brief →</Link><Link to={`${campaign.mapPath}?date=${event.date}`}>Open this dated entry ↗</Link></div>
    </article>)}</section>
  </div>;
}
