import React, { useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { marked } from 'marked';
import { articleBySlug, isArticleDraft, ORIGINAL_AUTHOR } from '../content/articles.js';
import sources from '../data/sources.json';
import { articleMapLink, campaignById, adjacentStudySlugs } from '../data/campaigns.js';
import '../study-review.css';
import { BarbarossaObjectivesNavigation, BarbarossaObjectivesContents, BarbarossaObjectivesEvidenceNotes } from '../components/BarbarossaObjectivesReading.jsx';
import { BarbarossaAutumnNavigation, BarbarossaAutumnContents, BarbarossaAutumnEvidenceNotes } from '../components/BarbarossaAutumnReading.jsx';
import Breadcrumbs from '../components/Breadcrumbs.jsx';
import { collectionForArticle, indexReturnLink } from '../data/collections.js';
import { PolandReadingNavigation, PolandStudyContents, PolandEvidenceNotes } from '../components/PolandReading.jsx';
import { BarbarossaOpeningNavigation, BarbarossaOpeningContents, BarbarossaOpeningEvidenceNotes } from '../components/BarbarossaOpeningReading.jsx';
import { BarbarossaInteriorNavigation, BarbarossaInteriorContents, BarbarossaInteriorEvidenceNotes } from '../components/BarbarossaInteriorReading.jsx';

export default function Article() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const article = articleBySlug(slug);
  useEffect(() => {
    document.title = article ? `${article.title} | Ostkrieg` : 'Study not found | Ostkrieg';
    const anchor = document.getElementById(window.location.hash.slice(1));
    if (anchor) anchor.scrollIntoView();
    else window.scrollTo(0, 0);
    return () => { document.title = 'Ostkrieg'; };
  }, [slug, article]);
  if (!article) return <div className="page narrow"><h1>Study not found</h1><Link to="/articles">Return to Historical Studies</Link></div>;
  const collection=collectionForArticle(article);
  const backLink=indexReturnLink(searchParams.get("index"));
  const draft = isArticleDraft(article);
  const review = article.status === 'ready-for-review';
  const campaign = campaignById(article.campaignId);
  const datedStudyMap = campaign?.timeline.find(entry => entry.date === article.historicalDate)?.snapshotStatus === 'dated-regional-synthesis';
  const phaseFourMap=datedStudyMap&&['4','5'].includes(article.phaseId);
  const sourceMethod = datedStudyMap && article.sourceMethod ? article.sourceMethod.replace('Phase III maps remain geographic references; dated military reconstruction is separate.', 'The companion map is a dated regional military reconstruction. Feature sources and precision notes distinguish reported positions from approximate connecting edges.') : article.sourceMethod;
  const displayedSourceMethod=article.phaseId==='5'&&datedStudyMap?'The companion atlas provides dated regional military reconstructions with feature sources, event intervals, qualified geometry and context for every study section. '+(sourceMethod||'').replace(/Phase V[^.]*geographic[^.]*\./g,''):phaseFourMap?sourceMethod?.replace('The Phase IV companion map is geographic reference only; it does not claim verified dated military positions.','The companion map now provides a dated regional reconstruction. Feature sources and precision notes distinguish reported positions, approximate sectors and schematic corridors.'):sourceMethod;
  const cited = article.sourceIds.map(id => sources.find(source => source.id === id)).filter(Boolean);
  const dossier = Boolean(article.sections?.length);
  const poland = article.campaignId === 'poland-1939';
  const opening = article.campaignId === 'barbarossa-1941' && collection?.phase?.id === '1';
  const interior = article.campaignId === 'barbarossa-1941' && collection?.phase?.id === '2';
  const objectives = article.campaignId === 'barbarossa-1941' && collection?.phase?.id === '3';
  const autumn = article.campaignId === 'barbarossa-1941' && collection?.phase?.id === '4';
  const adjacent=adjacentStudySlugs(article);
  const previous = adjacent.previous && articleBySlug(adjacent.previous);
  const next = adjacent.next && articleBySlug(adjacent.next);
  const minutes = article.readingMinutes || Math.ceil(article.body.replace(/<[^>]*>/g, ' ').split(/\s+/).length / 220);
  const atlasLink = articleMapLink(article, searchParams.get('mapRegion'), searchParams.get('mapView'));
  return <article className={`page reading-page${dossier ? ' dossier-page' : ''}${poland ? ' poland-study' : ''}${opening ? ' barbarossa-opening' : ''}${interior ? ' barbarossa-interior' : ''}${objectives ? ' barbarossa-objectives' : ''}${autumn ? ' barbarossa-autumn' : ''}`} id="article-top">
    <Breadcrumbs items={[{label:"Collections",href:"/collections"},{label:collection.phase?`${collection.title} · Phase ${collection.phase.id}`:collection.title,href:collection.introPath},{label:article.historicalPeriod}]}/><Link className="back-link" to={backLink}>← All Historical Studies</Link>
    {previous && <p className="previous-chapter"><Link to={`/articles/${previous.slug}`}>← Previous Study · {previous.historicalPeriod}</Link></p>}
    <header className="article-header">
      <p className="eyebrow">{dossier && `Historical Study · `}{article.historicalPeriod}</p>
      {campaign && <p className="chapter-campaign"><Link to={collection.introPath}>{campaign.studyTitle || campaign.title}{article.phase && ` · ${article.phase}`}</Link></p>}
      <h1>{article.title}</h1><p className="section-lead">{article.subtitle.replace(/\bchapter\b/g, 'study')}</p>
      {article.summary && <p className="article-deck">{article.summary}</p>}
      <p className="article-meta">{review ? `By ${article.author || ORIGINAL_AUTHOR} · Prepared for review ${article.preparedDate}${article.revisionDate && article.revisionDate !== article.preparedDate ? ` · Revised ${article.revisionDate}` : ''} · ${minutes} min read` : draft ? `By ${ORIGINAL_AUTHOR} · ${article.status === 'research-brief' ? 'Research brief · full study in preparation' : 'Full study planned'}` : `By ${article.author || ORIGINAL_AUTHOR}${dossier ? ` · Revised ${article.revisionDate || article.publicationDate} · ${minutes} min read` : ''}`}</p>
      {review && <p className="study-review-notice"><strong>Study — editorial review pending.</strong> Complete Historical Study prepared for editorial review.</p>}
      {phaseFourMap&&!autumn&&<p className="accuracy-note">The companion atlas now includes a dated regional military reconstruction. Earlier passages describing a geographic-reference map reflect the study’s original publication stage; consult the map’s current feature sources and precision notes.</p>}
      {dossier && <div className="article-facts"><span><b>When</b><time dateTime={article.historicalDate}>{article.historicalPeriod}</time></span><span><b>Where</b>{article.location}</span><span><b>In the atlas</b><Link to={atlasLink}>{article.historicalDate ? 'Explore this date ↗' : 'Explore the timeline ↗'}</Link></span></div>}
    </header>
    {poland && <PolandReadingNavigation currentSlug={slug} />}
    {opening && <BarbarossaOpeningNavigation currentSlug={slug} />}
    {interior && <BarbarossaInteriorNavigation currentSlug={slug} />}
    {objectives && <BarbarossaObjectivesNavigation currentSlug={slug} />}
    {autumn && <BarbarossaAutumnNavigation currentSlug={slug} />}
    <div className={dossier ? 'dossier-layout' : undefined}>
      {dossier && (poland ? <PolandStudyContents article={article} /> : opening ? <BarbarossaOpeningContents article={article} /> : interior ? <BarbarossaInteriorContents article={article} /> : objectives ? <BarbarossaObjectivesContents article={article} /> : autumn ? <BarbarossaAutumnContents article={article} atlasLink={atlasLink} /> : <nav className="article-contents" aria-label="Study contents"><p className="eyebrow">In this study</p><ol>{article.sections.map(section => <li key={section.id}><a href={`#${section.id}`}>{section.label}</a>{phaseFourMap&&<Link className="section-map-link" to={`${atlasLink}&section=${section.id}`}>Map &amp; context ↗</Link>}</li>)}</ol><a className="contents-sources" href="#article-sources">Sources and Further Reading</a><a className="contents-top" href="#article-top">↑ Back to top</a></nav>)}
      <div className="article-reading-column">
        {draft ? <div className="empty-state research-brief"><h2>{article.outlineTopics ? 'Study research brief' : 'Full study in preparation'}</h2><p>{article.outlineTopics ? 'This page records the planned subject of the study. Its historical narrative and dated military map situation are still in preparation.' : 'The full study for this date is in preparation. Its atlas entry and linked sources are available now.'}</p>{article.outlineTopics && <><h3>Questions and topics for research</h3><ul>{article.outlineTopics.map(topic => <li key={topic}>{topic}</li>)}</ul>{article.referenceMapUrl && <p><a href={article.referenceMapUrl} target="_blank" rel="noreferrer">Candidate operational map reference ↗</a><br /><small>{article.referenceMapStatus}</small></p>}</>}<div className="research-chronology"><strong>Chronology to preserve</strong>{article.chronologyNotes?.map(note => <p key={note}>{note}</p>)}</div><p><Link to={atlasLink}>Return to this dated map entry →</Link></p></div> : <div className="article-body" dangerouslySetInnerHTML={{ __html: marked.parse(article.body) }} />}
        {poland && <PolandEvidenceNotes article={article} />}
        {opening && <BarbarossaOpeningEvidenceNotes article={article} />}
        {interior && <BarbarossaInteriorEvidenceNotes article={article} />}
        {objectives && <BarbarossaObjectivesEvidenceNotes article={article} />}
        {autumn && <BarbarossaAutumnEvidenceNotes article={article} />}
        {next && <nav className="next-chapter" aria-label="Continue the chronology"><p className="eyebrow">Next Study · {next.historicalPeriod}</p><h2>{next.title}</h2><p>{isArticleDraft(next) ? 'The next full study is in preparation. Its dated atlas entry and sources are available now.' : next.subtitle}</p><div><Link to={`/articles/${next.slug}`}>{isArticleDraft(next) ? 'View the next date' : 'Read the Next Study'} →</Link><Link to={articleMapLink(next)}>Open this date in the atlas ↗</Link></div></nav>}
        <section className="article-sources" id="article-sources"><h2>{draft ? 'Starting research references' : dossier ? 'Sources and Further Reading' : 'Sources and Further Reading'}</h2>
          {dossier && <p className="source-method">{displayedSourceMethod || "The narrative draws on the treaty texts, contemporary diplomatic correspondence and historical scholarship. Diplomatic reports record their authors\u2019 perceptions and claims; they are read with that limitation. The August protocol and the September boundary treaty are treated separately. Follow a numbered citation to its source below; \u201cReturn to text\u201d takes you to its first use."}</p>}
          <ol>{cited.map(source => <li key={source.id} id={`source-${source.id}`}><a href={source.url} target="_blank" rel="noreferrer">{source.institution}, {article.sourceTitleOverrides?.[source.id] || source.title}</a>{dossier && <><p>{source.relevance}</p>{article.sourceLocators?.[source.id]?.length > 0 && ((article.phaseId === '5' || interior || objectives || autumn) ? <details className="source-passages"><summary>Passages cited ({article.sourceLocators[source.id].length})</summary><ul>{article.sourceLocators[source.id].map(locator => <li key={locator}>{locator}</li>)}</ul></details> : <p className="source-locators"><strong>References in this study:</strong> {article.sourceLocators[source.id].join(' · ')}</p>)}<a className="citation-return" href={`#cite-${source.id}`}>↩ Return to text</a></>}</li>)}</ol>
          {article.relatedAtlasIds.length > 0 && <p><Link to={atlasLink}>Explore the related atlas →</Link></p>}
        </section>
      </div>
    </div>
  </article>;
}
