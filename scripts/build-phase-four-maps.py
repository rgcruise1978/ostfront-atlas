"""Reproducible, date-specific Phase IV regional reconstruction.
Run with the workspace Shapely Python. Earlier snapshot features and article
bodies are retained byte-for-byte at the feature/content level.
"""
from pathlib import Path
import json,runpy,re,hashlib,copy,math
from html.parser import HTMLParser
from shapely.geometry import shape,mapping,Polygon,Point,LineString,box
from shapely import make_valid
from shapely.ops import unary_union,linemerge,substring
ROOT=Path(__file__).resolve().parents[1];H=ROOT/'public/data/history';D=ROOT/'src/data';OUT=ROOT/'phase-iv-maps-review'
R=runpy.run_path(str(Path(__file__).with_name('phase-four-map-records.py')));P=R['P'];DATES=R['DATES']
read=lambda p:json.loads(p.read_text())
def write(p,d):p.parent.mkdir(exist_ok=True,parents=True);p.write_text(json.dumps(d,ensure_ascii=False,separators=(',',':'))+'\n')
FC=lambda fs:{'type':'FeatureCollection','features':fs}
def clean(g):
 g=make_valid(g)
 if g.geom_type=='GeometryCollection':g=unary_union([x for x in g.geoms if x.geom_type in ['Polygon','MultiPolygon']])
 return g
collections={n:read(H/(n+'.geojson')) for n in ['military-control','military-operations','formation-positions','dated-fronts','historical-logistics','territorial-changes']}
for d in collections.values():d['features']=[f for f in d['features'] if not f['properties']['id'].startswith('p4-')]
geo=read(H/'europe-geometries.geojson');geo['features']=[f for f in geo['features'] if not f['properties']['id'].startswith('p4-')];G={f['properties']['id']:shape(f['geometry']) for f in geo['features']}
states=[r for r in read(D/'territorial-states.json') if not r['id'].startswith('p4-')]
for r in states:
 if r['endDate']=='1941-09-29' and not r['id'].startswith('p3-'):
  r['endDate']=DATES[-1]
  for period in r.get('alignmentByPeriod',[]):
   if period.get('endDate')=='1941-09-29':period['endDate']=DATES[-1]
sources=read(D/'sources.json')
def source(id,title,url,typ,notes):
 item=dict(id=id,institution='United States Military Academy' if id=='p4-usma-1949' else 'Earl F. Ziemke and Magna E. Bauer · U.S. Army Center of Military History',title=title,date=None,url=url,type=typ,relevance='Phase IV geographic and command reconstruction; consult feature-specific locators.',supports=DATES,notes=notes,reuseRights='Original vector interpretation; no protected source artwork reproduced.')
 old=next((x for x in sources if x['id']==id),None)
 if old:old.update(item)
 else:sources.append(item)
source('p4-map-cmh-12nov','Ziemke and Bauer, Moscow to Stalingrad (1987), Map 2: German advance, 22 June–12 November 1941','https://www.ibiblio.org/hyperwar/USA/USA-EF-Decision/maps/USA-EF-Decision-2.jpg','Official military-history map','Full map image inspected. Solid line is the approximate front of 12 November. This is a regional cross-check for late snapshots, not a same-day source for September or October. Original reconstruction uses named localities; no surveyed position accuracy claimed.')
source('p4-map-cmh-moscow','Ziemke and Bauer, Moscow to Stalingrad (1987), Map 3: Army Group Center, 15 November–5 December 1941','https://www.ibiblio.org/hyperwar/USA/USA-EF-Decision/maps/USA-EF-Decision-3.jpg','Official military-history map','Full map inspected. Only the dotted 15 November starting front and rail/locality geography inform the near-contemporary cross-check. Later attack arrows, December fronts and later Soviet deployments are excluded from Phase IV.')
source('p4-usma-1949','U.S. Military Academy, The War in Eastern Europe (June 1941 to May 1945), 1949','https://www.ibiblio.org/hyperwar/NHC/NewPDFs/USArmy/United%20States%20Military%20Academy/USMA%20The%20War%20in%20Eastern%20Europe%20%28June%201941%20to%20May%201945%29%201949.pdf','Official military history','Full PDF text inspected. Printed pp. 42–47, particularly the p. 44 footnote, corroborate the Hoth–Reinhardt change effective 5 October. Retrospective broad chronology is cross-checked with the later CMH history; the 1949 account is not assumed infallible.')
source('p4-estonian-islands','Estonian War Museum and Hiiumaa Military History Society: October 1941 island fighting','https://mil.hiiumaa.ee/militaarne-hiiumaa/hiiumaa-sojasundmused-oktoobris-1941/','Institutional local military history','Daily chronology for 12–21 October inspected. Hiiumaa is Soviet-held before the 12 October landings; fighting is shown regionally until 21 October. Sõrve surrender on 5 October is corroborated by the Estonian War Museum study linked in feature locators. Osmussaar remains Soviet-held through this phase; it is a point because the existing base geometry omits this small island.')
next(x for x in sources if x['id']=='p4-estonian-islands')['institution']='Hiiumaa Military History Society / Estonian War Museum'
source('p4-transnistria','United States Holocaust Memorial Museum: Transnistria Governorate','https://encyclopedia.ushmm.org/content/en/article/transnistria-governorate','Institutional historical study and regional map','Museum article and full regional map inspected. Romanian administration lay between the Dniester and Southern Bug; Odessa remained Soviet-held until 16 October. Original broad polygon follows the separately sourced natural rivers and historical land mask, with a generalized northern limit near Zhmerynka. It is not a surveyed administrative boundary, nor Romanian sovereign annexation.')
next(x for x in sources if x['id']=='p4-transnistria')['institution']='United States Holocaust Memorial Museum'
BASE=['cmh-blitz','blau-planning'];L={
'p4-transnistria':'Sections What was the Transnistria Governorate? and When was the Transnistria Governorate created?; full map https://encyclopedia.ushmm.org/content/en/map/transnistria-governorate-august-1941-march-1944 . River-bounded regional interpretation; northern administrative limit generalized.',
'p4-estonian-islands':'Hiiumaa chronology, 12–21 October. Sõrve, 5 October: https://esm.ee/teadus/sojasuvi-1941/saaremaa-vallutamine-ja-lahingud-sorve-poolsaarel/ ; Osmussaar through November: https://esm.ee/teadus/sojasuvi-1941/osmussaar-dessant-mida-ei-tehtud/ . Broad island-scale interpretation, no tactical perimeter inferred.',
'cmh-blitz':'Chapter II, printed pp. 34–45; dated Typhoon, Kalinin, Tikhvin and Orsha passages; component dates stated in note.',
'blau-planning':'Printed pp. 76–86; offensive preparation, October advances, southern operations and November planning.',
'p4-cmh-moscow':'Chapter III, printed pp. 47–50; late-October reinforcement, early-November dispositions and 14 November counterblow.',
'p4-kirchubel-barbarossa':'End Game: Typhoon, Moscow approaches, Kharkov to Rostov, Crimea, and Tikhvin/Volkhov subsections; regional interpretation only.',
'p4-map-cmh-12nov':'Map 2, printed p. 26: approximate front of 12 November; late-snapshot cross-check only.',
'p4-map-cmh-moscow':'Map 3, printed p. 46: dotted 15 November starting line; adjacent-date contextual cross-check only, later arrows excluded.',
'p4-usma-1949':'Printed p. 44 footnote: Hoth transferred to 17th Army and Reinhardt replaced him at 3rd Panzer Group on 5 October.',
'p4-stahel-exploiting':'Public chapter 6 extract: Stumme/XXXX and Vietinghoff/XXXXVI containment; Kuntzen/LVII and Das Reich dispatch on 7 October; 20th Panzer readiness on 11 October.',
'p4-cmh-leningrad':'Chapter VII, printed pp. 135–136: Tikhvin rail cut and road–lake transshipment; later ice-road outcomes are not backdated.',
'p4-tikhvin-history':'Official retrospective account: 8 November capture; attacks by 52nd Army from 12 November and 4th Army from 19 November.',
'p4-stavka-tikhvin':'Catalogue description of directive 004725, 9 November: concentration of 4th Army effort at Tikhvin; not a claimed full-text reading.',
'p4-gko801':'GKO 801ss, 15 October 1941, clauses 1–4: Kuibyshev, Arzamas, transport and conditional demolition.',
'p4-gko813-translation':'19 October decree, effective 20 October: Zhukov, Artemev and Sinilov responsibilities, curfew and enforcement.',
'p4-edele-loyalty':'Public extract and references 7–8: Moscow October crowd violence and separate Ivanovo disturbance of 19 October.',
'p4-ushmm-ordinary':'Ordinary Soldiers, printed pp. 8–17: 1st Battalion/691st Regiment at Krugloye, order on or about 7 October and company responses.',
'p4-ushmm-odessa':'Odessa article: evacuation/occupation on 16 October; 22 October headquarters explosion and subsequent massacres, dates kept separate.',
'p4-judaica-kharkov':'Kharkov entry: German capture on 24 October; later ghetto and killing chronology not backdated.',
'p4-kharkiv-tractor':'Museum research paper: tractor factory equipment and workers via Stalingrad to Rubtsovsk; later Altai production not October output.',
'p4-harrison-industry':'Printed pp. 1 and 10: evacuation and receiving-region constraints; industrial stages not conflated.',
'p4-mukhina-excerpt':'Historical foreword, printed pp. 1–2: Lena Mukhina’s earlier defensive labour, no invented entry for 9 November.',
'p4-frus865':'FRUS I, document 865, 15 October: diplomatic evacuation instructions and retained personnel.',
'p4-frus799':'FRUS I, document 799, 30 October: Roosevelt’s supply/financial proposal, not delivered equipment.',
'p4-frus803':'FRUS I, document 803: Stalin reply dated 4 November, received proposal summary on 2 November.',
'p3-frus786':'FRUS I, document 786: Harriman cable of 30 September, requirements and negotiations.',
'p4-frus787':'FRUS I, document 787: 1 October supply understanding; not completed delivery.',
'p4-enstad-chronology':'Publisher front-matter chronology: German capture of Tikhvin on 8 November 1941.',
'ushmm-pow-treatment':'Museum article: starvation, exposure, shootings and mass mortality of Soviet prisoners during June 1941–January 1942; no individual camp coordinate inferred.',
'p3-ushmm-babyn':'Kiev and Babi Yar article: killings of 29–30 September; ravine locality, not a tactical unit marker.'}
FEATURES={d:[] for d in DATES}
def feature(layer,d,key,title,coords,kind='Point',actor='',src=None,note='',**extra):
 src=src or BASE;f=dict(type='Feature',geometry=dict(type=kind,coordinates=coords),properties=dict(id=f'p4-{d}-{key}',title=title,name=title,label=title,actor=actor,category='engagement' if layer=='military-operations' else 'formation' if layer=='formation-positions' else 'rail-corridor' if layer=='historical-logistics' else 'front' if layer=='dated-fronts' else 'military_area',snapshots=[d],startDate=d,endDate=d,observationDate=d,reportingTime='Dated regional synthesis; component event dates in notes',accuracy='Regional locality/sector interpretation',uncertainty='Sectors and route bends are approximate. This is not a headquarters coordinate, surveyed tactical route, or proof of secure control between localities.',evidenceStatus='documented event / regional interpretation',locationType='sector label' if layer=='formation-positions' else 'locality or schematic corridor',sourceIds=src,sourceLocators={s:[L.get(s,'See the corresponding published study’s source locators.')] for s in src},note=note,phaseId='4',operationalContext=True));f['properties'].update(extra)
 collections[layer]['features'].append(f);FEATURES[d].append(f);return f

def point(d,key,title,place,actor='Soviet Union',src=None,note='',**kw):return feature('military-operations',d,key,title,P[place] if isinstance(place,str) else place,actor=actor,src=src,note=note,**kw)
def move(d,key,title,places,actor='Germany',typ='advance',src=None,note='',start=None,end=None,outcome='Reported operational direction',**kw):
 coords=[P[p] if isinstance(p,str) else p for p in places];f=feature('military-operations',d,key,title,coords,'LineString',actor,src,note,movementType=typ,movementStart=start or d,movementEnd=end or d,outcome=outcome,labelCoordinates=coords[len(coords)//2],shortLabel=kw.pop('shortLabel',title),**kw);return f

def form(d,key,title,xy,actor,commander,parent,echelon='army',note='',src=None):return feature('formation-positions',d,key,title,xy,actor=actor,src=src,note=note or 'Representative command sector, not a surveyed headquarters or full unit footprint.',echelon=echelon,commander=commander,parentFormation=parent,displayLabel=title+('\n'+commander if commander else ''),labelPriority=1 if echelon in ['army-group','front'] else 2 if echelon=='army' else 3)
def log(d,key,title,places,src=None,note='',category='rail-corridor'):
 xy=[P[p] if isinstance(p,str) else p for p in places];return feature('historical-logistics',d,key,title,xy if len(xy)>1 else xy[0],'LineString' if len(xy)>1 else 'Point',src=src,note=note,category=category,labelCoordinates=xy[len(xy)//2])
def area(d,key,title,g,visual,actor,src,note):
 f=feature('military-control',d,key,title,[],actor=actor,src=src,note=note,visualCategory=visual,pattern='contested-cross' if visual=='contested' else 'occupation-hatch',militaryControl='Continued Soviet resistance' if visual=='contested' else 'Reported operational reach; consolidation unresolved',sovereigntyStatus='Military situation does not transfer sovereignty');f['geometry']=mapping(clean(g));return f
# Physical mask and date-specific front partitions. Complete historical outlines
# are used, never viewport rectangles as country geometry.
maskIds=['soviet-union','poland-soviet-east','estonia','finnish-cessions-1940'];mask=clean(unary_union([G[k] for k in maskIds if k in G]))
priorFinn=next(shape(f['geometry']) for f in collections['military-control']['features'] if f['properties']['id']=='p3-1941-09-29-finnish-reach')
crimea=mask.intersection(box(32.3,44.2,36.7,46.1));sev=Point(P['Sevastopol']).buffer(.24,resolution=20);kerch=Polygon([(35.35,45.10),(35.3,45.6),(36.8,45.7),(36.8,44.9),(35.35,45.10)])
# Preserve the islands which had not fallen with mainland Estonia. The old
# residual also contains Vormsi; do not carry that unsupported component forward.
islands=list(G['p3-1941-09-29-soviet-estonia-held'].geoms)
hiiumaa=max(islands,key=lambda g:g.area)
sorve=min(islands,key=lambda g:abs(g.centroid.y-58.1))
# Natural river courses constrain the regional administrative interpretation.
riverRecords=read(ROOT/'public/data/geography/europe-rivers.geojson')['features']
def river(name):return linemerge(unary_union([shape(f['geometry']) for f in riverRecords if f['properties']['name']==name]))
dniester=river('Dniester');bug=river('Southern Bug')
westBank=list(substring(dniester,dniester.project(Point(27.8,48.5)),dniester.length).coords)
eastBank=list(substring(bug,bug.project(Point(28.35,49.0)),bug.length).coords)
transnistria=clean(Polygon([*westBank,(31.85,46.4),(31.9,46.96),*reversed(eastBank),(28.15,49.03),westBank[0]]))
previous=None
for i,d in enumerate(DATES):
 src=BASE+(['p4-map-cmh-12nov','p4-cmh-moscow'] if d>='1941-11-02' else [])
 edge=R['NORTH'][d]+R['CENTRE'][d][1:]+R['SOUTH'][d][1:]
 # Late southern contact ends at the Rostov coast. Close the land partition
 # along the Black Sea approach, retaining the occupied Odessa rear rather
 # than accidentally dropping every locality south of the last front node.
 coast=[(33.72,46.05)] if edge[-1][1]>46.1 else []
 west=Polygon([(-25,edge[0][1]),*edge,*coast,(-25,46.0),(-25,edge[0][1])]);reach=clean(mask.intersection(west))
 if d>='1941-11-09':reach=clean(reach.union(crimea.difference(sev.union(kerch))))
 elif d=='1941-11-02':reach=clean(reach.union(crimea.intersection(Polygon([(32,46.2),(34.8,46.2),(34.9,45.1),(34.25,44.6),(32,44.5),(32,46.2)])).difference(sev)))
 # Oranienbaum survives, Odessa survives until evacuation, and the capital is
 # outside the operational envelope on every date.
 pockets=[]
 if d<'1941-10-05':pockets.append(('sorve','Sõrve · Soviet resistance until 5 October',sorve))
 if d<'1941-10-21':
  pockets.append(('hiiumaa','Hiiumaa · Soviet-held' if d<'1941-10-12' else 'Hiiumaa · fighting continues through 21 October',hiiumaa))
  point(d,'hiiumaa-context','Hiiumaa · Soviet defense and October landings',(22.6,58.9),src=['p4-estonian-islands'],note='Soviet-held before 12 October. From 12–21 October the whole-island hatch denotes an active island campaign, not uniform Soviet possession or a precise front. Daily beachheads and defensive remnants are not resolved at this scale.')
 point(d,'osmussaar','Osmussaar · Soviet garrison remains',(23.37,59.29),src=['p4-estonian-islands'],note='Soviet garrison survives throughout Phase IV, evacuated in December. Point representation: this small island is absent from the historical outline dataset; no artificial island polygon is invented.')
 pockets.append(('oranienbaum','Oranienbaum · Soviet bridgehead',Polygon([(29.1,59.94),(29.75,60.02),(29.9,59.86),(29.65,59.76),(29.15,59.78),(29.1,59.94)])))
 if d<'1941-10-16':pockets.append(('odessa','Odessa · Soviet coastal defense',Point(P['Odessa']).buffer(.32,resolution=20)))
 if d in ['1941-10-07','1941-10-13']:
  pockets.append(('vyazma-pocket','Vyazma · encircled Soviet resistance',Polygon([(33.25,55.50),(33.8,55.65),(34.25,55.40),(34.15,54.98),(33.65,54.9),(33.25,55.15),(33.25,55.50)]) if d=='1941-10-07' else Polygon([(33.7,55.35),(34.0,55.4),(34.15,55.2),(33.9,55.05),(33.7,55.35)])))
 if d in ['1941-10-07','1941-10-13','1941-10-16','1941-10-19']:
  pockets.extend([('bryansk-sw','Bryansk southwest · dispersed Soviet resistance',Point((33.9 if d=='1941-10-07' else 34.3,52.65)).buffer(.29 if d<='1941-10-13' else .14,resolution=14)),('bryansk-ne','Bryansk northeast · dispersed Soviet resistance',Point((34.55 if d=='1941-10-07' else 34.8,53.47)).buffer(.23 if d<='1941-10-13' else .10,resolution=14))])
 for key,title,pocket in pockets:
  pocket=clean(pocket.intersection(mask));reach=clean(reach.difference(pocket))
  if key not in ['oranienbaum','odessa','sorve'] and not (key=='hiiumaa' and d<'1941-10-12') and not pocket.is_empty:area(d,key,title,pocket,'contested','Soviet Union',['p4-estonian-islands'] if key=='hiiumaa' else BASE,'Indicative region of continued fighting and attempts to escape. Its outline is not a complete or secure German ring. Later prisoner totals are not displayed as a completed result on this date.')
 reach=clean(reach.difference(priorFinn));axisReach=reach;romanian=clean(reach.intersection(transnistria));reach=clean(reach.difference(romanian))
 area(d,'romanian-authority','Transnistria · Romanian administration',romanian,'romanian-military','Romania',['p4-transnistria','p4-ushmm-odessa'],'Romanian military and civilian authority in occupied Soviet Ukraine. The Dniester and Southern Bug constrain this regional interpretation; its northern boundary is generalized. Sovereignty is not transferred. Odessa remains a Soviet coastal pocket until 16 October.')
 area(d,'reach','German forward operational area',reach,'operational','Germany',src,'Original regional interpretation anchored to documented towns, approach sectors and campaign chronology. Grey hatching indicates forward reach and occupied rear, with local consolidation unresolved. It is not a legal boundary or a claim of a surveyed continuous front.')
 area(d,'finnish-reach','Finnish forward reach · Svir and Karelian sectors',priorFinn,'finnish-operational','Finland',['cmh-blitz','p4-kirchubel-barbarossa'],'Finnish positions retain their own actor identity. A German junction with Finnish forces east of Ladoga had not been achieved. Fine local positions within this broad envelope are unresolved.')
 held=clean(mask.difference(axisReach.union(priorFinn)))
 # Add Soviet residual regions to the political source, so the common label
 # placement and control palette operate exactly as for the earlier phases.
 for part in maskIds:
  if part not in G:continue
  g=clean(G[part].intersection(held))
  if g.is_empty:continue
  id=f'p4-{d}-{part}-held';geo['features'].append(dict(type='Feature',properties={'id':id},geometry=mapping(g)))
  label=[40.5,55] if part=='soviet-union' else list(g.representative_point().coords)[0]
  states.append(dict(id=id,name='Soviet-held territory' if part=='soviet-union' else 'Soviet-held '+part,historicalName='Soviet Union',geometryRef=id,entity='Soviet Union',countryName='SOVIET UNION',sovereigntyStatus='Earlier political borders and disputed incorporations remain separate references',militaryControl='Soviet Union',controller='Soviet Union',occupationAdministration='Soviet administration / defended territory',annexationClaim='No new claim inferred',politicalAlignment='Allied belligerent',startDate=d,endDate=d,visualCategory='soviet-core' if part=='soviet-union' else 'soviet-occupation',sourceIds=src,accuracy='Residual regional interpretation outside reconstructed Axis reach',uncertainty='Broad regional partition; connecting sectors and local control may be unresolved.',note='Soviet-held residual region derived from the same dated operational envelope, with defended pockets retained.',labelCoordinates=label,labelAnchors=[label]+[[x,y] for x in [30,32,34,36,38,40,42,45,50] for y in [45,48,51,53,55,56,57,59,60,62,65] if g.covers(Point(x,y))],labelPriority=2,subtitle='',operationalContext=True,phaseId='4'))
 id=f'p4-{d}-transnistria';geo['features'].append(dict(type='Feature',properties={'id':id},geometry=mapping(romanian)))
 states.append(dict(id=id,name='Transnistria Governorate · Romanian administration',historicalName='Occupied Soviet Ukraine',geometryRef=id,entity='Soviet Ukraine',countryName='SOVIET UKRAINE',sovereigntyStatus='Romanian occupation and administration, not sovereign annexation',militaryControl='Romania',controller='Romania',occupationAdministration='Transnistria Governorate',annexationClaim='No sovereign transfer inferred',politicalAlignment='Occupied territory under Axis administration',startDate=d,endDate=d,visualCategory='romanian-military',sourceIds=['p4-transnistria','p4-ushmm-odessa'],accuracy='Regional interpretation between the Dniester and Southern Bug',uncertainty='Northern administrative limit generalized; no surveyed boundary accuracy claimed.',note='Odessa stays a separate Soviet coastal defense until 16 October. Romanian occupation is distinct from Germany and from Romania proper.',labelCoordinates=[29.6,47.6],labelPriority=2,subtitle='Romanian administration',operationalContext=True,phaseId='4'))
 for part,country,label in [('estonia','Estonia',[25.5,58.8]),('poland-soviet-east','Poland',[25.0,52.0])]:
  g=clean(G[part].intersection(reach))
  if g.is_empty:continue
  id=f'p4-{d}-{part}-occupied';geo['features'].append(dict(type='Feature',properties={'id':id},geometry=mapping(g)))
  states.append(dict(id=id,name=country+' · German occupation',historicalName=country,geometryRef=id,entity=country,countryName=country.upper(),sovereigntyStatus='German occupation does not establish a sovereign transfer',militaryControl='Germany',controller='Germany',occupationAdministration='German military occupation; civil-administration boundaries not reconstructed here',annexationClaim='None inferred from military control',politicalAlignment='Occupied territory',startDate=d,endDate=d,visualCategory='german-occupation',sourceIds=src+(['p4-estonian-islands'] if part=='estonia' else []),accuracy='Historical country geometry intersected with the dated operational area',uncertainty='Approximate connecting sectors; contested islands are separately retained.',note='Country identity is retained under occupation. Military control and civil administration are separate categories.',labelCoordinates=label,labelPriority=2,subtitle='German occupation',operationalContext=True,phaseId='4'))
 for region,coords in [('north',R['NORTH'][d]),('center',R['CENTRE'][d]),('south',R['SOUTH'][d])]:feature('dated-fronts',d,'front-'+region,'Approximate contact · '+region,coords,'LineString',src=src,note='Lower-confidence connecting line between documented sectors. Distinct from a national boundary or a continuous trench system.',region=region,confidence='generalized regional contact')
 if d>='1941-11-02':feature('dated-fronts',d,'crimea-front','Crimea · Soviet fortress and Kerch approaches',[(33.3,44.82),(33.62,44.85),(33.8,44.65)] if d=='1941-11-02' else [(35.35,45.12),(35.35,45.4),(35.4,45.6)],'LineString',src=BASE,note='Separate Crimean sector; Sevastopol and the Kerch region remain Soviet-held on these selected dates. Connecting line is generalized.')
 if previous is not None:
  for kind,g in [('gain',reach.difference(previous)),('loss',previous.difference(reach))]:
   g=clean(g)
   if not g.is_empty:
    f=feature('territorial-changes',d,'change-'+kind,'Change in reported forward reach',[],src=src,note='Difference between regional reconstructions; not a verified village-by-village transfer.',snapshotDate=d,changeKind=kind);f['geometry']=mapping(g)
 previous=reach
 # German command labels: representative rear sectors, legible independently of
 # capital labels. Army Group North does not become a province of Germany.
 for key,title,xy,commander in [('agn','Army Group North',(28.5,57.15),'Wilhelm von Leeb'),('agc','Army Group Centre',(30.5,54.8),'Fedor von Bock'),('ags','Army Group South',(31.3,48.4),'Gerd von Rundstedt')]:form(d,key,title,xy,'Germany',commander,'','army-group')
 for key,title,commander,parent in [('a9','9th Army','Adolf Strauss','Army Group Centre'),('a4','4th Army','Günther von Kluge','Army Group Centre'),('a2','2nd Army','Maximilian von Weichs','Army Group Centre'),('pg3','3rd Panzer Group','Hermann Hoth' if d<'1941-10-05' else 'Georg-Hans Reinhardt','Army Group Centre'),('pg4','4th Panzer Group','Erich Hoepner','Army Group Centre'),('pg2','2nd Panzer Group' if d<'1941-10-05' else '2nd Panzer Army','Heinz Guderian','Army Group Centre'),('a6','6th Army','Walter von Reichenau','Army Group South'),('a17','17th Army','Carl-Heinrich von Stülpnagel' if d<'1941-10-05' else 'Hermann Hoth','Army Group South'),('pg1','1st Panzer Group' if d<'1941-10-06' else '1st Panzer Army','Ewald von Kleist','Army Group South'),('a11','11th Army','Erich von Manstein','Army Group South')]:
  form(d,key,title,R['SECTORS'][key][i],'Germany',commander,parent,src=BASE+(['p4-usma-1949'] if key in ['pg3','a17'] else []),note='Representative operational sector. Hoth–Reinhardt change is effective 5 October; the 7 October study’s Hoth label refers to the opening commander. Current command identity follows the dated official-history footnote.' if key=='pg3' else 'Representative command sector; components occupied a wider area. Formation designation and command date are separate from geographic precision.')
 form(d,'a18','18th Army',(29.5,59.25),'Germany','Georg von Küchler','Army Group North')
 form(d,'a16','16th Army',(31.2 if d<'1941-10-16' else 31.7,58.0),'Germany','Ernst Busch','Army Group North')
 # Soviet commands, with merger and deactivation dates respected.
 form(d,'wf','Western Front',(34.6,55.6) if d<'1941-10-10' else (38.15,55.25),'Soviet Union','Ivan Konev' if d<'1941-10-10' else 'Georgy Zhukov','Stavka','front')
 if d<'1941-10-10':form(d,'rf','Reserve Front',(34.8,54.65),'Soviet Union','Semyon Budenny','Stavka','front')
 if d>='1941-10-17':form(d,'kf','Kalinin Front',(36.8,57.15),'Soviet Union','Ivan Konev','Stavka','front',src=['cmh-blitz','p4-cmh-moscow'])
 if d<'1941-11-10':form(d,'bf','Bryansk Front',(35.0,53.0) if d<'1941-10-07' else (37.8,53.0),'Soviet Union','Andrei Eremenko' if d<'1941-10-14' else '', 'Stavka','front',note='Broad surviving command sector, not a claim that all subordinate armies remained intact. Later commander omitted where this position evidence does not establish the handover.')
 form(d,'lf','Leningrad Front',(30.4,60.18),'Soviet Union','','Stavka','front',note='Command-sector label. Personnel succession is not inferred from a broad position source.')
 form(d,'nwf','Northwestern Front',(34.0,58.35),'Soviet Union','','Stavka','front')
 form(d,'swf','Southwestern Front',(37.55,50.4),'Soviet Union','Semyon Timoshenko','Stavka','front')
 form(d,'sf','Southern Front',(39.8 if d>='1941-10-19' else 37.4,48.1),'Soviet Union','','Stavka','front')
 form(d,'finn','Finnish Army of Karelia',(33.25,61.1),'Finland','','Finnish High Command','army',src=['cmh-blitz','p4-kirchubel-barbarossa'],note='Broad Finnish sector, not an achieved link with German Tikhvin forces.')
 if d<'1941-10-16':form(d,'rom4','Romanian 4th Army',(30.2,46.65),'Romania','','Romanian command','army',src=['p4-ushmm-odessa','blau-planning'],note='Odessa siege sector before the Soviet evacuation and Romanian entry on 16 October.')
 if d<='1941-10-02':
  for key,title,place,parent in [('s22','22nd Army','Ostashkov','Western Front'),('s29','29th Army','Rzhev','Western Front'),('s30','30th Army','Bely','Western Front'),('s19','19th Army',(32.6,55.3),'Western Front'),('s16','16th Army',(32.9,55.05),'Western Front'),('s20','20th Army',(33.5,54.95),'Western Front'),('s24','24th Army',(33.25,54.6),'Reserve Front'),('s43','43rd Army','Spas-Demensk','Reserve Front'),('s32','32nd Army','Vyazma','Reserve Front'),('s33','33rd Army',(34.5,54.7),'Reserve Front'),('s49','49th Army','Kaluga','Reserve Front'),('s31','31st Army',(34.6,56.2),'Reserve Front'),('s50','50th Army','Bryansk','Bryansk Front'),('s3','3rd Army',(33.5,52.9),'Bryansk Front'),('s13','13th Army','Trubchevsk','Bryansk Front')]:form(d,key,title,P[place] if isinstance(place,str) else place,'Soviet Union','',parent,src=['p4-kirchubel-barbarossa','cmh-blitz'],note='Opening deployment sector from the published order-of-battle narrative. The point is not headquarters or an exact divisional front.')
 if d=='1941-10-07':
  for key,title,xy,parent in [('s19','19th Army · encircled elements',(33.5,55.4),'Western Front'),('s20','20th Army · encircled elements',(33.6,55.1),'Western Front'),('s24','24th Army · encircled elements',(33.6,54.97),'Reserve Front'),('s32','32nd Army · encircled elements',(34.05,55.33),'Reserve Front'),('s50','50th Army · encircled elements',(34.55,53.47),'Bryansk Front'),('s3','3rd Army · dispersed forces',(34.05,52.8),'Bryansk Front'),('s13','13th Army · dispersed forces',(34.2,52.5),'Bryansk Front')]:form(d,key,title,xy,'Soviet Union','',parent,src=['p4-kirchubel-barbarossa','cmh-blitz'],note='Indicative location of encircled or fragmented forces; no completed surrender or exact perimeter is inferred.')
  for key,title,xy,commander in [('c40','XXXX Motorized Corps',(34.1,55.45),'Georg Stumme'),('c46','XXXXVI Motorized Corps',(34.3,55.05),'Heinrich von Vietinghoff'),('c57','LVII Motorized Corps',(34.4,54.7),'Adolf-Friedrich Kuntzen')]:form(d,key,title,xy,'Germany',commander,'4th Panzer Group','corps',src=['p4-stahel-exploiting'],note='Containment and onward dispatch roles on 7 October. Army-corps (motorized) terminology is retained for 1941; later formal Panzerkorps redesignations are not backdated.')
 if d>='1941-10-13':
  for key,title,place,parent,commander in [('s16','16th Army','Volokolamsk','Western Front','Konstantin Rokossovsky'),('s5','5th Army','Mozhaisk','Western Front',''),('s43','43rd Army','Maloyaroslavets','Western Front',''),('s49','49th Army','Serpukhov' if d>='1941-10-19' else 'Kaluga','Western Front',''),('s50','50th Army','Tula','Western Front' if d>='1941-11-10' else 'Bryansk Front','')]:
   xy=P[place];xy=(xy[0]+(.2 if key!='s50' else .12),xy[1]+.08)
   form(d,key,title,xy,'Soviet Union',commander,parent,src=['cmh-blitz','p4-cmh-moscow','p4-kirchubel-barbarossa'],note='Defensive approach sector / surviving or reconstituted formation. Does not assert continued Soviet possession of every named town after its capture; later positions lie east of the town. 50th Army passes to Western Front on 10 November.')
  if d>='1941-10-19':
   for key,title,xy in [('s22','22nd Army',(33.6,57.3)),('s29','29th Army',(35.7,57.1)),('s30','30th Army',(36.3,56.65)),('s31','31st Army',(36.8,56.9))]:form(d,key,title,xy,'Soviet Union','','Kalinin Front',src=['p4-cmh-moscow','p4-map-cmh-moscow'],note='Broad Kalinin defensive relationship, checked against the adjacent mid-November map where applicable. Sector anchor does not assert a precise day-specific deployment.')
 if d in ['1941-09-30','1941-10-02']:form(d,'pz10','10th Panzer Division',(32.9,54.05),'Germany','','4th Panzer Group','division',src=['blau-planning'],note='Roslavl concentration named in the planning account; projected assignments do not certify full strength or arrival of every supporting formation.')
 if d in ['1941-10-07','1941-10-13']:
  form(d,'dasreich','SS Division Das Reich',(34.5,55.5) if d=='1941-10-07' else (35.05,55.5),'Germany','Paul Hausser','4th Panzer Group','division',src=['p4-stahel-exploiting'],note='Dispatched toward Gzhatsk on 7 October; Soviet tank attack on 10 October. Role/sector marker, not an exact daily location. Hausser’s later wounding is not backdated.')
  if d=='1941-10-13':form(d,'pz20','20th Panzer Division',(35.8,54.6),'Germany','','LVII Motorized Corps','division',src=['p4-stahel-exploiting'],note='Kaluga direction. Thirty-nine serviceable tanks reported on 11 October, not an exact strength return for the 13th.')
 if d>='1941-10-16':
  form(d,'c39','XXXIX Motorized Corps',(32.1 if d<'1941-11-09' else 33.1,59.45),'Germany','','Army Group North','corps',src=['p4-kirchubel-barbarossa'],note='Tikhvin operational sector; formal 1941 motorized-corps designation, commonly called a panzer corps in later narratives.')
  for key,title,offset in [('pz12','12th Panzer Division',0),('mot18','18th Motorized Division',.17),('mot20','20th Motorized Division',-.17)]:form(d,key,title,(32.3+(.8 if d>='1941-11-09' else 0),59.25+offset),'Germany','','XXXIX Motorized Corps','division',src=['p4-kirchubel-barbarossa'],note='Identified formation in the Tikhvin thrust. Marker locates its broad operational relationship, not verified quarters or a uniform full-strength division.')
  for key,title,xy,commander in [('s4n','4th Independent Army',(33.85,59.75),'Kirill Meretskov' if d>='1941-11-07' else ''),('s52','52nd Army',(32.8,58.8),''),('s54','54th Army',(32.5,60.05),'')]:form(d,key,title,xy,'Soviet Union',commander,'Stavka / Leningrad operational grouping',src=['p4-tikhvin-history','p4-cmh-moscow'],note='Distinct army sectors. 52nd Army’s main counterattack begins 12 November; 4th Army’s begins 19 November. These later results are not shown before their dates.')
 # Actual movements and constraints; plan arrows are explicitly separate.
 if d=='1941-09-30':
  move(d,'guderian-opening','2nd Panzer Group · southern opening',['Glukhov',(34.05,51.9),(34.22,52.05)],note='Southern attack opens on 30 September. Orel remains an objective; main northern and central attacks begin on 2 October.',start='1941-09-30',shortLabel='Guderian · 30 Sep opening')
  for key,title,places in [('north-plan','3rd Panzer Group · assigned Vyazma objective',['Velizh','Bely','Vyazma']),('center-plan','4th Panzer Group · assigned Vyazma objective',['Roslavl','Spas-Demensk','Vyazma'])]:move(d,key,title,places,typ='planned',note='Assigned objective for the main attack of 2 October; no advance along this entire route on 30 September.',outcome='Ordered / future objective')
 elif d=='1941-10-02':
  move(d,'north-opening','3rd Panzer Group · northern penetration',['Velizh','Bely',(33.3,55.95)],note='Opening direction toward the Vyazma objective; no completed pocket on 2 October.',shortLabel='3rd Pz Group · opening')
  move(d,'center-opening','4th Panzer Group · Roslavl breakthrough',['Roslavl',(33.4,54.15),(33.9,54.3)],note='Opening direction across the Desna-sector defenses; later Spas-Demensk and Vyazma gains are not backdated.',shortLabel='4th Pz Group · opening')
  move(d,'south-opening','2nd Panzer Group · Orel direction',['Sevsk',(35.1,52.45),(35.6,52.7)],note='Advance begun 30 September, continuing toward Orel. City captured on 3 October, not shown as already taken on this date.',start='1941-09-30',shortLabel='Guderian · Orel direction')
 elif d=='1941-10-07':
  move(d,'vyazma-north','3rd Panzer Group · Vyazma convergence',['Bely','Kholm-Zhirkovsky','Vyazma'],start='1941-10-02',note='Northern pincer converges at Vyazma by 7 October. Soviet troops continue fighting inside.',shortLabel='Northern pincer · 2–7 Oct')
  move(d,'vyazma-south','4th Panzer Group · Vyazma convergence',['Roslavl','Spas-Demensk','Vyazma'],start='1941-10-02',note='Southern pincer. This is a schematic regional axis, not a surveyed march itinerary.',shortLabel='Southern pincer · 2–7 Oct')
  move(d,'orel-bryansk','2nd Panzer Army · Bryansk turn',['Orel','Karachev','Bryansk'],start='1941-10-03',note='Broad turn behind Bryansk Front. Separate northeast and southwest resistance regions remain active.',shortLabel='Bryansk turn · containment')
  move(d,'breakout-bryansk','Soviet attempts to escape Bryansk enclosures',[(34.0,52.65),(34.7,52.65),(35.25,52.8)],actor='Soviet Union',typ='breakout',note='Indicative eastward escape direction, not a single verified route or completed withdrawal by all formations.',outcome='Attempts and dispersed escape; outcomes varied')
  move(d,'kaluga-dispatch','LVII Corps · ordered toward Kaluga',['Vyazma',(34.6,54.9),'Kaluga'],typ='planned',src=['p4-stahel-exploiting'],note='Onward dispatch of 7 October, not completed arrival at Kaluga.',outcome='Ordered onward movement')
  move(d,'gzhatsk-dispatch','Das Reich · ordered toward Gzhatsk',['Vyazma','Gzhatsk'],typ='planned',src=['p4-stahel-exploiting'],note='7 October dispatch; later fighting in Gzhatsk direction is distinct.',outcome='Ordered onward movement')
  point(d,'pocket-hold','Vyazma · Soviet pressure ties down mobile corps','Vyazma',note='Inward containment and outward pursuit compete for forces. No final prisoner count is attached to this date.',eventKind='checked')
 else:
  move(d,'kalinin-axis','3rd Panzer Group · Kalinin approach' if d=='1941-10-13' else '3rd Panzer Group · northern approach sectors',['Rzhev','Staritsa',(35.75,56.8)] if d=='1941-10-13' else ['Staritsa','Kalinin'],start='1941-10-07',end='1941-10-13' if d=='1941-10-13' else '1941-10-14',note='Kalinin is captured 14 October. Earlier arrows stop short; later dates retain the achieved movement interval as context.',shortLabel='Kalinin approach · 7–14 Oct')
  move(d,'west-axis','4th Panzer Group · western approach',['Gzhatsk',(35.6,55.5),('Mozhaisk' if d>='1941-10-19' else (35.85,55.5))],start='1941-10-09',end='1941-10-18' if d>='1941-10-19' else d,note='Western approach, delayed by Soviet resistance and supply strain. The achieved interval remains visible as movement history, separate from current contact.',shortLabel='Western approach · October')
  move(d,'tula-axis','2nd Panzer Army · Orel–Mtsensk–Tula direction',['Orel','Mtsensk',('Chern' if d<'1941-11-02' else (37.4,54.0))],start='1941-10-03',end=d,note='Tula remains Soviet-held. The line approaches its southern defenses; it is not a completed passage around the city.',shortLabel='Guderian · Tula approaches')
  point(d,'mtsensk-check','Mtsensk · Soviet resistance and transport delay','Mtsensk',note='October resistance on the Zusha corridor affected Guderian’s pace. Marker is a retained explanation of that episode; no claim of a new battle on every selected date.',eventKind='checked',observationDate='1941-10-10')
  if d>='1941-10-19':move(d,'northward-turn','4th Panzer Group · northward turn after 18 October',[(36.1,55.45),(36.2,55.8),(36.1,56.0)],start='1941-10-18',note='Broad turn intended to assist encirclement. Does not show a completed ring around Moscow.',shortLabel='Hoepner · turn north')
  for key,place in [('volokolamsk','Volokolamsk'),('mozhaisk','Mozhaisk'),('maloyar','Maloyaroslavets'),('kaluga','Kaluga')]:point(d,'defense-'+key,place+' · defensive approach sector',place,note='Fortified-road sector discussed in the study. A sector label does not assert continuous works or present Soviet possession of the town after its loss.',eventKind='checked')
 if d>='1941-10-16':
  move(d,'tikhvin-advance','XXXIX Corps · Volkhov–Tikhvin thrust',['Chudovo','Budogoshch',('Tikhvin' if d>='1941-11-09' else (32.4 if d<'1941-10-24' else 32.6 if d<'1941-11-02' else 33.1,59.3 if d<'1941-11-02' else 59.5))],start='1941-10-16',end='1941-11-08' if d>='1941-11-09' else d,src=['p4-kirchubel-barbarossa','cmh-blitz'],note='Schematic direction through restricted forest-and-marsh corridors. Tikhvin becomes German-held only after its capture on 8 November.',shortLabel='Tikhvin thrust · Oct–8 Nov')
  point(d,'volkhov-crossings','Volkhov crossings · supply bottleneck',(31.85,59.2),actor='Germany',src=['p4-kirchubel-barbarossa'],note='Sector of offensive crossings. No specific bridge capacity or exact bridge structure is inferred.',eventKind='checked')
 if d>='1941-11-09':
  point(d,'tikhvin-cut','Tikhvin · captured 8 Nov; railway cut','Tikhvin','Germany',['p4-enstad-chronology','p4-tikhvin-history','cmh-blitz'],'Loss of the railway creates a severe Leningrad supply crisis, without closing all possible lake access.',observationDate='1941-11-08')
  move(d,'svir-objective','German objective · junction toward Svir',['Tikhvin',(33.5,60.25),'Svir'],typ='planned',src=['cmh-blitz','p4-kirchubel-barbarossa'],note='Unachieved objective. Germany and Finland had not closed this gap.',outcome='Unachieved objective',shortLabel='Svir junction · unachieved')
  point(d,'4army-order','4th Army · concentration ordered 9 Nov',(33.9,59.72),src=['p4-stavka-tikhvin'],note='Directive 004725 catalogue subject: concentrate effort at Tikhvin. This marker does not assert that the later main counteroffensive had begun.',observationDate='1941-11-09')
 if d=='1941-11-14':
  move(d,'52-counter','52nd Army · Malaya Vishera counterattack',[(32.85,58.8),(32.5,58.82),'Malaya Vishera'],actor='Soviet Union',typ='counterattack',start='1941-11-12',src=['p4-tikhvin-history'],note='Attack under way from 12 November; no later recovery of the town is imported.',shortLabel='52nd Army · from 12 Nov')
  move(d,'49-counter','49th Army · Serpukhov-sector counterblow',[(37.4,54.9),(37.12,54.85),(36.9,54.86)],actor='Soviet Union',typ='counterattack',src=['p4-cmh-moscow'],note='Limited counterblow on 14 November. Broad sector retained because the official text’s east-of-Serpukhov wording does not justify precise tactical geometry.',shortLabel='49th Army · 14 Nov')
  move(d,'renewed-north-plan','Renewed northern offensive · ordered objectives',[(36.1,56.2),'Klin',(37.1,56.3)],typ='planned',src=['p4-cmh-moscow'],note='Prospective German thrust beginning after 14 November. No subsequent gains are shown.',outcome='Planned; main attacks begin on later dates')
  point(d,'orsha-conference','Orsha · command conference, 13 November','Orsha','Germany',['cmh-blitz'],'The conference compared exhaustion, remaining strength, winter supply and proposed objectives. Minimum/maximum lines remain contextual plans.',observationDate='1941-11-13')
 # Southern theatre, separately dated from the Moscow operation.
 if d<='1941-10-07':
  move(d,'azov-axis','1st Panzer Group · Azov envelopment',[(35.15,48.0),(35.65,47.5),('Berdyansk' if d=='1941-10-07' else (35.7,47.3))],start='1941-09-30',src=['blau-planning','p4-kirchubel-barbarossa'],note='Southern operations have their own chronology. Mariupol is captured on 8 October and is not shown as already taken here.',shortLabel='Azov envelopment')
 else:
  move(d,'donbas-axis','1st Panzer Army · Mariupol–Taganrog–Rostov direction',['Mariupol',('Taganrog' if d>='1941-10-19' else (38.2,47.25)),(39.2 if d>='1941-10-24' else 38.6,47.35)] if d>='1941-10-19' else ['Mariupol',(38.2,47.25)],start='1941-10-08',src=['blau-planning','p4-kirchubel-barbarossa'],note='Rostov remains Soviet-held throughout Phase IV. This operational direction does not import the later capture and retreat.',shortLabel='Kleist · Rostov approaches')
  move(d,'kharkov-axis','6th Army · Kharkov approach',['Poltava',(35.6,49.8),('Kharkov' if d>='1941-10-24' else (35.9,49.9))],start='1941-10-01',end='1941-10-24' if d>='1941-10-24' else d,src=['p4-kirchubel-barbarossa','p4-judaica-kharkov'],note='Kharkov changes hands on 24 October, after a slower approach and Soviet resistance.',shortLabel='6th Army · Kharkov')
  move(d,'south-withdrawal','Soviet withdrawal toward Donets defenses',[(36.1,48.8),(37.1,48.75),(37.9,48.7)],actor='Soviet Union',typ='retreat',start='1941-10-01',src=['p4-kirchubel-barbarossa','blau-planning'],note='Broad withdrawal / defensive reorganization direction, with local resistance continuing; not an exact march itinerary.',shortLabel='Soviet withdrawal · Donets')
 if d>='1941-10-19':
  move(d,'ishun-attack','11th Army · Ishun positions',['Perekop','Ishun',(33.9,45.85) if d>='1941-11-02' else (33.83,46.0)],start='1941-10-18',end='1941-10-28' if d>='1941-11-02' else d,src=['p4-kirchubel-barbarossa','blau-planning'],note='18 October attack on positions south of Perekop. Decisive breakthrough follows 24 October. Later map dates retain the dated attack as background.',shortLabel='Ishun · 18–28 Oct')
 if d>='1941-11-02':
  move(d,'crimea-west','11th Army · Sevastopol approach',['Ishun','Simferopol',(33.8,44.8)],start='1941-10-28',src=BASE,note='Advance through Crimea; fortress remains Soviet-held. Does not imply a completed capture of Sevastopol.',shortLabel='Sevastopol approach')
  point(d,'sevastopol','Sevastopol · Soviet fortress','Sevastopol',src=BASE,note='Soviet-held fortress and naval base; not erased by the surrounding advance.',eventKind='checked')
  point(d,'kerch','Kerch · Soviet-held eastern sector','Kerch',src=BASE,note='Kerch Peninsula is not treated as fully German-held before the end of this phase. Local sectors remain generalized.')
 if d>='1941-10-24':point(d,'kharkov-capture','Kharkov · captured 24 October','Kharkov','Germany',['p4-judaica-kharkov','blau-planning'],'Captured city and industrial centre; evacuated output is not treated as a German gain. Later persecution has its own chronology.',observationDate='1941-10-24')
 # Logistics: individual corridor status is explicit. Geography is a connection
 # between named junctions, not a claim about exact rails, capacity or gauge.
 for key,title,places in [('rail-centre','Rail corridor · Minsk–Orsha–Smolensk',['Minsk','Orsha','Smolensk']),('rail-moscow','Smolensk–Vyazma–Moscow rail corridor',['Smolensk','Vyazma','Gzhatsk','Mozhaisk','Moscow']),('road-south','Southern road corridor · Glukhov–Orel–Tula',['Glukhov','Sevsk','Kromy','Orel','Mtsensk','Tula']),('rail-north','Eastern supply railway · Vologda–Tikhvin–Volkhov',['Vologda','Tikhvin','Volkhov']),('donbas-rail','Kharkov–Donbas–Rostov communications',['Kharkov','Izyum','Stalino','Taganrog','Rostov'])]:
  log(d,key,title,places,src=['p4-cmh-leningrad','p4-kirchubel-barbarossa'] if key=='rail-north' else BASE+(['p4-map-cmh-moscow'] if key=='rail-moscow' else []),note=('Railway cut at German-held Tikhvin after 8 November; no uninterrupted delivery service implied.' if key=='rail-north' and d>='1941-11-09' else 'Schematic period connection between named junctions. Control changes and interruptions prevent an inference of uninterrupted service, functioning railhead, exact track alignment or capacity.'),category='road-corridor' if key=='road-south' else 'rail-corridor')
 log(d,'lake-ladoga','Ladoga · water route and transshipment',['Novaya Ladoga',(31.85,60.25),'Osinovets'],src=['p4-cmh-leningrad'],note='Schematic water crossing. Ladoga remains a possible, hazardous, capacity-constrained supply route. This is not the later ice road.',category='sea-route')
 log(d,'lake-final','Osinovets–Leningrad · onward distribution',['Osinovets',(30.8,60.15),'Leningrad'],src=['p4-cmh-leningrad'],note='Onward distribution from the western landing. Schematic connection, not an exact uninterrupted line.')
 for place in ['Orsha','Smolensk','Roslavl','Orel','Tula','Moscow','Tikhvin','Volkhov','Osinovets']:
  log(d,'junction-'+place.lower(),place+' · transport / supply junction',[place],src=['p4-cmh-leningrad'] if place in ['Tikhvin','Volkhov','Osinovets'] else BASE,note='Junction or supply locality discussed in the studies. Functioning capacity, gauge and depot perimeter are not inferred.',category='junction')
 if d>='1941-11-09':log(d,'ladoga-detour','Tikhvin bypass · costly overland alternative',['Vologda',(35.4,60.0),(33.8,60.25),'Novaya Ladoga'],src=['p4-cmh-leningrad'],note='Broad overland alternative after railway loss; exact daily convoy route and completed capacity on 9 November are not established. Route is qualified orientation only.',category='road-corridor')
 if d<='1941-10-16':log(d,'odessa-sea','Odessa–Sevastopol · maritime evacuation',['Odessa',(31.4,45.8),'Sevastopol'],src=['p4-ushmm-odessa','blau-planning'],note='Maritime connection used for evacuation ending 16 October; not a claim that the same shipping remained available after occupation.',category='sea-route')
 # Civilian and diplomatic context: points or broad endpoint connections only.
 point(d,'moscow-civilians','Moscow · civilian defense, work and survival','Moscow',src=['cmh-blitz','p4-harrison-industry'],note='City-level context for workers, militia, fortification labour, shortages and emergency measures. No invented individual route or gun emplacement.',category='civilian',domain='civilian',eventKind='civilian-context')
 point(d,'pow-custody','Soviet captives · Army Group Centre rear',(32.2,54.5),'Germany',['ushmm-pow-treatment'],'Regional context for lethal custody, starvation and shootings. This is not a verified camp site or a dated prisoner total.',category='civilian',domain='civilian',eventKind='occupation')
 if d=='1941-09-30':point(d,'babyn-yar','Babyn Yar · killings continue on 30 September','Babyn Yar','Germany',['p3-ushmm-babyn'],'Ravine locality; killings of 29–30 September are distinct from the Typhoon opening.',category='civilian',domain='civilian',eventKind='massacre',observationDate='1941-09-30')
 if d=='1941-10-07':
  point(d,'691-order','Krugloye region · 1st Battalion / 691st Regiment','Krugloye','Germany',['p4-ushmm-ordinary'],'Order to kill Jewish civilians issued on or about 7 October. Regional marker, not Vyazma/Bryansk or a verified burial perimeter. Company responses and victims’ evidentiary limits are retained in study context.',category='civilian',domain='civilian',eventKind='massacre',observationDate='1941-10-07',reportingTime='On or about 7 October')
  form(d,'691','1st Battalion / 691st Infantry Regiment',P['Krugloye'],'Germany','Alfred Commichau','Army Group Centre rear','battalion',src=['p4-ushmm-ordinary'],note='Regional deployment and decision-chain context; not a tactical position inside the October pockets.')
 if d in ['1941-09-30','1941-10-02']:
  point(d,'moscow-negotiation','Moscow · British–American supply negotiations','Moscow',src=['p3-frus786','p4-frus787'],note='Requirements and commitments during the supply conference. Requests, agreements and delivered weapons are distinct.',category='civilian',domain='civilian',eventKind='diplomacy')
 if d>='1941-10-16':
  move(d,'gov-evacuation','Government and missions · Moscow–Kuibyshev',['Moscow',(43.0,54.5),'Kuibyshev'],actor='Soviet Union',typ='transfer',src=['p4-gko801','p4-frus865'],note='Endpoint relationship from the 15 October evacuation order and diplomatic report. Intermediate bend is schematic, not a specific train itinerary; Stalin’s conditional departure is not shown as an actual journey.',start='1941-10-15',end='1941-10-16',domain='civilian',category='civilian',shortLabel='Institutions and missions · eastward')
  move(d,'staff-arzamas','General Staff · assigned destination Arzamas',['Moscow','Arzamas'],actor='Soviet Union',typ='planned',src=['p4-gko801'],note='Destination named in the 15 October order; not proof of each office’s completed arrival.',start='1941-10-15',end='1941-10-15',domain='civilian',category='civilian',outcome='Ordered relocation')
  for place in ['Kuibyshev','Arzamas']:point(d,'evac-'+place.lower(),place+' · evacuation destination',place,src=['p4-gko801','p4-frus865'],note='Administrative or diplomatic destination named in the evacuation documents. Retained personnel and limits are in study context.',category='civilian',domain='civilian',eventKind='evacuation')
 if d=='1941-10-19':point(d,'ivanovo','Ivanovo · workers’ disturbance, 19 October','Ivanovo',src=['p4-edele-loyalty'],note='Separate city and incident; not a Moscow unrest count.',category='civilian',domain='civilian',eventKind='civilian-context')
 if d>='1941-10-19':point(d,'moscow-decree','Moscow · emergency authority and defense responsibilities','Moscow',src=['p4-gko813-translation'],note='Decree issued 19 October, effective 20 October: Zhukov outer front, Artemev near approaches, Sinilov urban order. Curfew is not a completed German siege ring.',category='civilian',domain='civilian',eventKind='government',observationDate='1941-10-19')
 if d>='1941-10-16':point(d,'odessa-occupation','Odessa · Romanian occupation from 16 October','Odessa','Romania',['p4-ushmm-odessa'],'Romanian entry after Soviet evacuation. The headquarters explosion of 22 October and ensuing mass killings are separate events.',category='civilian',domain='civilian',eventKind='occupation',observationDate='1941-10-16')
 if d>='1941-10-24':
  point(d,'odessa-massacre','Odessa · mass killings after 22 October','Odessa','Romania',['p4-ushmm-odessa'],'Documented mass violence after the headquarters explosion. City-level context, not a claim that every crime occurred at this coordinate on the selected day.',category='civilian',domain='civilian',eventKind='massacre',observationDate='1941-10-22')
  point(d,'kharkov-industry','Kharkov · industrial evacuation and occupation','Kharkov',src=['p4-kharkiv-tractor','p4-judaica-kharkov','p4-harrison-industry'],note='The tractor factory’s equipment and workers moved through Stalingrad toward Rubtsovsk. A destination card describes the later Altai enterprise; no exact train route or October restart is invented.',category='civilian',domain='civilian',eventKind='evacuation')
  move(d,'kharkov-stalingrad','Kharkov tractor evacuation · Stalingrad stage',['Kharkov',(40.3,49.4),'Stalingrad'],actor='Soviet Union',typ='transfer',src=['p4-kharkiv-tractor'],note='Schematic connection between documented stages. Rubtsovsk lies beyond the atlas extent and is represented by a destination card, not a clipped or invented route.',start='1941-09-18',end='1941-10-20',domain='civilian',category='civilian',shortLabel='Tractor-factory evacuation')
 if d=='1941-11-09':point(d,'mukhina','Leningrad · Lena Mukhina and civilian defensive labour','Leningrad',src=['p4-mukhina-excerpt'],note='Sixteen-year-old diary author’s earlier defensive labour, described in the editorial foreword. City-level context, not a claimed 9 November diary entry or precise work site.',category='civilian',domain='civilian',eventKind='testimony',observationDate='1941-09-01',reportingTime='Earlier experience; contextual on 9 November')
 if d>='1941-11-02':point(d,'aid','Moscow · Roosevelt–Stalin supply correspondence','Moscow',src=['p4-frus799','p4-frus803'],note='30 October proposal, summary received 2 November, acceptance dated 4 November. These stages do not certify delivery to a frontline formation.',category='civilian',domain='civilian',eventKind='diplomacy',observationDate='1941-11-02')
# Fixed physical locality supplement. Names and modern counterparts support search.
places=read(ROOT/'public/data/geography/europe-places.geojson');existing={f['properties'].get('id') for f in places['features']}
# Earlier records remain unchanged. Additional places are a separate Phase IV file.
newPlaces=[]
for name,xy in P.items():
 if not (-25<=xy[0]<=60):continue
 if any(math.dist(xy,f['geometry']['coordinates'])<.055 for f in places['features']):continue
 newPlaces.append(dict(type='Feature',geometry=dict(type='Point',coordinates=xy),properties=dict(id='p4-place-'+re.sub('[^a-z]+','-',name.lower()),name=name,periodName=name,priority=1 if name in ['Vyazma','Gzhatsk','Kalinin','Volokolamsk','Mozhaisk','Maloyaroslavets','Tula','Tikhvin','Volkhov','Kharkov'] else 2,modernName={'Gzhatsk':'Gagarin','Kalinin':'Tver','Kharkov':'Kharkiv','Stalino':'Donetsk','Kuibyshev':'Samara','Gorky':'Nizhny Novgorod'}.get(name,name),sourceIds=['natural-earth-10m'],accuracy='Locality coordinate for orientation; not a historical footprint')))
write(ROOT/'public/data/geography/phase-iv-places.geojson',FC(newPlaces))
focusNames=['Leningrad','Vyazma','Bryansk','Orel','Mtsensk','Kalinin','Volokolamsk','Mozhaisk','Maloyaroslavets','Kaluga','Serpukhov','Tula','Kharkov','Odessa','Taganrog','Rostov','Tikhvin','Volkhov','Sevastopol','Kerch','Perekop','Ishun','Glukhov','Roslavl','Velizh','Smolensk']
write(ROOT/'public/data/geography/phase-iv-focus-places.geojson',FC([dict(type='Feature',geometry=dict(type='Point',coordinates=P[n]),properties=dict(id='p4-focus-'+n.lower().replace(' ','-'),name=n,periodName=n,priority=0,sourceIds=['natural-earth-10m'],note='Named locality for orientation; city coordinate is not a surveyed historical urban footprint.',accuracy='Locality reference')) for n in focusNames]))

# Full paragraph/sentence coverage. Every published paragraph, including asides,
# retains its source notes and is accessible beside the map, with explicit links
# to available geographic features. Context is not labelled as exact geometry.
class Paragraphs(HTMLParser):
 def __init__(self):super().__init__();self.sections=[];self.section='';self.label='';self.rows=[];self.inp=False;self.inhead=False;self.depth=0;self.text=[];self.refs=[];self.skip=0
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='h2':self.section=a.get('id','');self.inhead=True;self.label=''
  if tag=='p':self.inp=True;self.text=[];self.refs=[]
  if tag=='sup':self.skip+=1
  if tag=='a' and a.get('href','').startswith('#source-'):self.refs.append((a['href'][8:],a.get('title','')))
 def handle_data(self,t):
  if self.inhead:self.label+=t
  if self.inp and not self.skip:self.text.append(t)
 def handle_endtag(self,tag):
  if tag=='h2':self.inhead=False;self.sections.append(dict(id=self.section,label=self.label))
  if tag=='sup':self.skip=max(0,self.skip-1)
  if tag=='p' and self.inp:
   self.inp=False;txt=''.join(self.text).strip()
   if txt:self.rows.append(dict(section=self.section,text=txt,sourceIds=list(dict.fromkeys(x[0] for x in self.refs))))
coverage=[];context={};totals=[]
for d in DATES:
 article=next(read(p) for p in (ROOT/'src/content/articles').glob('*.json') if read(p).get('historicalDate')==d)
 parser=Paragraphs();parser.feed(article['body']);features=FEATURES[d];paragraphs=[]
 for n,row in enumerate(parser.rows):
  text=row['text'];matches=[]
  for f in features:
   p=f['properties'];terms=[p['title'].split(' · ')[0],p.get('commander','')]
   # Named place mentions link to every relevant feature; the panel explains
   # whether it is current, historical or an unachieved objective.
   for name in P:
    if name.lower() in text.lower() and (name.lower() in p['title'].lower() or (f['geometry']['type']=='Point' and math.dist(P[name],f['geometry']['coordinates'])<.12)):terms.append(name)
   if any(len(t)>3 and t.lower() in text.lower() for t in terms):matches.append(p['id'])
  row.update(id=f'p4-context-{d}-{n+1}',featureIds=list(dict.fromkeys(matches)),disposition='qualified' if matches else 'contextual',reason='Linked locality/sector features; read feature notes for interval and geographic precision.' if matches else 'Analytical, aggregate, retrospective or non-geographic detail retained in the study context; no precise position is inferred.',articleSlug=article['slug'],articleDate=d,sourceLocators={s:article.get('sourceLocators',{}).get(s,[]) for s in row['sourceIds']})
  if 'Wolf Dose' in text or '58th Infantry Division' in text:
   row['disposition']='contextual';row['reason']='Personal testimony from the 58th Infantry Division in the northern theatre. The consulted extract does not establish an exact site for the diary entry; it is not relocated to Army Group Centre.'
  # Split at sentence boundaries without splitting numerical decimals; retain
  # the complete paragraph as the authoritative reading context.
  sentences=re.split(r'(?<=[.!?])\s+(?=[A-Z“])',text)
  for j,sentence in enumerate(sentences):coverage.append(dict(id=row['id']+f'-s{j+1}',date=d,section=row['section'],articleSlug=article['slug'],claim=sentence,temporalScope='As stated in the linked paragraph; explicit earlier/later dates remain contextual.',disposition=row['disposition'],featureIds=row['featureIds'],contextId=row['id'],sourceIds=row['sourceIds'],sourceLocators=row['sourceLocators'],spatialConfidence='regional / schematic' if matches else 'not plotted',temporalConfidence='article interval with feature-specific event dates',status='implemented',reason=row['reason']))
  paragraphs.append(row)
 context[d]=dict(articleSlug=article['slug'],title=article['title'],sections=parser.sections,paragraphs=paragraphs,destinations=([dict(name='Rubtsovsk / Altai tractor enterprise',coordinates=P['Rubtsovsk'],note='Outside the atlas extent. Documented destination after the Stalingrad stage; first Altai tractor was produced in August 1942, not October 1941.',sourceIds=['p4-kharkiv-tractor'])] if d>='1941-10-24' else []),precision='Dated regional reconstruction. Points locate sectors or named places; connecting fronts and corridors remain approximate. Study statements calling Phase IV maps reference-only predate this reconstruction.')
 count={k:sum(d in f['properties']['snapshots'] for f in v['features']) for k,v in collections.items()};totals.append(dict(date=d,paragraphs=len(paragraphs),sentences=sum(x['date']==d for x in coverage),**count))
write(H/'phase-iv-study-context.json',context);write(OUT/'coverage-matrix.json',coverage)
write(OUT/'date-summary.json',totals)
# Include geographic feature links on each historical record, without modifying
# any article narrative or reviewed body hash.
for d,fs in FEATURES.items():
 for f in fs:
  refs=[r for r in context[d]['paragraphs'] if f['properties']['id'] in r['featureIds']]
  f['properties']['articleSlug']=context[d]['articleSlug'];f['properties']['articleSections']=list(dict.fromkeys(r['section'] for r in refs))
  f['properties']['contextIds']=[r['id'] for r in refs]
index=read(D/'map-snapshot-index.json');timeline=read(D/'barbarossa-phase-iv-timeline.json')
for e in timeline:
 d=e['date'];
 if d in ['1941-09-30','1941-10-02']:e['defaultView']='typhoon-opening'
 if d=='1941-10-07':e['defaultView']='vyazma-bryansk'
 fs=FEATURES[d];src=list(dict.fromkeys(s for f in fs for s in f['properties']['sourceIds']));e.update(kind='Dated regional military reconstruction',snapshotStatus='dated-regional-synthesis',geographicFeatureIds=[f['properties']['id'] for f in fs],sourceIds=src,mapAccuracy='Original dated regional reconstruction from operational histories and inspected official maps. Locality and event dates are distinguished from lower-confidence connecting fronts, schematic routes and representative formation sectors. Candidate LOC sheets remain unverified and are not the source of digitized geometry.')
 old=index[d];old.update(operations=sum(f['properties']['id'].startswith('p4-'+d) for f in collections['military-operations']['features']),areas=sum(d in f['properties']['snapshots'] for f in collections['military-control']['features']),formations=sum(d in f['properties']['snapshots'] for f in collections['formation-positions']['features']),logistics=sum(d in f['properties']['snapshots'] for f in collections['historical-logistics']['features']),fronts=sum(d in f['properties']['snapshots'] for f in collections['dated-fronts']['features']),controlCategories=['operational','finnish-operational','romanian-military','contested'],movementActors=sorted({f['properties']['actor'] for f in collections['military-operations']['features'] if d in f['properties']['snapshots'] and f['geometry']['type']=='LineString'}),timeConvention='Dated regional synthesis; component event dates and intervals in feature notes',precision='Named-locality and operational-sector reconstruction; connecting fronts and route bends are generalized, not surveyed tactical positions.',referenceDate=d)
for state in states:
 if state['id'].startswith('p4-') and not state.get('labelAnchors'):
  geometry=next(shape(f['geometry']) for f in geo['features'] if f['properties']['id']==state['geometryRef'])
  anchor=state['labelCoordinates']
  if not geometry.covers(Point(anchor)):anchor=list(geometry.representative_point().coords)[0];state['labelCoordinates']=anchor
  state['labelAnchors']=[anchor]
for name,fc in collections.items():write(H/(name+'.geojson'),fc)
write(H/'europe-geometries.geojson',geo);write(D/'territorial-states.json',states);write(D/'sources.json',sources);write(D/'barbarossa-phase-iv-timeline.json',timeline);write(D/'map-snapshot-index.json',index)
print(json.dumps(totals,indent=2));print('Coverage sentences',len(coverage))
