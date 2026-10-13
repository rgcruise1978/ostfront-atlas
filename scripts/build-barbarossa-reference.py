"""Build a bounded, generalized 21 June 1941 territorial map from atlas geometry.

Requires Shapely 2.x. This is an opening control reference, not a dated front map.
The Romanian cut follows the Natural Earth Prut and a schematic northern
Bukovina/Danube connector. It must not be used as a surveyed boundary.
"""

import json
from pathlib import Path

from shapely.geometry import LineString, Point, box, mapping, shape
from shapely.ops import split
from shapely.validation import make_valid


ROOT = Path(__file__).resolve().parents[1]
HISTORY = ROOT / 'public/data/history'
GEOGRAPHY = ROOT / 'public/data/geography'
THEATRE = box(5, 43, 43, 64)
DATES = {'startDate': '1941-06-21', 'endDate': '1941-07-09'}


def features(path):
    return json.loads(path.read_text())['features']


def write(name, items):
    (HISTORY / name).write_text(json.dumps({'type': 'FeatureCollection', 'features': items}, ensure_ascii=False, separators=(',', ':')) + '\n')


def feature(identifier, title, geometry, **properties):
    geometry = make_valid(geometry).intersection(THEATRE).simplify(.008, preserve_topology=True)
    assert not geometry.is_empty and geometry.is_valid, identifier
    return {'type': 'Feature', 'properties': {'id': identifier, 'title': title, **DATES, **properties}, 'geometry': mapping(geometry)}


states = {item['properties']['name']: shape(item['geometry']) for item in features(HISTORY / 'surrounding-1939-reference.geojson')}
poland = {item['properties']['actor']: shape(item['geometry']) for item in features(HISTORY / 'control-areas.geojson')}
prut = next(item['geometry']['coordinates'][0] for item in features(GEOGRAPHY / 'surrounding-rivers.geojson') if item['properties']['name'] == 'Prut')
start = min(range(len(prut)), key=lambda i: (prut[i][0] - 26.7) ** 2 + (prut[i][1] - 48.25) ** 2)
prut_cut = LineString([[25.5, 49], [25.7, 48.6], [26.0, 48.37], *prut[start:], [28.75, 45.23], [29.2, 45.3], [29.75, 45.17], [31, 45]])
pieces = list(split(states['Romania'], prut_cut).geoms)
assert len(pieces) == 2
bessarabia = next(piece for piece in pieces if piece.contains(Point(28.857711, 47.005024)))
romania = next(piece for piece in pieces if piece.contains(Point(26.098001, 44.435318)))
# Approximate the 1940 Second Vienna Award area from the USHMM Romania 1941 map.
# The curved real demarcation is reduced to broad city-anchored waypoints.
northern_transylvania_mask = shape({'type':'Polygon','coordinates':[[
    [20.9,47.3],[22.0,48.3],[23.0,48.5],[24.4,48.35],[25.1,47.7],
    [25.35,47.0],[25.75,46.0],[25.5,45.85],[25.0,46.15],[24.65,46.35],
    [24.2,46.37],[23.7,46.55],[23.25,46.54],[22.7,46.45],
    [22.15,46.6],[21.65,46.75],[20.9,47.3]
]]})
northern_transylvania = romania.intersection(northern_transylvania_mask)
romania = romania.difference(northern_transylvania)
hungary = states['Hungary'].union(northern_transylvania)
assert northern_transylvania.contains(Point(23.59,46.77)) and not northern_transylvania.contains(Point(25.6,45.65))

shared = {
    'category': 'opening_control_reference',
    'accuracy': 'Generalized 21 June 1941 territorial reference; not a daily battlefront',
    'uncertainty': 'Some outlines come from an annual 1939 reconstruction. The division of occupied Poland follows a schematic 1939 treaty trace. Local occupations and later 1941 advances are not resolved.',
}


def controlled(identifier, title, geometry, actor, note, source_ids, legal_status):
    return feature(identifier, title, geometry, actor=actor, note=note, sourceIds=source_ids, legalStatus=legal_status, **shared)


control = [
    controlled('barbarossa-germany-1939-core', 'German core and East Prussia', states['Germany'], 'Germany', 'The 1939 national outline is used for the German core and East Prussia. Occupied Polish territory is shown separately.', ['umn-historical-borders-1939'], 'German state territory in the source outline'),
    controlled('barbarossa-german-held-poland', 'German-held former Polish territory', poland['Germany'], 'Germany', 'German occupation and annexation claims are grouped in this broad sector. The fill does not recognize a transfer of Polish sovereignty.', ['umn-historical-borders-1939', 'us-state-frus-1939-border-report', 'ushmm-german-administration'], 'German occupation; Poland did not accept the partition'),
    controlled('barbarossa-soviet-1939-core', 'Soviet pre-expansion territory', states['Soviet Union'], 'Soviet Union', 'The 1939 national outline provides the underlying Soviet area; subsequent western acquisitions are added separately.', ['umn-historical-borders-1939'], 'Soviet state territory in the source outline'),
    controlled('barbarossa-soviet-held-poland', 'Soviet-held former Polish territory', poland['Soviet Union'], 'Soviet Union', 'Soviet-controlled Polish lands after the 1939 invasion. The atlas retains the distinction between control and lawful sovereignty.', ['umn-historical-borders-1939', 'us-state-frus-1939-border-report', 'ushmm-invasion-poland'], 'Soviet occupation and annexation claims; Poland did not accept the partition'),
]

for name in ('Lithuania', 'Latvia', 'Estonia'):
    control.append(controlled(f'barbarossa-soviet-{name.lower()}', f'{name} under Soviet control', states[name], 'Soviet Union', f'{name} was occupied and annexed by the Soviet Union in 1940. Its former state outline remains visible here as a geographic and administrative reference.', ['umn-historical-borders-1939', 'ushmm-soviet-annexations-map'], 'Soviet occupation and annexation; recognition was contested'))

control.append(controlled('barbarossa-soviet-bessarabia-bukovina', 'Bessarabia and northern Bukovina under Soviet control', bessarabia, 'Soviet Union', 'Schematic 1940 Soviet-controlled sector cut from the 1939 Romanian outline. Its western edge follows the Prut in the south; northern Bukovina and the Danube delta are generalized.', ['umn-historical-borders-1939', 'ushmm-romania-1941-map', 'natural-earth-10m'], 'Soviet occupation and annexation in 1940'))
write('barbarossa-1941-opening-control.geojson', control)

neighbors = [
    feature('barbarossa-romania', 'Romania after the 1940 territorial losses', romania, name='Romania', actor='Romania', category='neighbor-boundary-reference', note='Romania after the Soviet seizure of Bessarabia/northern Bukovina and Hungarian acquisition of northern Transylvania. Local linework is generalized.', sourceIds=['umn-historical-borders-1939', 'ushmm-romania-1941-map'], uncertainty='Northern Transylvania and Bukovina boundaries are broad schematic reconstructions; the separate Bulgarian frontier adjustment is not resolved.'),
    feature('barbarossa-hungary', 'Hungary including northern Transylvania', hungary, name='Hungary', actor='Hungary', category='neighbor-boundary-reference', note='Northern Transylvania passed to Hungary under the Second Vienna Award in 1940. The boundary here is generalized from the USHMM 1941 map.', sourceIds=['umn-historical-borders-1939', 'ushmm-romania-1941-map'], uncertainty='The 1940 Hungarian–Romanian boundary is schematic and should not be read as a surveyed line.'),
]
write('barbarossa-1941-neighbors.geojson', neighbors)

partition = shape(features(HISTORY / 'poland-1939.geojson')[0]['geometry'])
east_prussia = states['Germany'].boundary.intersection(states['Lithuania'].boundary)
assert east_prussia.length > 1
frontier_common = {'category': 'opening_frontier_reference', 'sourceIds': ['loc-barbarossa-atlas', 'ushmm-barbarossa'], 'accuracy': 'Generalized opening frontier, not a dated troop position', 'uncertainty': 'The 1939 treaty trace is schematic; the Prut section follows generalized modern river geometry. Later fighting, pockets and local boundary adjustments are not shown.'}
frontier = [
    feature('barbarossa-partition-frontier', 'German–Soviet invasion frontier through occupied Poland', partition, note='The division through occupied Poland at the opening of Barbarossa. It was imposed by the 1939 German–Soviet agreement and was not a lawful Polish state border.', sourceIds=['us-state-frus-1939-border-report', 'loc-barbarossa-atlas'], **{k:v for k,v in frontier_common.items() if k != 'sourceIds'}),
    feature('barbarossa-east-prussia-frontier', 'East Prussia–Soviet Lithuania frontier', east_prussia, note='The 1939 Germany–Lithuania boundary is used here as the opening frontier between East Prussia and Soviet-controlled Lithuania.', **frontier_common),
    feature('barbarossa-prut-frontier', 'Prut and northern Bukovina frontier', prut_cut.intersection(states['Romania']), note='Generalized opening frontier between Romania and Soviet-held Bessarabia/northern Bukovina. The river section is geographic reference; the northern and delta connectors are schematic.', sourceIds=['ushmm-romania-1941-map', 'natural-earth-10m'], **{k:v for k,v in frontier_common.items() if k != 'sourceIds'}),
]
write('barbarossa-1941-opening-frontier.geojson', frontier)

labels = [
    ('Germany', 'main', 10.5, 51.2), ('East Prussia', 'region', 20.5, 54.35),
    ('German-held former Poland', 'region', 20.6, 51.5),
    ('Soviet Union', 'main', 37.1, 54.2), ('Soviet-held former Poland', 'region', 25.2, 51.7),
    ('Lithuanian SSR', 'region', 24.2, 55.25), ('Latvian SSR', 'region', 25.3, 57.2),
    ('Estonian SSR', 'region', 25.8, 58.8), ('Bessarabia', 'region', 28.7, 47.1),
    ('Romania', 'boundary', 25.0, 45.7), ('Hungary', 'boundary', 20.4, 47.2),
    ('Northern Transylvania', 'region', 23.8, 47.35),
    ('Finland', 'region', 23.0, 61.25), ('Belarus', 'region', 30.1, 53.1),
    ('Ukraine', 'region', 31.9, 48.7),
]
write('barbarossa-1941-area-labels.geojson', [
    {'type':'Feature','properties':{'name':name,'label':name,'kind':kind,'sourceIds':['loc-barbarossa-atlas']},'geometry':{'type':'Point','coordinates':[lon,lat]}}
    for name,kind,lon,lat in labels
])

places = features(GEOGRAPHY / 'reference-places.geojson')
renames = {'Brześć': ('Brest-Litovsk', 'Brześć/Brest; period city name used in 1941 campaign sources.'), 'Wilno': ('Vilnius', 'Vilnius; Polish Wilno and German Wilna are also found in period sources.'), 'Lwów': ('Lviv', 'Lviv; Polish Lwów and German Lemberg are also found in period sources.')}
for item in places:
    old = item['properties']['name']
    if old in renames:
        item['properties']['name'], item['properties']['note'] = renames[old]
        item['properties']['nameSourceId'] = 'loc-barbarossa-atlas'
for name, coords, note in [
    ('Leningrad', [30.3158,59.9343], 'Leningrad in 1941; present-day Saint Petersburg.'),
    ('Helsinki', [24.941,60.17], 'Capital of Finland; a geographic reference, not a mapped battle position.'),
    ('Vyborg', [28.74,60.71], 'Vyborg/Viipuri in the Finnish–Soviet border region.'),
]:
    places.append({'type':'Feature','properties':{'name':name,'priority':1,'kind':'reference-place','sourceId':'natural-earth-10m','nameSourceId':'loc-barbarossa-atlas','note':note},'geometry':{'type':'Point','coordinates':coords}})
(GEOGRAPHY / 'barbarossa-reference-places.geojson').write_text(json.dumps({'type':'FeatureCollection','features':places},ensure_ascii=False,separators=(',',':'))+'\n')
print(f'Built {len(control)} opening control regions, {len(frontier)} frontier segments, {len(labels)} area labels and {len(places)} places.')
