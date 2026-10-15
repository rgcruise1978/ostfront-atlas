import { campaigns, phaseForDate } from './campaigns.js';
import { articles, isArticleDraft } from '../content/articles.js';

export const collections = campaigns.flatMap(campaign => (campaign.phases || [null]).map(phase => {
  const key = phase ? `${campaign.id}:${phase.id}` : campaign.id;
  const timeline = phase?.timeline || campaign.timeline;
  const studies = articles.filter(article => article.campaignId === campaign.id && (!phase || timeline.some(event => event.articleSlug === article.slug)))
    .sort((a,b) => Number(Boolean(b.isCollectionIntroduction)) - Number(Boolean(a.isCollectionIntroduction)) || (a.historicalDate || '').localeCompare(b.historicalDate || ''));
  const published = studies.filter(article => article.status === 'published' && !article.isCollectionIntroduction).length;
  const introductions = studies.filter(article => article.isCollectionIntroduction).length;
  const briefs = studies.filter(isArticleDraft).length;
  const reviews = studies.filter(article => article.status === 'ready-for-review').length;
  return { key, campaign, phase, title: campaign.title, subtitle: phase?.title || 'Invasion, partition and occupation',
    range: phase?.range || campaign.studyRange || campaign.range, timeline, studies, published, introductions, briefs, reviews,
    introPath: phase ? `${campaign.introPath}?phase=${phase.id}` : '/campaigns/poland-1939',
    mapPath: `${campaign.mapPath}?date=${timeline[0].date}${phase ? `&phase=${phase.id}` : ''}${timeline[0].defaultView ? `&region=${timeline[0].defaultView}` : ''}`,
    studiesPath: `/articles?collection=${encodeURIComponent(key)}`,
    startPath: `/articles/${studies[0].slug}`,
    status: [published && `${published} published studies`, introductions && `${introductions} introduction`, reviews && `${reviews} studies awaiting review`, briefs && `${briefs} research briefs`].filter(Boolean).join(' · '),
    description: phase?.id === '4' ? 'Ten full studies trace Operation Typhoon and simultaneous fighting around Leningrad, eastern Ukraine and Crimea. All ten studies are published; the dated maps remain geographic reference views while military reconstructions are prepared.' : phase?.id === '3' ? 'Nine complete studies connect the fighting around Leningrad, Yelnya and Kiev, with operations, logistics and civilian experiences. All nine are published; the maps provide dated regional military reconstructions with source and precision notes.' : phase?.id === '2' ? 'The drive into the Soviet interior, Soviet counteroffensives and the widening war. Nine published studies connect the operations, decisions and civilian experiences of this phase. Dated regional maps distinguish reported positions from approximate operational edges.' : phase ? 'The opening assault, from preparations at the frontier to the fighting beyond Minsk, in eight complete studies.' : 'From the August Pact prelude through the two invasions, the boundary treaty and the October occupation administrations.' };
}));
export const collectionByKey = key => collections.find(collection => collection.key === key);
export const collectionForArticle = article => collections.find(collection => collection.studies.some(study => study.slug === article?.slug));
export const collectionForDate = (campaign,date) => collectionByKey(campaign.phases ? `${campaign.id}:${phaseForDate(campaign,date)?.id || '1'}` : campaign.id);
export function indexReturnLink(value) {
  const input = new URLSearchParams(value || '');
  const result = new URLSearchParams();
  if (input.get('q')) result.set('q',input.get('q').slice(0,200));
  if (collectionByKey(input.get('collection'))) result.set('collection',input.get('collection'));
  if (['published','research-brief','ready-for-review'].includes(input.get('status'))) result.set('status',input.get('status'));
  return `/articles${result.size ? `?${result}` : ''}`;
}
