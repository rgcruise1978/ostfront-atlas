# Ostfront Atlas shared historical geography

Prepared 14 October 2026. Regional reconstructions, not cadastral boundaries.

## Current coverage — all 31 selections

The system also includes nine Phase III dates from August 26 through September 29, 1941, with feature-specific observation dates, source locators, and regional precision notes. Earlier research qualifications below remain applicable to their stated dates.

The shared system includes nine Phase II dated regional situations, 400 dated formation records, 27 operational contact segments and schematic communication corridors. July 10/16/23 printed evening sheets and the U.S. Army Map 8 for July 30 were inspected. Five August German daily sheets were inaccessible; named operations use published Soviet reports and U.S. Army histories, with lower-confidence connecting edges explicitly qualified. These are original geographic interpretations, not georeferenced copies or secure-control claims. Full source locators and unresolved details are in `../../../../../outputs/all-maps-upgrade/RESEARCH_NOTES.txt` and each feature's source/accuracy fields.

`additional-natural-rivers.geojson` contains Mshaga and Sinyukha natural courses adapted from OpenStreetMap ways, with upstream IDs and © OpenStreetMap contributors, ODbL attribution. It remains a separate ODbL physical dataset and is not relicensed as CC BY-SA political geometry. Modern channel geometry does not prove the exact 1941 course or a dated bridge condition. `reference-borders.geojson` preserves 23 August 1939 identities across later occupation. Country and controlling power remain distinct. Full research scans remain outside `public/`.

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

The optional transport overlay contains schematic communications corridors and selected nodes. It does not reproduce surveyed period track or road geometry, establish an operating railhead, or imply continuous service. Each feature retains its source and precision notes.

## Verification

`validate-data.mjs` checks all 32 study routes, citations and authors, plus five Polish and 26 Barbarossa selections. `validate-map-geography.py` checks polygon validity, adjacent-region overlap, source references, date ranges, primary city membership, chronology, operational changes and byte-identical article files against the start-of-task backup. Those tests establish technical and chronology coherence; they do not certify the unresolved fine boundaries above.
