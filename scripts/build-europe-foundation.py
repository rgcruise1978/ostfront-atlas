"""Build the shared European geometry and dated territorial register.

UMN supplies annual 1939 national outlines. Licensed SVG masks correct Central
European subdivisions, checked against museum maps; they are regional reference
geometry, not surveyed borders. No CShapes geometry is redistributed.
"""
import json, re, sys, zipfile
from pathlib import Path
import numpy as np
from PIL import Image, ImageOps
from pyproj import Transformer
from shapely import make_valid
from shapely.geometry import shape, mapping, Point, Polygon, box
from shapely.ops import transform, unary_union
from importlib import util

ROOT=Path(__file__).resolve().parents[1]; BASE=ROOT.parents[1]
RESEARCH=BASE/'outputs/map-completion/research'; DATA=ROOT/'public/data'
SPEC=util.spec_from_file_location('georef',ROOT/'scripts/georeference-europe.py'); MOD=util.module_from_spec(SPEC);SPEC.loader.exec_module(MOD)
EXTENT=box(-25,32,60,73)
POLYS=[]; RECORDS=[]

def clean(g):
    g=make_valid(g)
    if g.geom_type=='GeometryCollection':g=unary_union([p for p in g.geoms if p.geom_type in ('Polygon','MultiPolygon')])
    return g

def write(path,value):
    path.parent.mkdir(parents=True,exist_ok=True);path.write_text(json.dumps(value,ensure_ascii=False,separators=(',',':'))+'\n')

def svg_geo(file):
    pixel=MOD.read_svg(file)
    anchors={'ad':(1.571,42.547),'li':(9.554,47.159),'mc-7':(7.425,43.738),'sm-1':(12.459,43.942),'va-1':(12.4534,41.9029),'mt':(14.40,35.94)}
    src=np.array([[pixel[k].centroid.x,pixel[k].centroid.y] for k in anchors]);dst=np.array(list(anchors.values()))
    forward=Transformer.from_crs('EPSG:4326','EPSG:3035',always_xy=True); reverse=Transformer.from_crs('EPSG:3035','EPSG:4326',always_xy=True)
    xy=np.array(forward.transform(*dst.T)).T; fit=np.linalg.lstsq(np.column_stack([src,np.ones(len(src))]),xy,rcond=None)[0]
    rms=float(np.sqrt(np.mean(np.sum((np.column_stack([src,np.ones(len(src))])@fit-xy)**2,axis=1))))
    def convert(x,y,z=None):
        xs=np.asarray(x);ys=np.asarray(y)
        return reverse.transform(xs*fit[0,0]+ys*fit[1,0]+fit[2,0], xs*fit[0,1]+ys*fit[1,1]+fit[2,1])
    converted={k:clean(transform(convert,g)) for k,g in pixel.items()}
    write(RESEARCH/(file.stem+'-registration.json'),{'projection':'EPSG:3035 affine registration','anchorRmsMetres':round(rms),'anchors':anchors,'matrix':fit.tolist(),'scope':'Control-point error is not total boundary accuracy; regional masks only. Distant coasts use UMN geometry.'})
    return converted

S=svg_geo(RESEARCH/'europe-1939.svg'); S42=svg_geo(RESEARCH/'europe-1942.svg')
STATES={f['properties']['NAME']:clean(shape(f['geometry'])) for f in json.load(open(BASE/'work/umn-1939-world.geojson'))['features']}
STATES['Soviet Union']=STATES.pop('Union of Soviet Socialist Republics')
GEOMS={}

def geometry(identifier,g,source='umn-historical-borders-1939'):
    g=clean(g.intersection(EXTENT)).simplify(.009,preserve_topology=True)
    # Reconcile tiny simplification slivers to one shared edge. No gap-filling
    # rectangles or modern political boundary data are introduced.
    if GEOMS:g=clean(g.difference(unary_union(list(GEOMS.values()))))
    assert not g.is_empty and g.is_valid,identifier
    GEOMS[identifier]=g;POLYS.append({'type':'Feature','properties':{'id':identifier,'geometryRef':identifier,'sourceId':source},'geometry':mapping(g)})
    return identifier

def record(identifier,name,geo,actor=None,visual='independent',start='1939-08-23',end='1941-07-09',note='',sovereignty=None,admin=None,alignment='Independent',sources=None,accuracy='Generalized historical outline; regional and continental use',uncertainty='Annual source linework and registration are generalized. Local boundary detail is not surveyed.',claim='None'):
    RECORDS.append({'id':identifier,'name':name,'historicalName':name,'geometryRef':geo,'entity':sovereignty or name,'sovereigntyStatus':sovereignty or f'{name}: national territory','militaryControl':actor or name,'occupationAdministration':admin or 'National administration','annexationClaim':claim,'politicalAlignment':alignment,'startDate':start,'endDate':end,'sourceIds':sources or ['umn-historical-borders-1939'],'accuracy':accuracy,'uncertainty':uncertainty,'visualCategory':visual,'note':note})

# Apply the later Hungarian polygon over the older Slovak outline, matching the
# vector's painter order; the raw Slovak path includes the 1938 ceded lands.
central=STATES['Czechoslovakia'].union(STATES['Hungary'])
new_hungary=clean(STATES['Hungary'].union(S['path187'].intersection(central)))
slovakia=clean(STATES['Czechoslovakia'].difference(new_hungary))
protectorate=clean(S['path197'].intersection(STATES['Germany']))
danzig=clean(S['Dankig-Gdansk'].intersection(STATES['Germany']))
memel=clean(S['path189'].intersection(STATES['Lithuania']))
germany=clean(STATES['Germany'].difference(protectorate).difference(danzig).union(memel))
STATES['Lithuania']=clean(STATES['Lithuania'].difference(memel))
STATES['Hungary']=new_hungary
STATES['Slovak Republic']=slovakia
STATES.pop('Germany');STATES.pop('Czechoslovakia')
assert slovakia.covers(Point(17.11,48.15)) and not slovakia.covers(Point(21.26,48.72)), 'Slovak–Hungarian date correction'
geometry('germany-1939',germany,'europe-vector-1939');geometry('protectorate',protectorate,'europe-vector-1939');geometry('danzig',danzig,'europe-vector-1939')
record('germany','German Reich','germany-1939','Germany','german-core',note='Includes Austria and the Sudeten territories incorporated before the invasion. East Prussia is a separate geographical component. The Czech protectorate is shown separately.',sources=['umn-historical-borders-1939','ushmm-czechoslovakia','europe-vector-1939'])
record('protectorate','Protectorate of Bohemia and Moravia','protectorate','Germany','german-civil',sovereignty='Czechoslovak territory under German occupation and incorporation claim',admin='German Reich Protector; subordinate Czech administration',alignment='German-controlled protectorate',sources=['ushmm-czechoslovakia','europe-vector-1939'],note='Established after the German occupation in March 1939. Prague is an administrative centre, not the capital of an independent Czech state.',claim='German protectorate and incorporation claim')
record('danzig-prewar','Free City of Danzig','danzig',visual='independent',end='1939-08-31',sovereignty='Free City under League of Nations protection; specified Polish rights',sources=['ushmm-danzig','occ-danzig','europe-vector-1939'])
record('danzig-annexation','Danzig: German incorporation claim','danzig','Germany','german-claimed',start='1939-09-01',sovereignty='Prewar Free City; incorporation contested',claim='German incorporation from 1 September 1939',sources=['ushmm-danzig','occ-danzig','europe-vector-1939'],note='German control and incorporation are distinguished from Danzig’s prewar international status.')

AXIS={'Slovak Republic','Hungary','Romania','Bulgaria','Italy'}
NEUTRAL={'Switzerland','Liechtenstein','Sweden','Spain','Portugal','Andorra','Monaco','San Marino','Vatican City','Ireland','Turkey'}
EUROPE={'United Kingdom','Ireland','Iceland','France','Belgium','Netherlands','Luxembourg','Spain','Portugal','Andorra','Monaco','Italy','San Marino','Vatican City','Switzerland','Liechtenstein','Denmark','Norway','Sweden','Finland','Soviet Union','Poland','Lithuania','Latvia','Estonia','Hungary','Slovak Republic','Romania','Bulgaria','Albania','Yugoslavia','Greece','Turkey','Malta','Cyprus','Gibraltar','Guernsey','Jersey','Isle of Man','Faroe Islands','Algeria','Morocco','Tunisia'}
for name in sorted(EUROPE):
    if name not in STATES:continue
    identifier=re.sub(r'[^a-z0-9]+','-',name.lower()).strip('-');g=STATES[name]
    geometry(identifier,g,'europe-vector-1939' if name in {'Slovak Republic','Hungary','Lithuania'} else 'umn-historical-borders-1939')
    actor='Soviet Union' if name=='Soviet Union' else name
    visual='soviet-core' if name=='Soviet Union' else 'poland' if name=='Poland' else 'neutral' if name in NEUTRAL else 'aligned' if name in {'Slovak Republic','Italy'} else 'independent'
    end='1940-06-14' if name in {'Lithuania','Latvia','Estonia'} else '1940-04-08' if name in {'Denmark','Norway'} else '1940-05-09' if name in {'France','Belgium','Netherlands','Luxembourg'} else '1941-04-05' if name in {'Yugoslavia','Greece'} else '1939-09-27' if name=='Poland' else '1939-11-20' if name=='Slovak Republic' else '1940-06-27' if name=='Romania' else '1940-08-29' if name=='Hungary' else '1940-09-06' if name=='Bulgaria' else '1940-03-12' if name=='Finland' else '1941-07-09'
    note=''
    sources=['umn-historical-borders-1939']
    alignment='Neutral' if name in NEUTRAL else 'Independent'
    if name=='Slovak Republic':
        alignment='German client state; Axis member from November 1940';sources+=['europe-vector-1939','map-slovak-campaign','ushmm-czechoslovakia'];note='Established in March 1939 under Jozef Tiso and closely subordinated to Germany. Army Bernolák, commanded by Ferdinand Čatloš, participated in the invasion of Poland. The November 21 border transfer is not applied to the October map.'
    if name=='Italy':alignment='German-aligned; Axis signatory from September 1940'
    if name=='Albania':actor='Italy';visual='italian-occupation';alignment='Italian-controlled';note='Occupied by Italy in April 1939; the Albanian crown was assumed by the Italian king.';sources+=['map-europe-expansion']
    record(identifier,name,identifier,actor,visual,end=end,note=note,alignment=alignment,sources=sources)

for r in RECORDS:
    point=GEOMS[r['geometryRef']].representative_point();r['labelCoordinates']=[round(point.x,4),round(point.y,4)]
# Give peripheral land an explicit unresolved context, not unexplained blank space.
all_land=clean(unary_union([g.intersection(EXTENT) for g in STATES.values() if g.intersects(EXTENT)]).union(germany).union(protectorate).union(danzig))
peripheral=clean(all_land.difference(unary_union(list(GEOMS.values()))))
geometry('peripheral-context',peripheral,'umn-historical-borders-1939')
record('peripheral-context','Peripheral geography · status outside verified coverage','peripheral-context','Unresolved','unresolved',sovereignty='Historical political status outside this European reconstruction',admin='Not asserted',note='Physical land outside the verified European polity collection is retained with explicit uncertainty. This includes adjoining Middle Eastern and African territory and peripheral islands; the hatching is not an occupation claim.',sources=['umn-historical-borders-1939'])
RECORDS[-1]['labelCoordinates']=[50,35]
write(DATA/'history/europe-geometries.geojson',{'type':'FeatureCollection','features':POLYS})
write(ROOT/'src/data/territorial-states.json',RECORDS)
write(DATA/'geography/europe-land.geojson',{'type':'FeatureCollection','features':[{'type':'Feature','properties':{'sourceId':'umn-historical-borders-1939'},'geometry':mapping(clean(unary_union(list(GEOMS.values()))))}]})

places=json.load(open(DATA/'geography/reference-places.geojson'))['features']
known={tuple(round(v,2) for v in f['geometry']['coordinates']) for f in places}
for f in json.load(open(BASE/'work/ne_10m_populated_places.geojson'))['features']:
    p=f['properties'];xy=f['geometry']['coordinates'];key=tuple(round(v,2) for v in xy)
    if key in known or not EXTENT.covers(Point(xy)) or p['SCALERANK']>7:continue
    places.append({'type':'Feature','properties':{'name':p['NAME'],'priority':1 if p['SCALERANK']<=3 else 2 if p['SCALERANK']<=5 else 3,'sourceId':'map-natural-earth-physical','note':'Settlement location from Natural Earth; label importance is a display hierarchy, not a verified wartime population rank.'},'geometry':f['geometry']});known.add(key)
rename={'Saint Petersburg':'Leningrad / St Petersburg','St.  Petersburg':'Leningrad / St Petersburg','Kyiv':'Kiev / Kyiv','Brest':'Brest-Litovsk / Brest','Kaliningrad':'Königsberg / Kaliningrad','Gdansk':'Danzig / Gdańsk','Brześć':'Brest-Litovsk / Brześć','Wilno':'Wilno / Vilnius','Lwów':'Lwów / Lviv','Kiev':'Kiev / Kyiv','Daugavpils':'Daugavpils / Dünaburg','Wroclaw':'Breslau / Wrocław','Szczecin':'Stettin / Szczecin','Katowice':'Katowice / Kattowitz','Vitsyebsk':'Vitebsk / Vitsyebsk','Mahilyow':'Mogilev / Mahilyow','Homyel':'Gomel / Homyel','Chernihiv':'Chernigov / Chernihiv','Ternopil':'Tarnopol / Ternopil','Kharkiv':'Kharkov / Kharkiv'}
for f in places:f['properties']['displayName']=rename.get(f['properties']['name'],f['properties']['name'])
capital_specs=[('Berlin','Germany'),('Moscow','Soviet Union'),('Warsaw','Poland'),('Bratislava','Slovak Republic'),('London','United Kingdom'),('Paris','France'),('Rome','Italy'),('Budapest','Hungary'),('Bucharest','Romania'),('Helsinki','Finland'),('Riga','Latvia'),('Tallinn','Estonia'),('Kaunas','Lithuania'),('Sofia','Bulgaria'),('Belgrade','Yugoslavia'),('Athens','Greece'),('Tirana','Albania'),('Oslo','Norway'),('Copenhagen','Denmark'),('Stockholm','Sweden'),('Amsterdam','Netherlands'),('Brussels','Belgium'),('Luxembourg','Luxembourg'),('Dublin','Ireland'),('Lisbon','Portugal'),('Madrid','Spain'),('Bern','Switzerland'),('Ankara','Turkey')]
old=json.load(open(ROOT/'src/data/capitals.json')); caps=[]
for name,country in capital_specs:
    f=next((f for f in places if f['properties']['name']==name),None)
    original=next((c for c in old if c['name']==name),None)
    raw=next((x for x in json.load(open(BASE/'work/ne_10m_populated_places.geojson'))['features'] if name in [x['properties'].get('NAME'),x['properties'].get('NAME_EN'),x['properties'].get('NAMEASCII')]),None)
    xy=original['coordinates'] if original else f['geometry']['coordinates'] if f else raw['geometry']['coordinates'] if raw else None
    assert xy,name
    caps.append({'id':name.lower(),'name':name,'capitalOf':country,'coordinates':xy,'kind':'capital','startDate':'1939-08-23','endDate':'1941-07-09','sourceIds':['map-natural-earth-physical','map-europe-baseline'],'accuracy':'Generalized city centre; marker distinguishes capital designation from the controlling authority.'})
for name,country,xy,start in [('Prague','Czech protectorate',[14.42,50.08],'1939-08-23'),('Vichy','French State',[3.425,46.126],'1940-07-10'),('Zagreb','Independent State of Croatia',[15.98,45.82],'1941-04-10')]:
    caps.append({'id':name.lower(),'name':name,'capitalOf':country,'coordinates':xy,'kind':'administrative','startDate':start,'endDate':'1941-07-09','sourceIds':['map-europe-expansion','map-natural-earth-physical'],'accuracy':'Administrative seat, not an assertion of internationally recognized state sovereignty.'})
capital_locations={tuple(round(v,2) for v in c['coordinates']) for c in caps if c['kind']=='capital'}
places=[f for f in places if tuple(round(v,2) for v in f['geometry']['coordinates']) not in capital_locations]
write(ROOT/'src/data/capitals.json',caps);write(DATA/'geography/europe-places.geojson',{'type':'FeatureCollection','features':places})

# Uniform physical geography; contemporary natural features only, not modern
# administrative lines or reservoirs. City coordinates identify settlements,
# not wartime size or headquarters.
physical=DATA/'geography'
lakes=[]
for f in json.load(open(RESEARCH/'natural-earth-lakes.geojson'))['features']:
    p=f['properties'];g=shape(f['geometry'])
    if p.get('featurecla')=='Reservoir' or not g.intersects(EXTENT):continue
    g=clean(g.intersection(EXTENT)).simplify(.005,preserve_topology=True)
    if g.is_empty:continue
    lakes.append({'type':'Feature','properties':{'name':p.get('name') or 'Natural lake','sourceId':'map-natural-earth-physical','rank':p.get('scalerank',5)},'geometry':mapping(g)})
write(physical/'europe-lakes.geojson',{'type':'FeatureCollection','features':lakes})
rivers=[]
for file in ['ne_10m_rivers_lake_centerlines.geojson','ne_10m_rivers_europe.geojson']:
    for f in json.load(open(BASE/'work'/file))['features']:
        p=f['properties'];g=shape(f['geometry'])
        if 'canal' in (p.get('featurecla','')+' '+(p.get('name') or '')).lower():continue
        if not g.intersects(EXTENT):continue
        name=p.get('name_en') or p.get('name')
        if not name:continue
        g=g.intersection(EXTENT).simplify(.007,preserve_topology=True)
        if g.is_empty or g.geom_type not in ('LineString','MultiLineString'):continue
        name={'Dnepr':'Dnieper','Daugava':'Western Dvina / Daugava','Nemunas':'Niemen / Neman','Wisla':'Vistula','Odra':'Oder'}.get(name,name)
        rank=p.get('scalerank',9)
        rivers.append({'type':'Feature','properties':{'name':name,'rank':rank,'sourceId':'map-natural-earth-physical','note':'Generalized natural river course. Modern river geometry is not proof of a wartime crossing, reservoir or navigation condition.'},'geometry':mapping(g)})
write(physical/'europe-rivers.geojson',{'type':'FeatureCollection','features':rivers})

# Crop and reproject relief rows to Web Mercator before using an image source,
# avoiding the distortion of placing an equirectangular image on Mercator.
Image.MAX_IMAGE_PIXELS=None
with zipfile.ZipFile(RESEARCH/'natural-earth-relief.zip') as archive:
    with archive.open('NE2_50M_SR/NE2_50M_SR.tif') as stream:im=Image.open(stream);im.load()
    width,height=im.size
    x0=int(((-25+180)/360)*width);x1=int(((60+180)/360)*width)
    y0=int(((90-73)/180)*height);y1=int(((90-32)/180)*height)
    crop=im.crop((x0,y0,x1,y1)).convert('L').resize((1700,1300))
    arr=np.asarray(crop); north=np.log(np.tan(np.pi/4+np.radians(73)/2));south=np.log(np.tan(np.pi/4+np.radians(32)/2))
    lats=np.degrees(2*np.arctan(np.exp(np.linspace(north,south,1500)))-np.pi/2)
    rows=np.clip(((73-lats)/(73-32)*1299).astype(int),0,1299)
    Image.fromarray(arr[rows,:]).save(physical/'europe-relief.jpg',quality=82,optimize=True)
print(f'Stage A: {len(POLYS)} shared geometries, {len(RECORDS)} states, {len(lakes)} natural lakes, {len(rivers)} rivers.')
