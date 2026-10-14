import React from 'react';
import { Link } from 'react-router-dom';
import { campaignById } from '../data/campaigns.js';
import { articleBySlug } from '../content/articles.js';

export default function Campaign() {
  const campaign = campaignById('barbarossa-1941');
  return <div className="page campaign-page">
    <p className="eyebrow">Historical collection · {campaign.range}</p>
    <h1>{campaign.title}</h1><p className="section-lead">{campaign.phase}</p>
    <p className="lead">This collection follows the opening assault from the preparations of 21 June to the situation on 9 July 1941. Eight full Historical Studies connect military operations with geography, decisions and civilian experience.</p>
    <Link className="button-link" to={campaign.mapPath}>Open the campaign map →</Link>
    <div className="development-note"><h2>Eight connected Historical Studies</h2><p>Read the complete opening campaign in sequence or explore an individual date. Each study includes numbered source notes, a contents list and links to the dated atlas. The map’s current coverage and limitations are explained on the atlas page.</p></div>
    <section className="campaign-chapters" aria-label="Phase I studies">{campaign.timeline.map((event, index) => <article key={event.id}>
      <p className="eyebrow">{String(index + 1).padStart(2, '0')} · {event.label}</p><h2><Link to={`/articles/${event.articleSlug}`}>{event.title}</Link></h2>
      <p>{articleBySlug(event.articleSlug)?.summary || event.summary}</p><p className="article-meta">Published 14 October 2026 · R.G. Cruise</p>
      <div className="chapter-actions"><Link to={`/articles/${event.articleSlug}`}>Read the study →</Link><Link to={`${campaign.mapPath}?date=${event.date}`}>Open this dated entry ↗</Link></div>
    </article>)}</section>
  </div>;
}
