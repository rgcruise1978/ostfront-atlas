import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { marked } from 'marked';
import { articleBySlug } from '../content/articles.js';
import sources from '../data/sources.json';

export default function Article() {
  const { slug } = useParams();
  const article = articleBySlug(slug);
  if (!article) return <div className="page narrow"><h1>Article not found</h1><Link to="/articles">Return to articles</Link></div>;
  const cited = article.sourceIds.map(id => sources.find(source => source.id === id)).filter(Boolean);
  return <article className="page reading-page"><Link className="back-link" to="/articles">← All articles</Link>
    <header className="article-header"><p className="eyebrow">{article.historicalPeriod}</p><h1>{article.title}</h1><p className="section-lead">{article.subtitle}</p><p className="article-meta">By {article.author} · Published {article.publicationDate}</p></header>
    <div className="article-body" dangerouslySetInnerHTML={{ __html: marked.parse(article.body) }} />
    <section className="article-sources"><h2>Source links</h2><ol>{cited.map(source => <li key={source.id}><a href={source.url} target="_blank" rel="noreferrer">{source.institution}, {source.title}</a></li>)}</ol>
      {article.relatedAtlasIds.includes('poland-1939') && <p><Link to="/atlases/poland-1939">Explore the related atlas →</Link></p>}</section>
  </article>;
}
