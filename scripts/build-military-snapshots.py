"""Dated, generalized interpretations of printed operational situation maps.

These are reported forward operational areas, not interpolated daily fronts,
secure occupation, or annexation boundaries. No source map artwork is shipped.
Run after the two European foundation scripts.
"""
import json
from pathlib import Path
from shapely import make_valid
from shapely.geometry import shape, mapping, Polygon, Point, LineString
from shapely.ops import unary_union, orient

ROOT=Path(__file__).resolve().parents[1];DATA=ROOT/'public/data/history'
read=lambda p:json.loads(p.read_text())
write=lambda p,d:p.write_text(json.dumps(d,ensure_ascii=False,separators=(',',':'))+'\n')
G={f['properties']['id']:shape(f['geometry']) for f in read(DATA/'europe-geometries.geojson')['features']}
STATES=[r for r in read(ROOT/'src/data/territorial-states.json') if not r['id'].startswith('treaty-sector-')]
CHANGES=[r for r in read(ROOT/'src/data/territorial-changes.json') if not r['id'].startswith('military-')]
OPS=read(DATA/'advance-axes.geojson')['features'];CONTROL=[];DIFF=[]
DATES=['1941-06-21','1941-06-22','1941-06-25','1941-06-28','1941-07-01','1941-07-03','1941-07-06','1941-07-09']
SHEETS=dict(zip(DATES,[4,5,8,11,14,16,19,22]))
TITLES=['Before the Storm','Barbarossa Begins','First Counterattacks','Encirclement of Minsk','War Spreads East','Soviet Union Responds','Battle Beyond Minsk','Eighteen Days of War']
source=lambda date:'loc-lage-'+date
FC=lambda fs:{'type':'FeatureCollection','features':fs}

def clean(g):
    g=make_valid(g)
    if g.geom_type=='GeometryCollection':g=unary_union([x for x in g.geoms if x.geom_type in ['Polygon','MultiPolygon']])
    return g
def feature(id,title,g,date,actor='Germany',category='advance_axis',region='',note='',sources=None,**extra):
    return {'type':'Feature','geometry':mapping(g),'properties':{'id':id,'title':title,'name':title,'label':title,'actor':actor,'category':category,'snapshots':[date],'startDate':date,'endDate':date,'region':region,'sourceIds':sources or [source(date)],'accuracy':'Generalized operational interpretation; regional scale','uncertainty':'Source-reported direction or area. Waypoints and edges are approximate, not surveyed unit routes, headquarters or consolidated control. German situation reporting may misidentify Soviet formations.','note':note,**extra}}
def axis(id,title,points,date,region,note,actor='Germany',sources=None):
    OPS.append(feature(id,title,LineString(points),date,actor,region=region,note=note,sources=sources,movementStatus='reported operational direction'))
def marker(id,title,xy,date,note,actor='Soviet Union',region='',sources=None,category='engagement',**extra):
    OPS.append(feature(id,title,Point(xy),date,actor,category,region,note,sources,**extra))
def area(id,title,g,date,category='operational',actor='Germany',sources=None,note=''):
    colors={'operational':'#BFC3C8','contested':'#BAA1AD','soviet-occupation':'#CA8583','german-military':'#BEC3C7'}
    CONTROL.append(feature(id,title,clean(g),date,actor,'military_area',note=note,sources=sources,color=colors[category],pattern='contested-cross' if category=='contested' else 'soviet-hatch' if actor=='Soviet Union' else 'occupation-hatch',visualCategory=category,militaryControl='Continued resistance; surrounding Axis advance' if category=='contested' else 'Reported forward operational reach; consolidation unresolved',sovereigntyStatus='Pre-invasion sovereignty is retained in the underlying reference layer',occupationAdministration='No civilian annexation or occupation administration inferred from forward positions',annexationClaim='None established by this operational area'))
def register(date,name,ids,sources,description,previous='Previous reported military situation',new='New reported forward positions; occupation not presumed'):
    CHANGES.append({'id':'military-'+date,'eventDate':date,'territory':name,'previousControl':previous,'newControl':new,'previousAdministration':'No change inferred','newAdministration':'No change inferred','sovereigntyOrClaim':'Operational change does not transfer sovereignty','sourceIds':sources,'featureIds':ids,'effectiveVisualizationDate':date,'snapshotDate':date,'uncertainty':'Comparison of generalized source-reported areas. Highlighted edges do not establish a precise front or secure control.','description':description})

# Poland: opening Allied participation, without backdating later transfers.
for title,points in [('Army Bernolák · Tatra direction',[(20.24,49.17),(20.10,49.34),(20.10,49.48)]),('Slovak forces · Muszyna direction',[(21.06,49.17),(20.90,49.35),(20.96,49.47)])]:
    axis('slovak-1939-'+str(len(OPS)),title,points,'1939-09-01','south','Slovak participation under Ferdinand Čatloš; broad opening directions. The third division’s later advance through Dukla is not backdated to September 1.',actor='Slovakia',sources=['map-slovak-operations','us-army-polish-campaign'])
marker('slovak-command-1939','Army Bernolák · Čatloš',[20.65,49.05],'1939-09-01','Slovak field-army sector label, not headquarters.',actor='Slovakia',region='south',sources=['map-slovak-operations'],category='army_group')
# The U.S. Army map explicitly records the early morning of September 17.
p17=clean(G['poland'].intersection(Polygon([(-5,55),(22.2,55),(23.0,54.0),(23.9,53.2),(24.1,52.2),(24.05,51.2),(24.2,50.6),(24.1,49.7),(24.1,49.1),(23.7,48.8),(-5,48),(-5,55)])))
area('poland-german-reach-1939-09-17','German reported operational reach · early 17 September',p17,'1939-09-17',sources=['map-poland-september-17'],note='Generalized from U.S. Army map 10 and the operational account. German forward formations had reached Brest and eastern Galicia; Warsaw, Modlin, the Bzura forces and Lwów still resisted. This area is neither a secure occupation perimeter nor the September 28 treaty division.')
for name,points in [('Warsaw–Modlin resistance',[(20.5,52.48),(20.95,52.62),(21.35,52.35),(21.28,52.02),(20.63,52.0),(20.5,52.48)]),('Bzura fighting',[(19.1,52.45),(19.75,52.65),(20.35,52.46),(20.2,52.12),(19.45,52.0),(19.1,52.45)]),('Lwów defence',[(23.65,49.98),(24.18,49.99),(24.3,49.66),(23.78,49.62),(23.65,49.98)])]:
    area('poland-resistance-'+str(len(CONTROL)),name,Polygon(points).intersection(p17),'1939-09-17','contested','Poland',sources=['map-poland-september-17'],note='Indicative location of continued Polish resistance shown in the September 17 account; the patch does not reconstruct an exact pocket perimeter.')
register('1939-09-17','Polish campaign',['poland-german-reach-1939-09-17'],['map-poland-september-17','ushmm-invasion-poland'],'German forward reach is shown with surviving Polish resistance. Soviet arrows mark the second invasion and distinguish planned objectives from positions actually reached.')
DIFF.append(feature('change-poland-17','Reported German operational reach',p17,'1939-09-17',sources=['map-poland-september-17'],snapshotDate='1939-09-17'))
# Political division is explicitly separate from a military front on the 28th.
for geo,actor,visual in [('poland-german-west','Germany','german-military'),('poland-soviet-east','Soviet Union','soviet-occupation')]:
    STATES.append({'id':'treaty-sector-'+actor.lower().replace(' ','-'),'name':actor+' · occupied Polish treaty sector','historicalName':'Occupied Poland','geometryRef':geo,'entity':'Poland','sovereigntyStatus':'Polish sovereignty; imposed German–Soviet treaty division','militaryControl':actor+' occupation; exact local handover positions unresolved','occupationAdministration':'Military occupation; later October / November arrangements not backdated','annexationClaim':'September 28 division agreement, not recognized Polish consent','politicalAlignment':'Occupied Poland','startDate':'1939-09-28','endDate':'1939-09-28','sourceIds':['ghdi-1939-partition-map','us-army-polish-campaign','ushmm-german-soviet-pact'],'accuracy':'Generalized treaty-assigned occupation sector, not actual military front','uncertainty':'These boundaries identify the agreed division. Withdrawals and handovers were still occurring; surviving Polish forces remained. Do not infer precise army positions from the fill.','visualCategory':visual,'note':'The principal gray/red association records the occupying powers. The treaty border is political; the October General Government and November Soviet incorporation acts are not shown prematurely.','labelCoordinates':[20.0,52.0] if actor=='Germany' else [25.2,52.5]})
    DIFF.append(feature('change-treaty-'+geo,'Treaty division agreement',G[geo],'1939-09-28',actor,sources=['ghdi-1939-partition-map'],snapshotDate='1939-09-28'))
for id,name,xy in [('modlin','Modlin still resisting',[20.68,52.44]),('hel','Hel still resisting',[18.80,54.60]),('kock','Polish forces · Polesie / Kock sector',[22.45,51.75])]:
    marker('resistance-28-'+id,name,xy,'1939-09-28','Continued Polish resistance; the treaty’s signature did not end the campaign. This marker indicates a locality or broad sector, not an exact deployment.',actor='Poland',sources=['us-army-polish-campaign'])
marker('warsaw-surrender-28','Warsaw surrender',[21.01,52.23],'1939-09-28','Warsaw’s surrender and the treaty signed in Moscow are separate events on the same date.',actor='Poland',sources=['ushmm-invasion-poland'])
register('1939-09-28','Polish treaty sectors',['poland-german-west','poland-soviet-east'],['ghdi-1939-partition-map','ushmm-german-soviet-pact'],'The revised political division is outlined; it is not presented as the precise military front. Modlin, Hel and Polish field forces remained in resistance.')

# Each envelope follows city-anchored reported reach on that printed sheet.
# Nothing is interpolated between sheets. The Soviet mask prevents recoloring
# neutral / allied territory or cutting the German core with a display rectangle.
sov=unary_union([G[r['geometryRef']] for r in STATES if r['startDate']<='1941-06-21'<=r['endDate'] and r['militaryControl']=='Soviet Union'])
EDGES={
'1941-06-22':[(21.1,56.0),(22.4,55.35),(23.6,54.7),(24.1,54.35),(24.0,53.5),(24.3,52.15),(24.2,51.5),(24.55,50.65),(24.3,50.05),(23.75,49.5),(23.0,48.5)],
'1941-06-25':[(21.5,56.7),(23.7,56.15),(24.9,55.9),(25.65,55.3),(26.55,54.55),(26.15,53.9),(26.35,53.15),(25.45,52.3),(25.2,51.3),(25.65,50.6),(25.85,50.2),(24.25,49.55),(23.8,48.5)],
'1941-06-28':[(22.0,57.0),(24.25,56.7),(25.4,56.5),(27.0,55.95),(27.4,55.1),(28.1,54.15),(28.2,53.85),(27.65,53.1),(26.0,52.2),(25.6,51.6),(26.6,50.65),(26.5,50.2),(24.35,49.6),(24.05,48.5)],
'1941-07-01':[(22.0,57.6),(24.25,57.15),(25.7,57.2),(27.05,56.75),(27.7,55.5),(28.8,54.25),(29.35,53.15),(28.0,52.7),(26.3,52.2),(26.4,51.5),(26.75,50.65),(26.5,50.0),(25.45,49.55),(24.9,48.45)],
'1941-07-03':[(22.0,58.0),(25.5,57.55),(27.75,57.35),(28.0,56.75),(28.5,55.2),(29.5,54.7),(29.7,53.3),(28.9,52.65),(27.0,52.3),(27.2,51.6),(27.55,50.65),(27.25,50.0),(26.0,49.5),(25.5,48.45)],
'1941-07-06':[(22.0,58.4),(26.0,57.9),(28.4,57.6),(28.85,56.9),(29.35,55.5),(29.7,54.85),(29.85,54.0),(29.9,53.3),(29.3,52.65),(27.2,52.3),(27.55,51.6),(28.35,50.7),(28.25,49.9),(27.4,49.25),(26.2,48.45)],
'1941-07-09':[(22.0,58.85),(25.5,58.3),(28.5,58.0),(29.5,56.6),(30.3,55.25),(30.35,54.8),(30.15,54.4),(30.1,53.8),(30.15,53.3),(29.65,52.65),(28.0,52.25),(28.1,51.6),(29.0,50.25),(28.9,49.8),(28.0,49.2),(27.2,48.4)]}
AXES={
'1941-06-21':([[(21.5,54.85),(22.2,55.2)],[(22.7,53.1),(23.3,53.3)],[(23.25,50.0),(23.7,50.15)]]),
'1941-06-22':([[(22.0,55.1),(22.8,55.4)],[(23.5,53.5),(24.1,53.4)],[(23.65,50.5),(24.45,50.65)]]),
'1941-06-25':([[(22.8,55.4),(23.75,55.95),(25.3,55.75)],[(24.4,53.0),(25.45,53.1),(26.25,53.2)],[(24.6,50.65),(25.4,50.75),(25.7,50.45)]]),
'1941-06-28':([[(25.3,55.75),(26.53,55.88),(26.8,56.15)],[(26.4,53.3),(27.2,53.85),(27.6,53.9)],[(25.45,50.7),(26.0,50.4),(26.5,50.25)]]),
'1941-07-01':([[(24.0,56.5),(24.11,56.95),(25.0,57.05)],[(27.6,53.9),(28.3,54.15),(28.7,54.2)],[(24.0,49.84),(24.85,49.65),(25.4,49.5)]]),
'1941-07-03':([[(26.5,55.9),(27.3,56.5),(27.75,57.2)],[(28.2,54.7),(28.7,54.9),(29.25,54.9)],[(26.0,50.4),(27.0,50.55),(27.5,50.6)]]),
'1941-07-06':([[(27.6,57.3),(28.35,57.34),(28.4,57.6)],[(28.8,54.9),(29.3,54.85),(29.65,54.8)],[(27.0,50.6),(27.7,50.3),(28.1,50.2)]]),
'1941-07-09':([[(28.35,57.34),(28.33,57.82),(28.6,57.9)],[(29.2,55.0),(29.85,55.15),(30.2,55.19)],[(28.1,50.2),(28.66,50.25),(28.8,50.1)]])}
previous=Polygon()
for date in DATES:
    for i,(region,group,unit) in enumerate([('north','Army Group North','Panzer Group 4'),('center','Army Group Center','Panzer Groups 3 and 2'),('south','Army Group South','Panzer Group 1')]):
        route=AXES[date][i]
        if date!='1941-06-21':axis('barbarossa-'+region+'-'+date,group+' · '+unit,route,date,region,'Broad direction reported on the printed evening situation sheet. This arrow ends near reported forward activity; it is not a complete route, headquarters location or proof of secure control.')
        marker('command-'+region+'-'+date,group,({'north':[21.5,54.85],'center':[21.5,52.9],'south':[22.2,50.5]}[region] if date=='1941-06-21' else {'north':[20.0,55.5],'center':[22.5,52.9],'south':[23.6,48.7]}[region]),date,'Army-group operational sector. Army and panzer-group symbols on the source map corroborate the grouping; the label is not a headquarters location.',actor='Germany',region=region,category='army_group')
        marker('panzer-'+region+'-'+date,unit,({'north':[21.5,54.85],'center':[21.5,52.9],'south':[22.2,50.5]}[region] if date=='1941-06-21' else route[-1]),date,'Source-reported grouping / forward sector; city control must be checked against the separate dated events.',actor='Germany',region=region,category='army_label')
    if date=='1941-06-21':continue
    edge=EDGES[date];g=clean(sov.intersection(Polygon([(-10,edge[0][1]),*edge,(-10,edge[-1][1]),(-10,edge[0][1])])))
    # Retain the connected mainland envelope. Disconnected Baltic islands
    # (still Soviet-held in this phase) and digitization slivers are excluded.
    main=max(g.geoms,key=lambda p:p.area) if hasattr(g,'geoms') else g
    g=orient(Polygon(main.exterior).simplify(.02,preserve_topology=True),sign=1.0)
    area('reach-'+date,'German forward operational area · '+date,g,date,note='Regional interpretation of the dated German General Staff situation sheet. The outer edge summarizes reported forward reach, not a continuous verified front. Separate resistance patches and events prevent encirclement from being equated with consolidated occupation.')
    gained=clean(g.difference(previous))
    if not gained.is_empty:DIFF.append(feature('gain-'+date,'New reported operational reach since previous snapshot',gained,date,snapshotDate=date))
    previous=g
    if '1941-06-28'<=date<='1941-07-03':
        pocket=Polygon([(23.2,53.6),(24.15,54.0),(25.35,53.9),(26.15,53.65),(26.2,53.1),(25.2,52.8),(24.2,52.8),(23.2,53.6)]) if date=='1941-06-28' else Polygon([(24.3,53.75),(25.6,53.7),(26.4,53.8),(26.2,53.1),(25.15,52.9),(24.3,53.2),(24.3,53.75)])
        area('pocket-'+date,'Białystok–Minsk encircled forces · resistance continues',pocket.intersection(g),date,'contested',actor='Soviet Union',note='Source sheets show trapped Soviet formations and continued fighting behind German forward elements. The indicative patch summarizes the pocket region; it is not a precise tactical perimeter.')
    register(date,'Barbarossa operational theatre',['reach-'+date],[source(date)],'Reported German forward activity shifts east. Continued Soviet resistance and counterattacks remain separate from the operational envelope.')

# The southwestern Baltic port resisted after the leading advance passed it.
for date in ['1941-06-25','1941-06-28']:
    marker('liepaja-'+date,'Liepāja · continued Soviet resistance',[21.01,56.51],date,'Liepāja’s defenders continued fighting while German leading formations advanced farther east; a forward envelope is not secure occupation.',region='north')
# Dated engagements and allied directions, corroborated by the same sheets.
for date in ['1941-06-22','1941-06-25','1941-06-28']:
    marker('brest-resistance-'+date,'Brest fortress · resistance',[23.66,52.08],date,'Soviet defenders remained in the fortress after German formations passed east. The city and isolated fortress resistance are different military facts.',region='center')
for date in ['1941-06-25','1941-06-28']:
    axis('dubno-counterattack-'+date,'Soviet counterattacks · Lutsk–Dubno–Brody',[(26.05,50.5),(25.8,50.42),(25.45,50.35)],date,'south','Broad counterattack direction in the southern tank battles; Soviet corps routes and outcomes varied.',actor='Soviet Union')
    marker('dubno-fighting-'+date,'Dubno–Brody fighting',[25.74,50.42],date,'German forward penetration did not end Soviet counterattacks in the Lutsk–Dubno–Brody region.',region='south')
marker('daugava-bridgehead','Daugavpils · Dvina bridgehead',[26.53,55.88],'1941-06-28','A bridgehead across the Western Dvina was established on June 26; it appears on the next existing snapshot, June 28.',actor='Germany',region='north')
marker('riga-1941-07-01','Riga · German entry',[24.11,56.95],'1941-07-01','The July 1 sheet reports the German advance at Riga; this event is not backdated to June 28.',actor='Germany',region='north')
for date in ['1941-07-06','1941-07-09']:
    axis('lepel-counterstroke-'+date,'Soviet 5th / 7th Mechanized Corps · Lepel–Senno',[(30.3,54.85),(29.7,54.8),(29.25,54.9)],date,'center','The July counterstroke is shown as a Soviet operation amid German forward activity. Formation identification comes from source intelligence and remains qualified.',actor='Soviet Union')
    marker('rear-resistance-'+date,'Scattered Soviet forces behind the advance',[27.4,53.4],date,'The German situation sheets continue to mark enemy remnants in the rear. Their presence is retained without inventing a securely bounded pocket.',region='center')
for date in ['1941-07-03','1941-07-06','1941-07-09']:
    axis('romanian-prut-'+date,'Romanian armies · Prut offensive',[(27.2,47.1),(27.5,47.25),(27.9,47.7 if date=='1941-07-09' else 47.45)],date,'south','The main German–Romanian offensive across the Prut began July 2. These are broad reported directions; the whole of Bessarabia is not colored reconquered.',actor='Romania')
for date in ['1941-07-06','1941-07-09']:
    axis('slovak-1941-'+date,'Slovak forces · western Ukraine',[(23.5,49.0),(24.05,49.05),(24.6,49.1)],date,'south','Slovak formations are separately identified on the German sheet. The arrow is a broad sector direction, not a surveyed itinerary.',actor='Slovakia')
    axis('hungarian-1941-'+date,'Hungarian mobile corps · Dniester direction',[(24.0,48.5),(24.7,48.65),(25.4,48.7)],date,'south','Hungarian forces are separately identified on the situation sheet; independent allied forces are not treated as German provinces.',actor='Hungary')
for date in DATES:
    marker('hanko-'+date,'Hanko · Soviet naval lease',[22.97,59.83],date,'The March 1940 peace treaty leased Hanko to the USSR. This symbol records the enclave; its exact perimeter and smaller Gulf islands are not digitized.',sources=['map-finland-peace'])
    for district,xy in [('Spisz',[20.21,49.40]),('Orawa',[19.60,49.51])]:
        marker('slovak-transfer-'+district+'-'+date,district+' · transferred November 21, 1939',xy,date,'Polish border districts transferred by Germany to Slovakia. The event and location are verified; the precise transferred perimeter remains unresolved. These markers do not appear on October 26.',actor='Slovakia',sources=['map-slovak-campaign'],eventDate='1939-11-21')
    marker('athens-shared-'+date,'Athens · shared German–Italian occupation',[23.73,37.98],date,'Athens had shared German and Italian occupation arrangements. The country-scale zone geometry does not resolve this urban exception.',actor='Germany',sources=['map-greece-zones'])
marker('lodz-october','Łódź · still General Government',[19.46,51.77],'1939-10-26','Łódź remained in the General Government on October 26. Transfer into the German incorporation administration followed November 9. Its October district boundary is not digitized.',actor='Germany',sources=['occ-administrative-chronology','occ-grochowina'])

# Outline political / administrative changes using their own geometry references.
for change in CHANGES:
    if change['id'].startswith('military-'):continue
    for ref in change['featureIds']:
        if ref in G:DIFF.append(feature('change-'+change['id']+'-'+ref,change['territory'],G[ref],change['snapshotDate'],sources=change['sourceIds'],snapshotDate=change['snapshotDate'],note=change['description']))
write(DATA/'military-control.geojson',FC(CONTROL));write(DATA/'military-operations.geojson',FC(OPS));write(DATA/'territorial-changes.geojson',FC(DIFF))
write(ROOT/'src/data/territorial-states.json',STATES);write(ROOT/'src/data/territorial-changes.json',CHANGES)
timeline=read(ROOT/'src/data/barbarossa-timeline.json')
for event in timeline:
    date=event['date'];event['snapshotStatus']='source-qualified-operational-reference'
    event['geographicFeatureIds']=[f['properties']['id'] for f in OPS+CONTROL if date in f['properties']['snapshots']]
    event['sourceIds']=list(dict.fromkeys(event['sourceIds']+[source(date)]))
write(ROOT/'src/data/barbarossa-timeline.json',timeline)
index={}
for date in ['1939-08-23','1939-09-01','1939-09-17','1939-09-28','1939-10-26']+DATES:
    active=[f for f in OPS if date in f['properties']['snapshots']]
    index[date]={'movementActors':sorted({f['properties']['actor'] for f in active if f['geometry']['type']=='LineString'}),'controlCategories':sorted({f['properties']['visualCategory'] for f in CONTROL if date in f['properties']['snapshots']}),'operations':len(active),'areas':len([f for f in CONTROL if date in f['properties']['snapshots']])}
write(ROOT/'src/data/map-snapshot-index.json',index)
print(f'Military layers: {len(CONTROL)} areas, {len(OPS)} operations/events, {len(DIFF)} comparison outlines; eight source-dated snapshots.')
