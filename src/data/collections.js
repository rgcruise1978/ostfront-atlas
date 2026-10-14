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
  return { key, campaign, phase, title: campaign.title, subtitle: phase?.title || 'Invasion, partition and occupation',
    range: phase?.range || campaign.studyRange || campaign.range, timeline, studies, published, introductions, briefs,
    introPath: phase ? `${campaign.introPath}?phase=${phase.id}` : '/campaigns/poland-1939',
    mapPath: `${campaign.mapPath}?date=${timeline[0].date}${phase ? `&phase=${phase.id}` : ''}`,
    studiesPath: `/articles?collection=${encodeURIComponent(key)}`,
    startPath: `/articles/${studies[0].slug}`,
    status: [published && `${published} published studies`, introductions && `${introductions} introduction`, briefs && `${briefs} research briefs`].filter(Boolean).join(' · '),
    description: phase?.id === '2' ? 'The drive into the Soviet interior, Soviet counteroffensives and the widening war. Full studies and dated military snapshots are in preparation.' : phase ? 'The opening assault, from preparations at the frontier to the fighting beyond Minsk, in eight complete studies.' : 'From the August Pact prelude through the two invasions, the boundary treaty and the October occupation administrations.' };
}));
export const collectionByKey = key => collections.find(collection => collection.key === key);
export const collectionForArticle = article => collections.find(collection => collection.studies.some(study => study.slug === article?.slug));
export const collectionForDate = (campaign,date) => collectionByKey(campaign.phases ? `${campaign.id}:${phaseForDate(campaign,date)?.id || '1'}` : campaign.id);
export function indexReturnLink(value) {
  const input = new URLSearchParams(value || '');
  const result = new URLSearchParams();
  if (input.get('q')) result.set('q',input.get('q').slice(0,200));
  if (collectionByKey(input.get('collection'))) result.set('collection',input.get('collection'));
  if (['published','research-brief'].includes(input.get('status'))) result.set('status',input.get('status'));
  return `/articles${result.size ? `?${result}` : ''}`;
}
