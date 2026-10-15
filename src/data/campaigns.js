import polandTimeline from './timeline.json';
import barbarossaTimeline from './barbarossa-timeline.json';
import phaseTwoTimeline from './barbarossa-phase-ii-timeline.json';
import phaseThreeTimeline from './barbarossa-phase-iii-timeline.json';
import { geography } from './geography.js';

export const campaigns = [
  {
    id: 'poland-1939', title: 'The Partition of Poland', studyTitle: 'The Partition of Poland, 1939', studyRange: '23 August–26 October 1939', range: '1 September–26 October 1939',
    startDate: '1939-09-01', endDate: '1939-10-26', preludeDate: '1939-08-23',
    introPath: '/campaigns/poland-1939', mapPath: '/atlases/poland-1939', timeline: polandTimeline, map: geography,
    status: 'Historical coverage in development',
    description: 'Explore 1939 boundaries, cities and rivers across the surrounding region, invasion directions, and the September partition line.',
    views: [{ id: 'theatre', label: 'Poland and surrounding areas', bounds: [[4.5,44.5],[37.5,59.5]] },{id:'europe',label:'European overview',bounds:[[-12,35],[45,69]]}]
  },
  {
    id: 'barbarossa-1941', title: 'Operation Barbarossa', phase: 'Phase I: The Opening Assault',
    range: '21 June–5 December 1941', coverageRange: '21 June–29 September 1941', startDate: '1941-06-21', endDate: '1941-09-29',
    introPath: '/campaigns/barbarossa-1941', mapPath: '/atlases/barbarossa-1941', timeline: [...barbarossaTimeline, ...phaseTwoTimeline, ...phaseThreeTimeline],
    phases: [
      { id: '1', title: 'Phase I: The Opening Assault', range: '21 June–9 July 1941', timeline: barbarossaTimeline, status: 'Eight published studies' },
      { id: '2', title: 'Phase II: The Drive into the Soviet Interior', range: '10 July–25 August 1941', timeline: phaseTwoTimeline, status: 'Nine review drafts · dated regional map syntheses' },
      { id: '3', title: 'Phase III: The Battle for Strategic Objectives', range: '26 August–29 September 1941', timeline: phaseThreeTimeline, status: 'Nine research briefs · dated military reconstruction pending' }
    ],
    map: { ...geography, center: [24, 54], bounds: [[4.5,43],[44,64]], referencePeriod: '1941-opening', placesUrl: '/data/geography/barbarossa-reference-places.geojson', boundaryUrl: geography.boundaryUrl, neighborsUrl: '/data/history/barbarossa-1941-neighbors.geojson', areaLabelsUrl: '/data/history/barbarossa-1941-area-labels.geojson', historicalUrl: '/data/history/barbarossa-1941-opening-frontier.geojson', controlUrl: '/data/history/barbarossa-1941-opening-control.geojson', operationsUrl: null },
    status: 'Dated territory and source-qualified operational areas',
    description: 'Follow 26 selected dates. Phase III has nine geographic reference views and linked research briefs; its dated military situations remain to be reconstructed.',
    views: [
      { id: 'theatre', label: 'Full invasion theatre', bounds: [[4.5,43],[44,64]] },
      {id:'europe',label:'European overview',bounds:[[-12,35],[45,69]]},
      { id: 'north', label: 'Army Group North · Baltic region', bounds: [[20, 54], [31, 61]] },
      { id: 'center', label: 'Army Group Center · Belarus', bounds: [[21, 50], [36, 56.5]] },
      { id: 'south', label: 'Army Group South · western Ukraine', bounds: [[21, 45], [34, 52]] },
      { id: 'lepel', label: 'Lepel–Senno–Orsha region', bounds: [[27.5, 54], [31, 56]] },
      { id: 'prut', label: 'Prut and Bessarabia', bounds: [[25, 45], [31, 49.5]] },
      { id: 'smolensk', label: 'Smolensk · Dnieper and Western Dvina', bounds: [[28, 52.5], [35.5, 56.5]] },
      { id: 'uman', label: 'Uman · central Ukraine', bounds: [[27, 47], [33.5, 50.5]] },
      { id: 'luga', label: 'Luga–Novgorod–Staraya Russa', bounds: [[27, 56.5], [33, 61]] },
      { id: 'gomel', label: 'Gomel · Sozh and Dnieper', bounds: [[27.5, 50.5], [33.5, 54]] },
      { id: 'kiev', label: 'Kiev · Dnieper approaches', bounds: [[28.5,49.4],[33.5,52.5]] },
      { id: 'finland', label: 'Finland · Karelian theatre', bounds: [[23,59],[35,66]] },
      { id: 'odessa', label: 'Odessa · Black Sea approaches', bounds: [[28, 45], [32, 47.8]] },
      { id: 'tallinn', label: 'Tallinn · Gulf of Finland', bounds: [[22, 58.5], [31, 61.5]] },
      { id: 'yelnya', label: 'Yelnya · Smolensk', bounds: [[31, 53.4], [35, 55.5]] },
      { id: 'leningrad', label: 'Leningrad · Lake Ladoga', bounds: [[28, 58.9], [33, 61.8]] }
    ]
  }
];
export const campaignById = id => campaigns.find(campaign => campaign.id === id);
export const phaseForDate = (campaign, date) => campaign.phases?.find(phase => phase.timeline.some(event => event.date === date));
export const selectedPhase = (campaign, params) => phaseForDate(campaign, params.get('date')) || campaign.phases?.find(phase => phase.id === params.get('phase')) || campaign.phases?.[0];
export function parseMapView(value) {
  if (!value) return null;
  const numbers = value.split(',').map(Number);
  if (numbers.length !== 3 || !numbers.every(Number.isFinite)) return null;
  const [longitude, latitude, zoom] = numbers;
  return longitude >= -25 && longitude <= 60 && latitude >= 32 && latitude <= 73 && zoom >= 2.3 && zoom <= 10 ? {coordinates:[longitude, latitude], zoom} : null;
}
export function articleMapLink(article, regionId, mapView) {
  const campaign = campaignById(article.campaignId);
  const params = new URLSearchParams();
  if (article.historicalDate) params.set('date', article.historicalDate);
  if (article.phaseId && campaign?.phases?.some(phase => phase.id === article.phaseId)) params.set('phase', article.phaseId);
  const defaultRegion = campaign?.timeline.find(event => event.date === article.historicalDate)?.defaultView;
  if ((regionId || defaultRegion) && campaign?.views.some(view => view.id === (regionId || defaultRegion))) params.set('region', regionId || defaultRegion);
  if (parseMapView(mapView)) params.set('view', mapView);
  return `${campaign?.mapPath || '/atlases/poland-1939'}${params.size ? `?${params}` : ''}`;
}
