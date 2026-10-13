export const controlColors = Object.freeze({
  Germany: '#B45B57',
  'Soviet Union': '#547FAD',
  Poland: '#E8D9AE',
  Romania: '#927044', Finland: '#4D806B', Contested: '#8B718A', Neutral: '#D2D9D6'
});

export const countryColors = Object.freeze({
  Germany: controlColors.Germany,
  'Soviet Union': controlColors['Soviet Union'],
  Hungary: '#d5c4a4', Romania: '#d5c7b3',
  Lithuania: '#d9dfd2', Latvia: '#d4ded7', Estonia: '#d2dedb',
  Other: '#d9d5c9'
});

export const historicalLayerGroups = Object.freeze({
  capitals: ['capital-stars', 'capital-labels'],
  control: ['control-fill', 'control-line'],
  movements: ['advance-axis-line', 'advance-axis-head', 'army-axis-label', 'army-group-label', 'engagement-dot', 'engagement-label'],
  places: ['places-dot', 'places-local-dot', 'places-major-label', 'places-minor-label', 'places-local-label'],
  rivers: ['rivers-line', 'secondary-rivers-line', 'surrounding-rivers-major-line', 'surrounding-rivers-minor-line', 'surrounding-rivers-major-label', 'surrounding-rivers-minor-label', 'rivers-label'],
  boundary: ['boundary-fill', 'boundary-line', 'history-line'],
  neighbors: ['neighbors-fill', 'neighbors-border-halo', 'neighbors-line', 'neighbor-region-labels', 'neighbor-country-labels']
});
