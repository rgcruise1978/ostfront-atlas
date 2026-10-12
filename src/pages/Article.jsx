import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { marked } from 'marked';
import { articleBySlug } from '../content/articles.js';
import sources from '../data/sources.json';

export default function Article() {
  const { slug } = useParams();
  const article = articleBySlug(slug);
  useEffect(() => {
    document.title = article ? `${article.title} | Ostfront Atlas` : 'Article not found | Ostfront Atlas';
    const anchor = document.getElementById(window.location.hash.slice(1));
    if (anchor) anchor.scrollIntoView();
    else window.scrollTo(0, 0);
    return () => { document.title = 'Ostfront Atlas'; };
  }, [slug, article]);
  if (!article) return <div className="page narrow"><h1>Article not found</h1><Link to="/articles">Return to articles</Link></div>;
  const cited = article.sourceIds.map(id => sources.find(source => source.id === id)).filter(Boolean);
  const dossier = Boolean(article.sections?.length);
  const next = article.nextArticleSlug && articleBySlug(article.nextArticleSlug);
  const minutes = Math.ceil(article.body.replace(/<[^>]*>/g, ' ').split(/\s+/).length / 220);
  const atlasLink = `/atlases/poland-1939${article.historicalDate ? `?date=${article.historicalDate}` : ''}`;
  return <article className={`page reading-page${dossier ? ' dossier-page' : ''}`} id="article-top">
    <Link className="back-link" to="/articles">← All articles</Link>
    <header className="article-header">
      <p className="eyebrow">{dossier && `Historical dossier ${article.dossierNumber} · `}{article.historicalPeriod}</p>
      <h1>{article.title}</h1><p className="section-lead">{article.subtitle}</p>
      {article.summary && <p className="article-deck">{article.summary}</p>}
      <p className="article-meta">{article.status === 'placeholder' ? 'Full article planned' : `By ${article.author} · Published ${article.publicationDate}${dossier ? ` · ${minutes} min read` : ''}`}</p>
      {dossier && <div className="article-facts"><span><b>When</b><time dateTime={article.historicalDate}>{article.historicalPeriod}</time></span><span><b>Where</b>{article.location}</span><span><b>In the atlas</b><Link to={atlasLink}>Explore this date ↗</Link></span></div>}
    </header>
    <div className={dossier ? 'dossier-layout' : undefined}>
      {dossier && <nav className="article-contents" aria-label="Article contents"><p className="eyebrow">In this chapter</p><ol>{article.sections.map(section => <li key={section.id}><a href={`#${section.id}`}>{section.label}</a></li>)}</ol><a className="contents-sources" href="#article-sources">Sources &amp; reading notes</a><a className="contents-top" href="#article-top">↑ Back to top</a></nav>}
      <div className="article-reading-column">
        {article.status === 'placeholder' ? <div className="empty-state"><p>The full article for this date is in preparation. The linked sources and atlas entry are available now.</p></div> : <div className="article-body" dangerouslySetInnerHTML={{ __html: marked.parse(article.body) }} />}
        {next && <nav className="next-chapter" aria-label="Continue the chronology"><p className="eyebrow">Continue the chronology · {next.historicalPeriod}</p><h2>{next.title}</h2><p>{next.status === 'placeholder' ? 'The next full article is in preparation. Its dated atlas entry and sources are available now.' : next.subtitle}</p><div><Link to={`/articles/${next.slug}`}>{next.status === 'placeholder' ? 'View the next date' : 'Read the next article'} →</Link><Link to={`/atlases/poland-1939?date=${next.historicalDate}`}>Open this date in the atlas ↗</Link></div></nav>}
        <section className="article-sources" id="article-sources"><h2>{dossier ? 'Sources & reading notes' : 'Source links'}</h2>
          {dossier && <p className="source-method">The narrative draws on the treaty texts, contemporary diplomatic correspondence and historical scholarship. Diplomatic reports record their authors’ perceptions and claims; they are read with that limitation. The August protocol and the September boundary treaty are treated separately. Follow a numbered citation to its source below; “Return to text” takes you to its first use.</p>}
          <ol>{cited.map(source => <li key={source.id} id={`source-${source.id}`}><a href={source.url} target="_blank" rel="noreferrer">{source.institution}, {source.title}</a>{dossier && <><p>{source.relevance}</p><a className="citation-return" href={`#cite-${source.id}`}>↩ Return to text</a></>}</li>)}</ol>
          {article.relatedAtlasIds.includes('poland-1939') && <p><Link to={atlasLink}>Explore the related atlas →</Link></p>}
        </section>
      </div>
    </div>
  </article>;
}
