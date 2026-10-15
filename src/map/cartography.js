export const controlColors = Object.freeze({
  Germany: '#626A73',
  'Soviet Union': '#A63D40',
  Poland: '#C9B68F',
  Romania: '#927044', Finland: '#4D806B', Contested: '#8B718A', Neutral: '#D2D9D6'
});

export const countryColors = Object.freeze({
  Germany: controlColors.Germany,
  'Soviet Union': controlColors['Soviet Union'],
  Hungary: '#A49B73', Romania: '#B19B72', Italy: '#A99E7C',
  'Slovak Republic': '#899677', Bulgaria: '#A5A17A', Finland: '#C5CCB5',
  France: '#D8C6B0', 'United Kingdom': '#C5BFA0', Yugoslavia: '#B6C5B8', Greece: '#D2CAB0',
  Sweden:'#B9C5B0', Norway:'#B4C6D0', Denmark:'#C7A990', Netherlands:'#CBA67E', Belgium:'#C6B790', Luxembourg:'#B8A5BB',
  Spain:'#D2B880', Portugal:'#AAC1A5', Switzerland:'#C7C3A5', Ireland:'#AFBE9C', Turkey:'#BAADA0', Iceland:'#BCC9CC',
  'French State':'#D8C6B0', 'Croatian client administration':'#B7B28C', Poland:controlColors.Poland,
  Lithuania:'#C4D2B3', Latvia:'#BDD1BD', Estonia:'#B9CFCD',
  Other: '#d9d5c9'
});

export const actorColors=Object.freeze({Germany:'#233543','Soviet Union':'#8C1728',Poland:'#76552B',Romania:'#8C6021',Slovakia:'#3A6743',Finland:'#2B6D64',Hungary:'#73601C',Italy:'#697735','United Kingdom':'#2E6387'});
export const coalitionColors=Object.freeze({axis:'#996B26',allied:'#2E6D96',cobelligerent:'#417F6B',neutral:'#718076',collaboration:'#8D7080',independent:'#8B8170',unresolved:'#AF8EAA'});
export const movementKinds=Object.freeze({advance:{label:'Advance / attack',dash:[1,0]},counterattack:{label:'Counterattack',dash:[5,1]},retreat:{label:'Retreat / withdrawal',dash:[2,2]},transfer:{label:'Redeployment / reinforcement',dash:[6,2,1,2]},planned:{label:'Ordered / planned movement',dash:[1,3]},breakout:{label:'Breakout attempt',dash:[4,2]}});

export const territorialCategories = Object.freeze({
  'german-core': {label:'German Reich · incorporated territory',color:controlColors.Germany},
  'german-claimed': {label:'German incorporation claim · contested sovereignty',color:'#8B9299',pattern:'claim-hatch'},
  'german-military': {label:'German military occupation',color:'#BEC3C7',pattern:'occupation-hatch'},
  'german-civil': {label:'German civilian occupation administration',color:'#A1A8AE',pattern:'civil-dots'},
  'soviet-core': {label:'Soviet Union · core territory',color:controlColors['Soviet Union']},
  'soviet-occupation': {label:'Soviet occupation / disputed incorporation',color:'#CA8583',pattern:'soviet-hatch'},
  'soviet-cession': {label:'Territory ceded to USSR by treaty',color:'#B45C5C'},
  'aligned': {label:'German-aligned state · own administration',color:'#899677'},
  'neutral': {label:'Neutral state',color:'#E0D8C5'},
  'independent': {label:'Other independent state',color:'#D3C8B1'},
  'dependency': {label:'Colonial territory / dependency',color:'#C5BFA0',pattern:'civil-dots'},
  'poland': {label:'Polish sovereign territory',color:controlColors.Poland},
  'italian-occupation': {label:'Italian occupation / incorporation claim',color:'#B4AF8D',pattern:'civil-dots'},
  'romanian-military': {label:'Romanian military authority / return claim',color:'#B19B72',pattern:'occupation-hatch'},
  'bulgarian-occupation': {label:'Bulgarian occupation / annexation claim',color:'#B6AD82',pattern:'claim-hatch'},
  'finnish-operational': {label:'Finnish reported forward reach',color:'#9BB29D',pattern:'occupation-hatch'},
  'operational': {label:'German forward operational area · consolidation unresolved',color:'#BFC3C8',pattern:'occupation-hatch'},
  'contested': {label:'Continued resistance / contested area',color:'#BAA1AD',pattern:'contested-cross'},
  'unresolved': {label:'Unresolved status / boundary detail',color:'#CEBFC9',pattern:'contested-cross'}
});

export function territoryColor(record) {
  return ['aligned','independent','neutral'].includes(record.visualCategory)
    ? countryColors[record.militaryControl] || territorialCategories[record.visualCategory].color
    : territorialCategories[record.visualCategory]?.color || '#CEBFC9';
}

export const historicalLayerGroups = Object.freeze({
  capitals: ['capital-stars', 'capital-labels'],
  control: ['neighbors-fill', 'neighbors-pattern', 'control-fill', 'control-pattern', 'control-line'],
  movements: ['advance-axis-line', 'advance-axis-head', 'army-axis-label', 'army-group-label', 'engagement-dot', 'engagement-label'],
  places: ['places-dot', 'places-local-dot', 'places-major-label', 'places-minor-label', 'places-local-label'],
  rivers: ['rivers-line', 'rivers-label', 'lakes-label'],
  boundary: ['boundary-line', 'history-line','reference-border-line'],
  neighbors: ['neighbors-border-halo', 'neighbors-line', 'neighbor-country-labels', 'neighbor-minor-labels','neighbor-primary-labels'],
  countries:['neighbor-country-labels','neighbor-primary-labels','neighbor-minor-labels','country-subtitle'],
  formations:['formation-symbol','formation-label','formation-detail-label'],
  alignment:['alignment-line'],
  fronts:['front-halo','front-line'],
  logistics:['logistics-route','logistics-point','logistics-label'],
  relief: ['relief'],
  civilian:['civilian-point','civilian-label','civilian-route'],
  reference:['eastern-reference-fill','eastern-reference-hatch'],
  changes: ['changes-outline']
});
