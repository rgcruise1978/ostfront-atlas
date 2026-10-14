import polandTimeline from './timeline.json';
import barbarossaTimeline from './barbarossa-timeline.json';
import { geography } from './geography.js';

export const campaigns = [
  {
    id: 'poland-1939', title: 'The Partition of Poland', range: '1 September–26 October 1939',
    startDate: '1939-09-01', endDate: '1939-10-26', preludeDate: '1939-08-23',
    mapPath: '/atlases/poland-1939', timeline: polandTimeline, map: geography,
    status: 'Historical coverage in development',
    description: 'Explore 1939 boundaries, cities and rivers across the surrounding region, invasion directions, and the September partition line.',
    views: [{ id: 'theatre', label: 'Poland and surrounding areas', bounds: geography.bounds },{id:'europe',label:'European overview',bounds:[[-12,35],[45,69]]}]
  },
  {
    id: 'barbarossa-1941', title: 'Operation Barbarossa', phase: 'Phase I: The Opening Assault',
    range: '21 June–9 July 1941', startDate: '1941-06-21', endDate: '1941-07-09',
    introPath: '/campaigns/barbarossa-1941', mapPath: '/atlases/barbarossa-1941', timeline: barbarossaTimeline,
    map: { ...geography, center: [24, 54], bounds: [[5, 43], [43, 63]], referencePeriod: '1941-opening', placesUrl: '/data/geography/barbarossa-reference-places.geojson', boundaryUrl: geography.boundaryUrl, neighborsUrl: '/data/history/barbarossa-1941-neighbors.geojson', areaLabelsUrl: '/data/history/barbarossa-1941-area-labels.geojson', historicalUrl: '/data/history/barbarossa-1941-opening-frontier.geojson', controlUrl: '/data/history/barbarossa-1941-opening-control.geojson', operationsUrl: null },
    status: 'Dated territory and source-qualified operational areas',
    description: 'Follow eight dated situations using shared historical geography, source-qualified military areas, rivers and cities.',
    views: [
      { id: 'theatre', label: 'Full invasion theatre', bounds: [[5, 43], [43, 63]] },
      {id:'europe',label:'European overview',bounds:[[-12,35],[45,69]]},
      { id: 'north', label: 'Army Group North · Baltic region', bounds: [[20, 54], [31, 61]] },
      { id: 'center', label: 'Army Group Center · Belarus', bounds: [[21, 50], [36, 56.5]] },
      { id: 'south', label: 'Army Group South · western Ukraine', bounds: [[21, 45], [34, 52]] },
      { id: 'lepel', label: 'Lepel–Senno–Orsha region', bounds: [[27.5, 54], [31, 56]] },
      { id: 'prut', label: 'Prut and Bessarabia', bounds: [[25, 45], [31, 49.5]] }
    ]
  }
];
export const campaignById = id => campaigns.find(campaign => campaign.id === id);
export const articleMapLink = article => `${campaignById(article.campaignId)?.mapPath || '/atlases/poland-1939'}${article.historicalDate ? `?date=${article.historicalDate}` : ''}`;
