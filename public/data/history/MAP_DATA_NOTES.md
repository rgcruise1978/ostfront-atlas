# Ostfront Atlas shared historical geography

Prepared 14 October 2026. Regional reconstructions, not cadastral boundaries.

## Data and reuse

| Source | Coverage / use | Rights and modifications |
|---|---|---|
| University of Minnesota, Kropelnicki, Johnson, Kne and Lindberg, Historical National Boundaries, 1939 | Annual historical national outlines; shared European land and baseline states | CC BY 3.0 US. Clipped to Europe and adjoining visible land, simplified, repaired and split. Annual data do not establish an exact day. https://doi.org/10.13020/146x-1412 |
| Goran tek-en, Alphathon, maix and other Commons contributors, Blank map of Europe March–September 1939 | Central European subdivisions, Protectorate, Danzig and Hungarian territorial position | CC BY-SA 4.0. Registered to geographic coordinates, masks extracted and reconciled with the annual outlines. Adaptations remain CC BY-SA 4.0. https://commons.wikimedia.org/wiki/File:Blank_map_of_Europe_March_-_September_1939.svg |
| Europe 1942, Commons contributors | Selected linework for independently checked occupation / administrative regions | CC BY-SA 3.0, adaptations offered under compatible CC BY-SA 4.0. The 1942 front and later Finnish reconquests are not backdated. Registration and clipping are regional, not surveyed. https://commons.wikimedia.org/wiki/File:Europe_1942.svg |
| Natural Earth, Tom Patterson, Nathaniel Vaughn Kelso and NACIS contributors | Natural rivers, lakes, settlement locations, 50m physical relief | Public domain. European crop and simplification; relief converted to grayscale and reprojected for MapLibre. Reservoirs and canals excluded. Modern political borders and transport networks are not used. https://www.naturalearthdata.com/about/terms-of-use/ |
| German General Staff, Der Feldzug gegen Sowjet-Russland, compiled 1942, Library of Congress map51000141 | Printed sheets 4, 5, 8, 11, 14, 16, 19, 22: the eight existing June 21–July 9 snapshots | Research reference only; no map artwork redistributed. Independent, approximate operational interpretations on the licensed territorial foundation. German reporting and assessed Soviet intelligence are qualified. https://www.loc.gov/item/map51000141/ |
| U.S. Army, The German Campaign in Poland, Part III, map 10 | Early morning September 17 reported military situation | Research reference; independent regional interpretation, retaining Polish resistance. https://www.ibiblio.org/hyperwar/USA/DAP-Poland/Campaign-III.html |

CShapes was investigated but is not incorporated. Its CC BY-NC-SA terms and wartime coverage limits are not assumed suitable for this atlas.

The registered European political geometry and derivatives in `europe-geometries.geojson`, `military-control.geojson` and `territorial-changes.geojson` are distributed as CC BY-SA 4.0 adaptations, with the above attribution. https://creativecommons.org/licenses/by-sa/4.0/ . This does not relicense the site's articles or software. Natural Earth physical files remain public domain. The original General Staff map artwork is not included.

## Interpretation and precision

Sovereignty, effective authority, occupation administration, incorporation claims and alignment have separate dated fields. Prewar Polish sovereignty survives the occupation layer. Gray associates German authority; red associates Soviet authority; aligned states retain their own colors and institutions.

Forward operational areas summarize source-reported activity on a printed date. Their city-anchored edges are not a surveyed continuous front, proof of secure occupation, annexation, or a reconstruction of every unit itinerary. Separate pocket patches indicate regions of continued resistance; their perimeter is approximate. Scattered rear resistance is retained as dated markers after large encirclements contracted.

The September 28 line is the treaty's political division, not the actual military front or a claim that every handover was already complete. Later October and November administrations are not backdated.

Local limits that remain unresolved:

- Slovakia's November 21, 1939 Spisz/Orawa transfers are verified and marked on the 1941 maps; their exact perimeter is not digitized. The September outline is a qualified regional reference, not an exact 1941 cadastral border. The additional licensed Slovak reference maps were checked but were insufficient to establish a trustworthy georeferenced district perimeter.
- October Łódź administrative boundaries are unresolved. The city remained in the General Government until November 9; a hatched search region, whose edges are not historical borders, identifies missing precision. No invented circular district is used.
- Finnish cessions, southern Dobruja, northern Transylvania and the Greek/Yugoslav occupation subdivisions are regional interpretations. Hanko, small islands, shared Athens control and minor enclaves use point explanations or uncertainty notes. Later 1942 occupation changes are excluded.
- Vilnius's transfer to Lithuania and subsequent incorporation into the Lithuanian SSR are not represented by a surveyed internal Soviet-republic boundary. Baltic prewar outlines identify historic sovereignty; they are not asserted to be exact 1941 SSR administrative borders.
- Peripheral land outside the verified European states is explicitly hatched as unresolved historical status, rather than silently shown as an independent state.

Historical rail and road overlays are omitted because a suitably verified, reusable period dataset was not established.

## Verification

`validate-data.mjs` preserves all article routes, citations, authors and the five Polish / eight Barbarossa selections. `validate-map-geography.py` checks polygon validity, adjacent-region overlap, source references, date ranges, primary city membership, chronology, operational changes and byte-identical article files against the start-of-task backup. Those tests establish technical and chronology coherence; they do not certify the unresolved fine boundaries above.
