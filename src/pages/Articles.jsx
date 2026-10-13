import React from 'react';
import { Link } from 'react-router-dom';
import { articles, isArticleDraft } from '../content/articles.js';
import { campaigns } from '../data/campaigns.js';

export default function Articles() {
  return <div className="page narrow"><p className="eyebrow">Historical Articles</p><h1>Research and context</h1>
    <p className="section-lead">Essays accompany the atlases and identify the evidence behind their claims. Date articles marked “Planned” are placeholders for future research and writing.</p>
    {campaigns.map(campaign => <section className="article-collection" key={campaign.id}><h2>{campaign.title}</h2><p>{campaign.phase || campaign.range}</p><div className="article-list">{articles.filter(a => a.campaignId === campaign.id).sort((a,b) => (a.historicalDate || a.publicationDate).localeCompare(b.historicalDate || b.publicationDate)).map(article => <article key={article.slug}>
      <p className="article-meta">{article.historicalPeriod} · {isArticleDraft(article) ? 'In preparation' : `Published ${article.publicationDate}`}</p><h3><Link to={`/articles/${article.slug}`}>{article.title}</Link></h3><p>{article.subtitle}</p><Link to={`/articles/${article.slug}`}>{article.status === 'research-brief' ? 'Read research brief →' : isArticleDraft(article) ? 'View planned chapter →' : 'Read article →'}</Link>
    </article>)}</div></section>)}
  </div>;
}
