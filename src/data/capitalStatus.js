export function capitalStatus(capital, date) {
  if (capital.id === 'warsaw' && date >= '1939-09-28') return 'Poland’s historic capital, under German occupation on this date.';
  if (capital.id === 'warsaw') return 'Capital of Poland. This marker identifies the city; it does not represent a military formation.';
  return `Capital of ${capital.capitalOf === 'Soviet Union' ? 'the Soviet Union' : capital.capitalOf}. This marker identifies the city; it does not represent a military formation.`;
}
