export const controlColors = Object.freeze({
  Germany: '#B45B57',
  'Soviet Union': '#547FAD',
  Poland: '#E8D9AE'
});

export const historicalLayerGroups = Object.freeze({
  control: ['control-fill', 'control-line'],
  movements: ['advance-axis-line', 'advance-axis-head'],
  places: ['places-dot', 'places-local-dot', 'places-major-label', 'places-minor-label', 'places-local-label'],
  rivers: ['rivers-line', 'secondary-rivers-line', 'surrounding-rivers-major-line', 'surrounding-rivers-minor-line', 'surrounding-rivers-major-label', 'surrounding-rivers-minor-label', 'rivers-label'],
  boundary: ['boundary-fill', 'boundary-line', 'history-line'],
  neighbors: ['neighbors-fill', 'neighbors-line', 'neighbor-labels']
});
