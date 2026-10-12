import React from 'react';
import { Link } from 'react-router-dom';
import { articles } from '../content/articles.js';

export default function Articles() {
  return <div className="page narrow"><p className="eyebrow">Historical Articles</p><h1>Research and context</h1>
    <p className="section-lead">Short essays accompany the atlases and identify the evidence behind their claims.</p>
    {articles.length ? <div className="article-list">{articles.map(article => <article key={article.slug}>
      <p className="article-meta">{article.historicalPeriod} · {article.publicationDate}</p><h2><Link to={`/articles/${article.slug}`}>{article.title}</Link></h2><p>{article.subtitle}</p><Link to={`/articles/${article.slug}`}>Read article →</Link>
    </article>)}</div> : <div className="empty-state"><h2>No articles published yet</h2><p>The publishing system is ready for sourced article files.</p></div>}
  </div>;
}
