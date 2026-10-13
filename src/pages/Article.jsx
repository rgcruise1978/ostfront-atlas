import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { marked } from 'marked';
import { articleBySlug, isArticleDraft, ORIGINAL_AUTHOR } from '../content/articles.js';
import sources from '../data/sources.json';
import { articleMapLink, campaignById } from '../data/campaigns.js';

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
  const draft = isArticleDraft(article);
  const campaign = campaignById(article.campaignId);
  const cited = article.sourceIds.map(id => sources.find(source => source.id === id)).filter(Boolean);
  const dossier = Boolean(article.sections?.length);
  const previous = article.previousArticleSlug && articleBySlug(article.previousArticleSlug);
  const next = article.nextArticleSlug && articleBySlug(article.nextArticleSlug);
  const minutes = Math.ceil(article.body.replace(/<[^>]*>/g, ' ').split(/\s+/).length / 220);
  const atlasLink = articleMapLink(article);
  return <article className={`page reading-page${dossier ? ' dossier-page' : ''}`} id="article-top">
    <Link className="back-link" to="/articles">← All articles</Link>
    {previous && <p className="previous-chapter"><Link to={`/articles/${previous.slug}`}>← Previous chapter · {previous.historicalPeriod}</Link></p>}
    <header className="article-header">
      <p className="eyebrow">{dossier && `Historical dossier ${article.dossierNumber} · `}{article.historicalPeriod}</p>
      {campaign && <p className="chapter-campaign">{campaign.title}{article.phase && ` · ${article.phase}`}</p>}
      <h1>{article.title}</h1><p className="section-lead">{article.subtitle}</p>
      {article.summary && <p className="article-deck">{article.summary}</p>}
      <p className="article-meta">{draft ? `By ${ORIGINAL_AUTHOR} · ${article.status === 'research-brief' ? 'Research brief · full chapter in preparation' : 'Full article planned'}` : `By ${article.author || ORIGINAL_AUTHOR} · Published ${article.publicationDate}${dossier ? ` · ${minutes} min read` : ''}`}</p>
      {dossier && <div className="article-facts"><span><b>When</b><time dateTime={article.historicalDate}>{article.historicalPeriod}</time></span><span><b>Where</b>{article.location}</span><span><b>In the atlas</b><Link to={atlasLink}>Explore this date ↗</Link></span></div>}
    </header>
    <div className={dossier ? 'dossier-layout' : undefined}>
      {dossier && <nav className="article-contents" aria-label="Article contents"><p className="eyebrow">In this chapter</p><ol>{article.sections.map(section => <li key={section.id}><a href={`#${section.id}`}>{section.label}</a></li>)}</ol><a className="contents-sources" href="#article-sources">Sources &amp; reading notes</a><a className="contents-top" href="#article-top">↑ Back to top</a></nav>}
      <div className="article-reading-column">
        {draft ? <div className="empty-state research-brief"><h2>{article.outlineTopics ? 'Chapter research brief' : 'Full article in preparation'}</h2><p>{article.outlineTopics ? 'This page records the planned subject of the chapter. Its historical narrative and dated military map situation are still in preparation.' : 'The full article for this date is in preparation. Its atlas entry and linked sources are available now.'}</p>{article.outlineTopics && <><h3>Questions and topics for research</h3><ul>{article.outlineTopics.map(topic => <li key={topic}>{topic}</li>)}</ul>{article.referenceMapUrl && <p><a href={article.referenceMapUrl} target="_blank" rel="noreferrer">Candidate operational map reference ↗</a><br /><small>{article.referenceMapStatus}</small></p>}</>}<p><Link to={atlasLink}>Return to this dated map entry →</Link></p></div> : <div className="article-body" dangerouslySetInnerHTML={{ __html: marked.parse(article.body) }} />}
        {next && <nav className="next-chapter" aria-label="Continue the chronology"><p className="eyebrow">Continue the chronology · {next.historicalPeriod}</p><h2>{next.title}</h2><p>{isArticleDraft(next) ? 'The next full article is in preparation. Its dated atlas entry and sources are available now.' : next.subtitle}</p><div><Link to={`/articles/${next.slug}`}>{isArticleDraft(next) ? 'View the next date' : 'Read the next article'} →</Link><Link to={articleMapLink(next)}>Open this date in the atlas ↗</Link></div></nav>}
        <section className="article-sources" id="article-sources"><h2>{draft ? 'Starting research references' : dossier ? 'Sources & reading notes' : 'Source links'}</h2>
          {dossier && <p className="source-method">{article.sourceMethod || "The narrative draws on the treaty texts, contemporary diplomatic correspondence and historical scholarship. Diplomatic reports record their authors\u2019 perceptions and claims; they are read with that limitation. The August protocol and the September boundary treaty are treated separately. Follow a numbered citation to its source below; \u201cReturn to text\u201d takes you to its first use."}</p>}
          <ol>{cited.map(source => <li key={source.id} id={`source-${source.id}`}><a href={source.url} target="_blank" rel="noreferrer">{source.institution}, {source.title}</a>{dossier && <><p>{source.relevance}</p><a className="citation-return" href={`#cite-${source.id}`}>↩ Return to text</a></>}</li>)}</ol>
          {article.relatedAtlasIds.length > 0 && <p><Link to={atlasLink}>Explore the related atlas →</Link></p>}
        </section>
      </div>
    </div>
  </article>;
}
