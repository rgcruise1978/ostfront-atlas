export function capitalStatus(capital,date) {
 if(capital.kind==='administrative')return `${capital.name} is an administrative seat of ${capital.capitalOf}; this marker does not establish independent state sovereignty.`;
 if(capital.id==='warsaw'&&date>='1939-09-28')return 'Poland’s historic capital, under German occupation. Warsaw’s capital designation is separate from the occupier’s administrative seat at Kraków.';
 const occupationDates={paris:'1940-06-14',brussels:'1940-05-17',amsterdam:'1940-05-15',oslo:'1940-04-09',copenhagen:'1940-04-09',luxembourg:'1940-05-10',belgrade:'1941-04-12',athens:'1941-04-27',tirana:'1939-04-07'};
 if(occupationDates[capital.id]&&date>=occupationDates[capital.id])return `National or historic capital of ${capital.capitalOf}, under foreign occupation on this date. The marker does not identify the seat of the government in exile.`;
 if(capital.id==='riga'&&date>='1941-07-01')return 'Latvia’s historic capital, reached by German forces on July 1. German military control does not establish German sovereignty.';
 if(capital.id==='kaunas'&&date>='1941-06-25')return 'Lithuania’s interwar governmental seat, under German military occupation after the opening advance. Its capital role and military control are separate.';
 if(['riga','tallinn','kaunas'].includes(capital.id)&&date>='1940-06-17')return `Historic capital or governmental seat of ${capital.capitalOf}, under Soviet occupation and disputed incorporation. Later fighting is shown in the operational layers.`;
 return `Capital or governmental seat of ${capital.capitalOf==='Soviet Union'?'the Soviet Union':capital.capitalOf}. This is a city designation, not a military position.`;
}
