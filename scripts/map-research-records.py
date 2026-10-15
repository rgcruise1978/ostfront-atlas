"""Dated original regional interpretations; run through upgrade-map-system.py.

City anchors summarize operational reach. Lines are not digitized tactical
fronts. Last five August situations are documentary syntheses, not falsely
attributed to inaccessible LOC sheets. Feature notes retain that distinction.
"""
from datetime import date as dt

for date,sheet in [('1941-07-10',23),('1941-07-16',29),('1941-07-23',36)]:
 source('loc-lage-'+date,'German Army General Staff · Library of Congress',f'Der Feldzug gegen Sowjet-Russland (1942), sheet {sheet}: Lage am {int(date[8:])}.7.1941 abds.',f'https://www.loc.gov/resource/g7001sm.gct00491/?sp={sheet}','Printed evening title and operational symbols inspected in the full-resolution Commons mirror. German reporting and assessed Soviet positions are qualified; original generalized interpretation, not redistributed map artwork.')
source('atlas-july30-map','George E. Blau · U.S. Department of the Army','The German Campaign in Russia (1955), Map 8: Situation on 30 July 1941, facing printed p. 57','https://www.landsurvival.com/MANUALS/UsArmyWwiiGermanPlanOpsRussia1940-421955.pdf','The map plate was visually inspected. It supports broad deployment and operational relationships around Luga, Smolensk, Gomel, Kiev, Uman and Odessa; not a surveyed tactical front.')
source('atlas-heinrichs','Mannerheim historical resource · Finnish museum collaboration','Erik Heinrichs: Army of Karelia command, 29 June 1941–29 January 1942','https://www.mannerheim.fi/10_ylip/s_heinri.htm','Finnish biographical entry, paragraph on wartime appointments: Heinrichs commanded the Army of Karelia from 29 June 1941 to 29 January 1942. This verifies command identity; the map point is an explicitly generalized sector anchor.')
P2_SOURCES={
 '1941-07-10':['loc-lage-1941-07-10','p2-sbd37-054'],
 '1941-07-16':['loc-lage-1941-07-16','p2-sbd37-060','p2-sbd37-140'],
 '1941-07-23':['loc-lage-1941-07-23','p2-sbd37-064','p2-sbd37-025'],
 '1941-07-30':['atlas-july30-map','blau-planning'],
 '1941-08-06':['p2-sbd39-195','p2-sbd39-197','p2-sbd39-200','blau-planning','cmh-blitz'],
 '1941-08-12':['p2-11army-diary','p2-sbd40-001','p2-sbd40-182','blau-planning'],
 '1941-08-19':['p2-gomel-19','p2-gomel-20','p2-sbd40-047','p2-11army-diary','blau-planning'],
 '1941-08-21':['p2-gomel-21','p2-sbd40-047','p2-11army-diary','blau-planning','cmh-blitz'],
 '1941-08-25':['p2-sbd41-001','p2-11army-diary','cmh-blitz','p2-hiio-kiviloo','p2-tallinn-mobilisation']}

# Changes of effective occupation in territories that already carry disputed
# Soviet incorporation claims. Country identity and claims survive the change.
import copy
for ident,start,actor,category,note,ss in [
 ('soviet-lithuania','1941-07-01','Germany','german-military','German occupation replaces Soviet military control; Lithuanian sovereignty and the earlier Soviet incorporation claim remain distinct.',['loc-lage-1941-07-01','cmh-blitz']),
 ('soviet-latvia','1941-07-10','Germany','german-military','German occupation after the Latvian mainland advance. Riga was reached on July 1; isolated local resistance does not confer Soviet control of the entire state.',['loc-lage-1941-07-10']),
 ('soviet-bessarabia','1941-07-30','Romania','romanian-military','Romanian military control after the July reconquest; the Romanian return claim, prior Soviet incorporation and military authority are separate.',['loc-lage-1941-07-23','atlas-july30-map','blau-planning'])]:
 old=next(r for r in states if r['id']==ident)
 new=copy.deepcopy(old);new.update(id=ident+'-later-control',startDate=start,militaryControl=actor,controller=actor,visualCategory=category,subtitle=actor+' military occupation',occupationAdministration=actor+' wartime occupation; no precise civil district perimeter inferred',sourceIds=ss,note=note,alignmentByPeriod=[dict(startDate=start,endDate='1941-08-25',key='axis',label=actor+' military authority')])
 old['endDate']=(dt.fromisoformat(start)-__import__('datetime').timedelta(days=1)).isoformat()
 states.append(new)

# Regional operational edges follow source-supported cities and sectors.
# An edge across a reporting gap remains explicitly generalized; no continuous
# observed front, secure occupation, or exact headquarters is claimed.
EDGES={
 '1941-07-10':[(24.6,58.4),(25.7,58.5),(26.8,58.4),(28.2,58.0),(28.5,57.6),(29.6,56.5),(30.5,55.4),(30.45,55.1),(30.7,54.8),(30.45,54.15),(30.4,53.7),(30.5,53.25),(30.2,52.75),(29.2,52.1),(28.1,51.4),(28.65,50.75),(29.65,50.5),(30.0,50.25),(29.4,49.8),(28.2,49.3),(27.1,48.7),(27.2,48.0),(28.0,47.4),(28.1,46.8),(28.4,46.2),(28.1,45.5)],
 '1941-07-16':[(24.8,58.6),(25.6,58.7),(26.5,58.6),(27.4,58.4),(28.2,58.5),(28.8,58.6),(29.6,58.4),(29.9,58.1),(30.1,57.5),(30.7,56.9),(30.6,56.0),(31.3,55.6),(32.2,55.2),(32.65,54.95),(32.05,54.78),(31.5,54.4),(31.0,53.9),(30.9,53.4),(30.6,52.9),(29.7,52.4),(28.5,51.6),(29.5,50.95),(30.0,50.65),(30.25,50.35),(29.7,49.9),(29.4,49.4),(28.7,48.8),(28.0,48.2),(28.4,47.5),(28.8,47.0),(28.85,46.6),(28.7,46.1),(28.3,45.5)],
 '1941-07-23':[(24.4,58.75),(25.0,58.85),(26.1,58.75),(27.2,58.8),(28.0,58.8),(28.8,58.7),(29.3,58.7),(29.8,58.5),(30.1,58.1),(30.7,57.4),(30.8,56.8),(31.1,56.2),(31.6,55.7),(32.3,55.4),(32.9,55.0),(33.2,54.6),(33.18,54.4),(32.7,54.1),(32.2,53.8),(31.4,53.6),(30.8,53.3),(30.5,52.8),(29.8,52.3),(28.8,51.6),(29.6,51.0),(30.2,50.8),(30.35,50.5),(30.1,50.1),(30.15,49.6),(30.1,49.1),(29.7,48.7),(29.2,48.2),(29.0,47.8),(29.4,47.4),(29.65,46.9),(29.8,46.3),(29.3,45.5)],
 '1941-07-30':[(24.4,59.1),(25.1,59.2),(26.0,59.1),(27.3,59.2),(28.1,59.3),(28.8,59.05),(29.4,58.9),(29.8,58.6),(30.25,58.35),(30.6,58.05),(30.6,57.4),(30.6,56.8),(31.1,56.45),(31.8,55.9),(32.6,55.4),(33.1,55.0),(33.35,54.6),(33.25,54.3),(32.5,53.8),(31.5,53.6),(30.85,53.2),(30.7,52.7),(30.3,52.2),(29.2,51.5),(29.8,50.95),(30.35,50.6),(30.4,50.2),(31.05,49.6),(31.0,49.2),(30.6,48.8),(30.9,48.2),(30.4,47.9),(29.75,47.55),(29.6,46.9),(30.0,46.4),(29.7,45.5)],
 '1941-08-06':[(24.0,59.2),(24.8,59.3),(25.8,59.35),(26.5,59.45),(27.5,59.45),(28.4,59.4),(28.9,59.2),(29.5,58.85),(30.0,58.5),(30.6,58.1),(31.1,57.6),(31.1,57.0),(31.7,56.6),(32.0,56.0),(32.7,55.5),(33.2,55.0),(33.35,54.6),(33.3,54.2),(32.9,53.95),(32.2,53.6),(31.3,53.3),(30.8,52.7),(30.4,52.2),(29.5,51.55),(30.0,51.0),(30.4,50.6),(30.4,50.2),(31.2,49.8),(31.7,49.4),(31.6,48.7),(31.0,48.1),(30.8,47.55),(30.6,47.0),(30.1,46.6),(29.9,46.0),(29.8,45.5)],
 '1941-08-12':[(23.8,59.2),(24.5,59.3),(25.2,59.4),(26.1,59.4),(27.3,59.45),(28.5,59.45),(29.1,59.3),(29.65,58.9),(30.0,58.65),(30.4,58.4),(30.8,58.15),(31.2,58.0),(31.5,57.6),(31.4,57.0),(31.7,56.5),(32.1,55.9),(32.8,55.5),(33.3,55.0),(33.5,54.6),(33.3,54.2),(33.15,53.9),(32.8,53.55),(32.2,53.25),(31.4,52.8),(30.9,52.3),(30.5,51.8),(30.0,51.1),(30.4,50.6),(30.5,50.2),(31.4,49.8),(32.0,49.4),(32.5,49.0),(33.0,48.6),(32.8,48.2),(32.3,47.7),(31.8,47.2),(31.3,46.9),(30.8,46.8),(30.1,46.5),(29.8,45.5)],
 '1941-08-19':[(23.8,59.3),(24.5,59.35),(25.0,59.4),(26.0,59.45),(27.4,59.45),(28.2,59.5),(29.0,59.5),(29.5,59.4),(29.9,59.15),(30.25,58.9),(30.7,58.7),(31.2,58.55),(31.3,58.25),(31.4,57.95),(31.65,57.65),(31.6,57.0),(32.0,56.6),(32.3,55.9),(32.9,55.5),(33.35,55.0),(33.55,54.6),(33.3,54.2),(33.2,53.9),(33.2,53.5),(33.0,53.1),(32.5,52.7),(31.8,52.45),(31.1,52.45),(30.95,51.95),(30.8,51.5),(30.55,50.8),(30.5,50.25),(31.3,49.8),(32.1,49.4),(32.7,49.1),(33.4,48.8),(34.0,48.4),(34.3,47.9),(34.0,47.5),(33.2,47.3),(32.6,47.0),(32.0,46.7),(31.3,46.6),(30.8,46.7),(30.2,46.4),(29.8,45.5)],
 '1941-08-21':[(23.8,59.32),(24.5,59.36),(25.0,59.4),(26.0,59.45),(27.4,59.45),(28.4,59.6),(29.2,59.6),(29.8,59.45),(30.3,59.15),(30.8,58.85),(31.3,58.6),(31.4,58.25),(31.5,57.95),(31.8,57.7),(31.8,57.0),(32.0,56.6),(32.4,55.9),(33.0,55.5),(33.35,55.0),(33.55,54.6),(33.3,54.2),(33.2,53.9),(33.2,53.5),(33.0,53.1),(32.5,52.65),(31.8,52.3),(31.3,52.1),(31.15,51.7),(30.8,51.1),(30.55,50.8),(30.5,50.25),(31.3,49.8),(32.1,49.4),(32.7,49.1),(33.5,48.8),(34.1,48.5),(34.5,48.0),(34.2,47.6),(33.3,47.35),(32.6,47.0),(32.0,46.7),(31.3,46.6),(30.8,46.7),(30.2,46.4),(29.8,45.5)],
 '1941-08-25':[(24.0,59.4),(24.55,59.43),(25.0,59.45),(26.0,59.45),(27.5,59.45),(28.5,59.65),(29.3,59.7),(29.95,59.65),(30.5,59.5),(30.9,59.3),(31.1,59.05),(31.3,58.8),(31.4,58.4),(31.6,58.0),(31.85,57.7),(31.85,57.1),(32.3,56.7),(32.5,56.3),(32.45,56.0),(33.0,55.5),(33.35,55.0),(33.55,54.6),(33.3,54.2),(33.2,53.9),(33.2,53.5),(33.0,53.1),(32.6,52.7),(32.5,52.2),(32.7,51.9),(32.1,51.5),(31.5,51.1),(30.7,50.9),(30.55,50.6),(30.5,50.25),(31.3,49.8),(32.1,49.4),(32.7,49.1),(33.5,48.8),(34.2,48.6),(35.1,48.5),(35.1,48.15),(34.4,47.7),(33.3,47.4),(32.6,47.0),(32.0,46.7),(31.3,46.6),(30.8,46.7),(30.2,46.4),(29.8,45.5)]}

sovmask=unary_union([G[r['geometryRef']] for r in states if r['startDate']<='1941-06-21'<=r['endDate'] and r['militaryControl']=='Soviet Union'])
prev=shape(next(f['geometry'] for f in control if f['properties']['id']=='reach-1941-07-09'))
for date in P2:
 ss=P2_SOURCES[date];edge=EDGES[date]
 reach=make_valid(Polygon([(-2,edge[0][1]),*edge,(-2,edge[-1][1]),(-2,edge[0][1])]).intersection(sovmask))
 # Do not recolour Baltic islands, disconnected enclaves or other countries.
 if reach.geom_type=='MultiPolygon':reach=max(reach.geoms,key=lambda p:p.area)
 if date>='1941-07-30':reach=reach.difference(G[next(r['geometryRef'] for r in states if r['id']=='soviet-bessarabia')])
 reach=make_valid(reach.simplify(.008,preserve_topology=True))
 note=('Interpretation of the inspected printed evening situation sheet and Soviet reports. ' if date<='1941-07-23' else 'Regional documentary synthesis of named operational sectors and the published Army account. ')+('The German source map is available for this date.' if date<='1941-07-23' else 'A complete same-day German situation sheet was not accessible; long connecting segments and positions outside the chapter focus have lower confidence.')+' This light hatched area indicates forward operational reach, not consolidated occupation or a surveyed continuous front. Continuing resistance is shown separately.'
 control.append(feat('reach-'+date,'German / allied operational reach · '+date,reach,date,'Germany','military_area',ss,visualCategory='operational',pattern='occupation-hatch',militaryControl='German and allied operational reach; local consolidation varies',sovereigntyStatus='Pre-invasion territorial identities retained beneath operational shading',occupationAdministration='No new civil administration inferred',annexationClaim='None established by this operational area',note=note,locationType='regional operational synthesis',confidence='regional approximation' if date<='1941-07-30' else 'mixed; individual localities sourced, connecting edge uncertain'))
 # Only displayed front segments around the chapter's verified operational
 # areas; no assertion that every connecting envelope edge is an observed front.
 segments=[('north',[(x,y) for x,y in edge if 57.2<=y<=59.75]),('center',[(x,y) for x,y in edge if 52.1<=y<=56.7]),('south',[(x,y) for x,y in edge if 45.5<=y<=51.1])]
 for region,points in segments:
  if len(points)>1:fronts.append(feat('front-'+region+'-'+date,'Approximate operational contact · '+region,LineString(points),date,'Germany','front',ss,region=region,confidence='approximate sector edge',note=note,locationType='approximate operational contact'))
 gain=make_valid(reach.difference(prev))
 if not gain.is_empty:delta.append(feat('gain-'+date,'New reported reach since previous selected date',gain,date,sources=ss,snapshotDate=date))
 prev=reach
 changes.append(dict(id='military-'+date,eventDate=date,territory='Eastern Front',previousControl='Previous selected operational situation',newControl='New reported operational reach',previousAdministration='No change inferred',newAdministration='No change inferred',sovereigntyOrClaim='Military reach does not transfer sovereignty',sourceIds=ss,featureIds=['reach-'+date],effectiveVisualizationDate=date,snapshotDate=date,uncertainty='Generalized operational synthesis; see individual features for reporting time and limits.',description='Dated operational reach and formations updated; separate resistance and planned movements retained.'))

# Preserve the remaining Soviet-held urban positions as explicit documented
# point events. Do not invent circular pocket boundaries from a city coordinate.
for date in P2:
 ss=P2_SOURCES[date]
 event('kiev-defence','Kiev · Soviet defence continues',[30.52,50.45],date,'south',sources=['cmh-blitz'],note='The city remained Soviet-held through this phase. Nearby operational shading does not depict its surrender or the September encirclement.')
 if date>='1941-08-06':event('odessa-defence','Odessa · Soviet defence / sea connection',[30.73,46.48],date,'south',sources=['p2-sbd40-001','p2-odessa-001066'],note='Odessa remained defended with Black Sea Fleet support. The port was not captured during this phase.')
 event('tallinn-defence','Tallinn · Soviet-held port',[24.75,59.44],date,'north',sources=['p2-tallinn-mobilisation'],note='Land communications were cut on August 7; the major evacuation was August 28–29, after every date in this phase.')
 if date<='1941-07-23':event('mogilev','Mogilev · isolated resistance',[30.34,53.9],date,'center',sources=ss,note='City and surrounding Soviet formations continued resisting during the July battle; city possession and destruction of formations are separate facts.')
 if '1941-07-16'<=date<='1941-08-06':event('smolensk-pocket','Smolensk · fighting / escape routes',[32.05,54.78],date,'center',sources=ss,note='German entry, pocket closure, escape and later clearance have distinct chronologies. This is an identified fighting locality, not a precise pocket perimeter.')
 if date<='1941-07-16':event('soltsy','Soltsy · counterstroke sector',[30.32,58.12],date,'north',sources=['p2-soltsy-records'],note='The Soviet counterstroke began July 14. On July 10 this identifies the later battle locality only; no counterattack is displayed before its start.') if date=='1941-07-16' else None

# German command sectors, systematically dated. Coordinates are deliberately
# representative sectors rather than asserted command-post locations.
all1941=[d for d in DATES if d.startswith('1941')]
for date in all1941:
 ss=P2_SOURCES.get(date,['loc-lage-'+date]);opening=date=='1941-06-21'
 existing=[f for f in ops if date in f['properties'].get('snapshots',[]) and f['geometry']['type']=='LineString' and f['properties'].get('region') in ['north','center','south'] and f['properties'].get('actor')=='Germany']
 if date in P2:
  e=EDGES[date]
  ends={region:next((p for p in e if abs(p[1]-lat)<.22),e[len(e)//2]) for region,lat in [('north',58.5),('center',54.6),('south',49.4)]}
 else:
  ends={region:next((f['geometry']['coordinates'][-1] for f in existing if f['properties']['region']==region),{'north':[22.1,55.4],'center':[23.4,53.5],'south':[23.8,50.1]}[region]) for region in ['north','center','south']}
 names=[('north','Army Group North','Wilhelm von Leeb','Panzer Group 4','Erich Hoepner'),('center','Army Group Centre','Fedor von Bock','Panzer Group 3','Hermann Hoth'),('south','Army Group South','Gerd von Rundstedt','Panzer Group 1','Ewald von Kleist')]
 for region,name,commander,panzer,pc in names:
  x,y=ends[region];anchor={'north':[25.5,56.65],'center':[26.6,53.35],'south':[26.8,48.9]}[region] if not opening else {'north':[21.25,55.0],'center':[21.8,53.2],'south':[22.5,49.6]}[region]
  formation('ag-'+region,name,commander,anchor,date,region,'army-group',sources=[*ss,'atlas-command-oob'])
  formation('pg-'+panzer[-1],panzer,pc,[x-.55,y+.18],date,region,'panzer-group',parent=name,sources=[*ss,'atlas-command-oob'])
  army_rows={'north':[('18th Army','Georg von Küchler',x-1.9,y+.45),('16th Army','Ernst Busch',x-.8,y-.7)],'center':[('9th Army','Adolf Strauss',x-1.2,y+.7),('4th Army','Günther von Kluge',x-1.2,y-.55)],'south':[('6th Army','Walter von Reichenau',x-1.3,y+.9),('17th Army','Carl-Heinrich von Stülpnagel',x-1.6,y-.3),('11th Army','Eugen von Schobert',28.2 if not opening else 26.4,47.15)]}
  for an,ac,ax,ay in army_rows[region]:formation('army-'+an.split()[0],an,ac,[ax,ay],date,region,parent=name,sources=[*ss,'atlas-command-oob'])
  if date in P2 and ((region=='north' and date in ['1941-07-10','1941-07-16','1941-08-12','1941-08-19','1941-08-25']) or (region=='center' and date in ['1941-07-10','1941-07-16']) or (region=='south' and date in ['1941-07-10','1941-07-16','1941-07-23','1941-08-12','1941-08-19'])):
   movement('axis-'+region,name+' · reported direction',[[x-1.0,y-.2],[x-.5,y-.05],[x,y]],date,region,sources=ss,note='General operational axis between the source-supported rear sector and forward area. This does not trace a road route or assert control of the whole intervening area.')
 # Panzer Group 2 operated separately from Hoth's northern mobile grouping.
 cx,cy=ends['center'];gx,gy=(cx-.3,cy-.7)
 if date>='1941-08-06':gx,gy=(32.2,53.7 if date<'1941-08-21' else 52.6)
 formation('pg2','Panzer Group 2','Heinz Guderian',[gx,gy],date,'center','panzer-group',parent='Army Group Centre',sources=[*ss,'atlas-command-oob'])
 if date>='1941-07-10':formation('army2','2nd Army','Maximilian von Weichs',[29.0 if date<'1941-08-19' else 30.4,52.7 if date<'1941-08-19' else 52.2],date,'center',parent='Army Group Centre',sources=['cmh-blitz',*ss])
 # Front labels carry a named commander only where this assignment's
 # inspected records establish it for the period.
 formation('west','Western Special Military District' if opening else 'Western Front','Semyon Timoshenko' if date>='1941-07-10' else 'Dmitry Pavlov' if date<='1941-06-25' else '',[cx+2.1,cy+.35],date,'center','front','Soviet Union',sources=['cmh-blitz',*ss])
 formation('sw','Kiev Special Military District' if opening else 'Southwestern Front','Mikhail Kirponos',[32.4,50.4] if date>='1941-07-10' else [28.5,50.7],date,'south','front','Soviet Union',sources=['cmh-blitz',*ss])
 formation('nw','Baltic Special Military District' if opening else 'Northwestern Front','',[32.7,58.4] if date>='1941-07-10' else [27.8,57.1],date,'north','front','Soviet Union',sources=['cmh-blitz',*ss])
 if date>='1941-07-10':
  formation('northfront','Northern Front' if date<'1941-08-23' else 'Leningrad Front','Markian Popov',[31.0,60.35],date,'north','front','Soviet Union',sources=['cmh-blitz',*ss])
  formation('southfront','Southern Front','Ivan Tyulenev',[33.0,47.9],date,'south','front','Soviet Union',sources=['cmh-blitz',*ss])
  formation('sov11','11th Army','Vasily Morozov',[31.0,57.95] if date<'1941-08-19' else [31.8,57.95],date,'north','army','Soviet Union',parent='Northwestern Front',sources=['p2-11army-diary'])
  formation('sov19','19th Army','Ivan Konev',[32.9,55.2],date,'center','army','Soviet Union',parent='Western Front',sources=['p2-sbd37-060','p2-sbd41-001'])
  formation('sov5','5th Army','Mikhail Potapov',[29.8,51.1] if date<'1941-08-19' else [31.0,51.4],date,'south','army','Soviet Union',parent='Southwestern Front',sources=['p2-sbd40-047','cmh-blitz'])
 if date>='1941-08-19':formation('bryansk','Bryansk Front','Andrei Eremenko',[34.2,53.3],date,'center','front','Soviet Union',sources=['cmh-blitz'])
 if date>='1941-07-03':formation('ro4','Romanian 4th Army','Nicolae Ciupercă',[28.0,47.15] if date<'1941-08-06' else [30.2,46.9],date,'south','army','Romania',sources=['p2-halunga','cmh-blitz'])
 if date>='1941-07-10':formation('fin-karelia','Army of Karelia','Erik Heinrichs',[30.7,62.0],date,'north','army','Finland',sources=['atlas-heinrichs','cmh-blitz'],note='Representative Karelian theatre label. The exact headquarters position and daily tactical line are not asserted.')

# Targeted local formations and movements from the dated Soviet records.
for date in ['1941-07-10','1941-07-16']:
 movement('dnieper-guderian','Panzer Group 2 · Dnieper / Smolensk',[[30.25,54.5],[30.7,54.4],[31.4 if date=='1941-07-10' else 32.05,54.6 if date=='1941-07-10' else 54.78]],date,'center',sources=P2_SOURCES[date])
event('soltsy-counterattack','Soltsy · Soviet counterstroke',[30.32,58.12],'1941-07-16','north',sources=['p2-soltsy-records'])
movement('soltsy-counterattack','11th Army · Soltsy counterattack',[[30.7,58.4],[30.4,58.2],[30.25,58.1]],'1941-07-16','north','Soviet Union','counterattack',sources=['p2-soltsy-records'])
for name,xy,commander in [('Rokossovsky group',[32.7,55.05],'Konstantin Rokossovsky'),('Kachalov group',[32.4,53.65],'Vladimir Kachalov'),('Khomenko group',[32.55,55.7],'Vasily Khomenko')]:
 formation('counter-'+name.split()[0],name,commander,xy,'1941-07-23','center','operational-group','Soviet Union',sources=['p2-sbd37-025','p2-sbd37-064'])
 movement('counter-'+name.split()[0],name+' · assigned attack',[[xy[0]+.4,xy[1]],[xy[0],xy[1]],[32.1,54.8]],'1941-07-23','center','Soviet Union','planned',sources=['p2-sbd37-025'],note='Assigned direction in the order; the arrow does not establish success or arrival at Smolensk.')
for date in ['1941-07-30','1941-08-06']:
 event('uman-fighting','Uman / Podvysokoye · threatened or encircled forces',[30.52,48.55],date,'south',sources=['p2-sbd39-195','atlas-july30-map'])
 formation('sov6','6th Army','Ivan Muzychenko',[30.45,48.6],date,'south','army','Soviet Union',sources=['p2-sbd39-195'])
 formation('sov12','12th Army','Pavel Ponedelin',[30.65,48.65],date,'south','army','Soviet Union',sources=['p2-sbd39-195'])
 if date=='1941-08-06':movement('uman-breakout','6th / 12th Armies · attempted breakout',[[30.55,48.6],[30.78,48.4],[30.95,48.25]],date,'south','Soviet Union','breakout',sources=['p2-sbd39-200'],note='Attempted night breakout reported by Ponedelin; the objective was not a demonstrated escape route.')
for date in ['1941-08-12','1941-08-19']:
 formation('sov34','34th Army','',[31.6,57.6],date,'north','army','Soviet Union',sources=['p2-11army-diary'])
 movement('staraya-counter','Soviet attack south of Staraya Russa',[[31.7,57.8],[31.4,57.75],[31.15,57.8]],date,'north','Soviet Union','counterattack' if date=='1941-08-12' else 'retreat',sources=['p2-11army-diary'],note='August 12 attack and August 19 deterioration are distinguished; the later Lovat withdrawal has its own dated arrow.')
for date in ['1941-08-19','1941-08-21']:
 formation('sov21','21st Army','Vasily Gordov',[31.25,52.4] if date=='1941-08-19' else [31.65,52.15],date,'center','army','Soviet Union',sources=['p2-gomel-19','p2-gomel-21'])
 formation('sov117','117th Rifle Division','',[31.5,52.55] if date=='1941-08-19' else [31.65,52.4],date,'center','division','Soviet Union',sources=['p2-gomel-19','p2-gomel-21'])
 event('gomel','Gomel · German entry / withdrawal',[30.99,52.43],date,'center',sources=['p2-gomel-19','p2-gomel-20'],note='German entry on August 19, Soviet overnight withdrawal on 19–20, and continuing fighting at crossings are separate events.')
 movement('gomel-withdrawal','21st Army · withdrawal toward Iput',[[30.99,52.43],[31.35,52.4],[31.65,52.42]],date,'center','Soviet Union','planned' if date=='1941-08-19' else 'retreat',sources=['p2-gomel-20','p2-gomel-21'],note='On August 19 this is the impending overnight withdrawal; by August 21 the reported defensive line is farther east. Not a surveyed regimental itinerary.')
movement('turn-south-plan','2nd Panzer Group · ordered southern operation',[[32.5,53.3],[32.7,52.65],[32.85,51.9]],'1941-08-21','center','Germany','planned',sources=['blau-planning','cmh-blitz'],note='Strategic decision on August 21; larger advance begins August 25. The September encirclement is not shown completed.')
movement('turn-south-start','2nd Panzer Group · southward advance begins',[[32.45,53.0],[32.7,52.5],[32.8,52.1]],'1941-08-25','center',sources=['cmh-blitz'])
movement('lovat-withdrawal','11th Army · withdrawal behind Lovat',[[31.35,57.95],[31.55,57.95],[31.7,57.95]],'1941-08-25','north','Soviet Union','retreat',sources=['p2-11army-diary'])
for unit,xy,obj in [('29th Army',[32.9,55.85],[31.2,55.6]),('19th Army',[33.1,55.15],[32.4,55.2]),('16th Army',[33.1,54.9],[32.7,54.85]),('20th Army',[33.3,54.5],[32.65,54.7])]:
 movement('stavka-'+unit.split()[0],unit+' · ordered offensive',[[xy[0],xy[1]],obj],'1941-08-25','center','Soviet Union','planned',sources=['p2-sbd41-001'],note='Directive 001254 assigns an offensive objective; the endpoint is not a demonstrated position reached on August 25.')

# Add a second family of inherited borders; retain occupied countries' outlines.
for r in states:
 if r['startDate']<='1939-08-23'<=r['endDate'] and r['visualCategory']!='unresolved':
  borders.append(dict(type='Feature',geometry=mapping(G[r['geometryRef']].boundary),properties=dict(id='reference-'+r['id'],title=r['countryName']+' · 23 August 1939 reference boundary',name=r['countryName'],category='reference_border',sourceIds=r['sourceIds'],snapshots=DATES,startDate=DATES[0],endDate=DATES[-1],referenceDate='1939-08-23',note='Historical reference boundary; later occupation or claims do not erase this outline. It is not the selected-date military front.',accuracy=r['accuracy'],uncertainty=r['uncertainty'])))

# Refine Polish commands without propagating opening deployments into later days.
for name,c,xy in [('Army Group North','Fedor von Bock',[18.4,54.35]),('Army Group South','Gerd von Rundstedt',[17.9,49.9]),('3rd Army','Georg von Küchler',[20.7,53.65]),('4th Army','Günther von Kluge',[17.5,53.5]),('8th Army','Johannes Blaskowitz',[17.4,51.0]),('10th Army','Walter von Reichenau',[18.5,50.7]),('14th Army','Wilhelm List',[20.0,49.4])]:
 formation('pl-german-'+name.split()[0]+name.split()[-1],name,c,xy,'1939-09-01','theatre','army-group' if 'Group' in name else 'army',sources=['us-army-polish-campaign'],note='Opening operational sector from the campaign account; representative anchor, not headquarters coordinates.')
for name,c,xy in [('Army Poznań','Tadeusz Kutrzeba',[17.8,52.3]),('Army Pomorze','Władysław Bortnowski',[18.5,53.1]),('Army Łódź','Juliusz Rómmel',[19.0,51.7]),('Army Kraków','Antoni Szylling',[19.6,50.0]),('Army Modlin','Emil Krukowicz-Przedrzymirski',[20.6,52.85]),('Army Prusy','Stefan Dąb-Biernacki',[20.5,51.4]),('Army Karpaty','Kazimierz Fabrycy',[22.5,49.4])]:
 formation('pl-'+name.split()[-1],name,c,xy,'1939-09-01','theatre','army','Poland',sources=['us-army-polish-campaign'])
for front,c,xy in [('Byelorussian Front','Mikhail Kovalyov',[27.3,54.0]),('Ukrainian Front','Semyon Timoshenko',[26.8,49.7])]:formation('pl-sov-'+front.split()[0],front,c,xy,'1939-09-17','theatre','front','Soviet Union',sources=['us-army-polish-campaign','ushmm-invasion-poland'])
for date in ['1939-09-17','1939-09-28']:
 for name,c,xy in [('Warsaw defence','Juliusz Rómmel',[21.0,52.23]),('Modlin defence','Wiktor Thommée',[20.68,52.44])]:formation('pl-def-'+name.split()[0],name,c,xy,date,'theatre','defence-command','Poland',sources=['us-army-polish-campaign'],note='Named defence command at the identified locality; on September 28 Warsaw was surrendering while Modlin still resisted.')

# Historical communications: schematic city-to-city corridors from inspected
# maps and records; they are not modern road vectors or functioning-rail claims.
source('atlas-period-communications','German General Staff / Soviet operational records / U.S. Army','Historical communication corridors: inspected July 1941 sheets and dated operational reports','https://www.loc.gov/item/map51000141/','Schematic city-to-city railway/road corridors visible on inspected sheets, checked against the chapter records. These generalized axes establish connections, not surveyed tracks, gauge conversion, capacity or serviceability.')
def corridor(id,title,points,dates,kind='rail-corridor',sources=None,note=''):
 for date in dates:
  logistics.append(feat(id+'-'+date,title,LineString(points),date,'',kind,sources or ['atlas-period-communications'],locationType='schematic communications corridor',note=note or 'Historical city-to-city corridor, simplified between verified junctions. This line does not assert the date-specific functioning railhead, track alignment, gauge conversion, throughput or uninterrupted service.'))
corridor('rail-center','Rail corridor · Brest–Minsk–Orsha–Smolensk',[[23.66,52.1],[25.32,53.13],[27.56,53.9],[28.51,54.22],[30.42,54.51],[32.05,54.78]],all1941)
corridor('rail-north','Rail corridor · Daugavpils–Pskov–Luga–Leningrad',[[26.53,55.88],[27.33,57.35],[28.33,57.82],[29.85,58.74],[30.33,59.93]],all1941)
corridor('rail-gomel','Rail corridor · Gomel–Dobrush–Novozybkov–Bryansk',[[30.99,52.43],[31.32,52.4],[31.93,52.54],[34.36,53.25]],P2,sources=['p2-gomel-19','p2-gomel-21','atlas-period-communications'])
corridor('rail-south','Rail corridor · Lwów–Tarnopol–Proskurov–Zhmerynka',[[24.03,49.84],[25.6,49.55],[27.0,49.42],[28.11,49.03]],all1941)
corridor('road-kiev','Road corridor · Zhitomir–Kiev',[[28.66,50.25],[29.29,50.31],[30.52,50.45]],P2,'road-corridor')
corridor('sea-odessa','Odessa–Sevastopol · maritime supply connection',[[30.73,46.48],[31.4,45.8],[32.65,44.9],[33.5,44.6]],[d for d in P2 if d>='1941-08-06'],'sea-route',['p2-sbd40-001'],note='General maritime connection supporting Odessa; not the plotted course of a particular convoy. Shipment capacity and individual sailing dates are not inferred.')
corridor('polish-rail','Rail corridor · Poznań–Warsaw',[[16.93,52.41],[18.2,52.25],[19.36,52.23],[21.01,52.23]],[d for d in DATES if d.startswith('1939')])
for date in P2:
 for id,title,xy,ss in [('orsha','Orsha · Dnieper and rail junction',[30.42,54.51],['atlas-period-communications']),('gomel','Gomel · Sozh crossings and junction',[30.99,52.43],['p2-gomel-19']),('odessa','Odessa · port / evacuation connection',[30.73,46.48],['p2-sbd40-001']),('pola','Pola station · damaged railway reported 3 August',[31.72,57.88],['p2-11army-diary'])]:
  if id=='pola' and date<'1941-08-06':continue
  logistics.append(feat('hub-'+id+'-'+date,title,Point(xy),date,'','logistics_hub',ss,note='Geographical junction or dated reported bottleneck. For Pola the damage report is dated August 3; duration and repair completion remain unknown.',locationType='junction locality'))

# The 17 September invasion axes do not describe movement on treaty day.
for f in ops:
 if f['geometry']['type']=='LineString' and f['properties'].get('title','').startswith(('Soviet Byelorussian Front','Soviet Ukrainian Front')):
  f['properties']['snapshots']=[d for d in f['properties']['snapshots'] if d=='1939-09-17']

ops[:]=[f for f in ops if f['properties']['snapshots']]

# Normalize inherited movements into one visual vocabulary; retain original
# evidence and explicit planned Soviet invasion routes in September 1939.
for f in ops:
 p=f['properties']
 if f['geometry']['type'] not in ['LineString','MultiLineString']:continue
 if 'movementType' not in p:
  text=(p.get('note','')+' '+p.get('title','')).lower()
  p['movementType']='planned' if 'planned' in text or 'assigned' in text else 'counterattack' if 'counter' in text else 'retreat' if 'retreat' in text or 'withdraw' in text else 'advance'
  p['evidenceStatus']='planned' if p['movementType']=='planned' else 'reported'
 p.setdefault('locationType','generalized operational axis')
 p.setdefault('observationDate',p['snapshots'][0]);p.setdefault('commander','')

# Timeline metadata now points to its own dated research, not the June reference.
for e in timelines['barbarossa-phase-ii-timeline']:
 e['snapshotStatus']='documented-regional-synthesis';e['geographicFeatureIds']=['reach-'+e['date']]
 e['sourceIds']=list(dict.fromkeys([*e['sourceIds'],*P2_SOURCES[e['date']]]))
 e['summary']=e['summary'].replace('Research focus: ','')
 e['mapAccuracy']='Regional documentary synthesis. Named positions are supported; connecting operational edges are approximate and do not establish secure occupation.'
finalize()
print('Prepared',len(DATES),'dates;',len(formations),'dated formations;',len(ops),'operations;',len(control),'control areas;',len(logistics),'logistics features')
