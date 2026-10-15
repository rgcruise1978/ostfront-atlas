# Phase IV map reconstruction — research and coverage review

## Scope and method

Ten independently dated regional situations, 30 September–14 November 1941. The existing MapLibre engine, routes, controls and `cartography.js` palette are retained. The 42 article JSON files remain byte-identical. Formation points identify operational sectors, not headquarters. Hatching denotes reported reach or occupation with consolidation unresolved; a connecting contact line is not a surveyed tactical front.

The article-to-map record contains all 341 published paragraphs, including historical asides, and 1,984 sentence records. Every paragraph is available in the map's **Study context** panel with article section, source locators and relevant feature links. Features link back to the article and its matching contextual passages. A sentence retained contextually is not presented as a precisely mapped claim. Numerical analysis, testimony without an established site, diplomatic decisions and later outcomes remain contextual. The coverage file is an accounting of the entire text, not proof that every sentence has independently established coordinates.

## Evidence inspected

- Ziemke and Bauer, *Moscow to Stalingrad*, CMH Chapters II, III and VII, accessible full text: dated operational sequence, changing objectives, Serpukhov counterblow, and Tikhvin/Ladoga communications.
- CMH Map 2, printed p.26: **22 June–12 November 1941**. Full image examined. Army Group boundaries, principal localities, advance directions and the solid 12 November front. This retrospective regional map has no surveyed accuracy or map-time hour. It is a late-period cross-check, not a 30 September–October situation map, and not a 14 November sheet. Scale is not transcribed; no distance measurements are inferred from the downloaded image. U.S. government historical map; original vectors created rather than reproducing its artwork.
- CMH Map 3, printed p.46: **15 November–5 December 1941**. Full image examined. Only the dotted 15 November starting line and locality/rail geography cross-check the adjacent-date November synthesis. Later arrows, positions and December fronts are excluded. No hourly accuracy, survey scale or inferred tactical precision. U.S. government historical map.
- U.S. Military Academy, *The War in Eastern Europe*, 1949, printed pp.42–47, especially p.44 footnote. Full PDF text examined. The Hoth/Reinhardt change effective 5 October is applied to the map, with the published 7 October article's older Hoth wording qualified in the feature note. This older official account is cross-checked, not treated as infallible.
- Blau's official planning/operations study and Kirchubel's accessible campaign text: army group sectors, envelopment, southern chronology and regional directions. Accessible Stahel extracts support the division between containment and pursuit and readiness context; subscription-only full chapters are not claimed read.
- Primary GKO orders and U.S. FRUS diplomatic correspondence: evacuation destinations, Moscow emergency responsibilities and supply negotiations. Catalogue-only Stavka directive access is explicitly identified as such in the feature, not passed off as a full-text reading.
- Institutional museum/academic sources already cited in the published studies support occupation, civilian experience, industrial evacuation and local events. Personal testimony is kept at its documented place/time; Wolf Dose is not relocated to a convenient precise coordinate.
- USHMM Transnistria article and full regional map examined: Romanian authority is separated from German authority, Odessa's Soviet defense lasts until 16 October, and no sovereign Romanian annexation is inferred. Original polygon uses the natural Dniester/Southern Bug courses and a generalized northern administrative limit. This is qualified regional geography, not a cadastral perimeter.
- Estonian War Museum studies of Sõrve/Osmussaar and Ain Tähiste's Hiiumaa daily chronology: Sõrve remains Soviet in the first two snapshots; Hiiumaa remains Soviet before the 12 October landings and has contested island-scale coverage through 19 October. Its campaign ends 21 October. The small Osmussaar garrison remains a point through the whole phase because the outline dataset omits that island.
- Official OSM API relation/member/node records examined for Moskva, Protva, Zusha, Lama and Upa. Relation IDs, versions and individual API URLs appear in `river-provenance.json`. ODbL attribution appears on maps and exports. These modern natural courses provide orientation, not 1941 water levels or reservoir extents.

## Access limits and precision decisions

The Library of Congress candidate map sheets were blocked by the service security gate. They were not read, georeferenced or digitized, and catalogue listings are not presented as examined source maps. The reconstruction therefore uses the accessible official histories, inspected CMH maps, named localities and dated evidence described above. Fine daily contact segments, individual depots/bridges, exact divisional headquarters, uninterrupted rail service, convoy capacities and village-by-village control remain unresolved. Those limitations appear in public feature notes and the map reconstruction notice.

Army formations have comparable German/Soviet coverage, but some Soviet commanders and exact unit footprints remain unestablished. Blank commander fields are deliberate. Soviet fronts remain command formations distinct from contact lines. German motorized corps retain the 1941 designation. Plans are separately patterned and off by default. No later Tikhvin counteroffensive, Rostov capture, completed Moscow encirclement or November ice road is imported into an earlier map.

Ladoga water transport is shown as possible and hazardous, with transshipment and onward delivery; no claim of sufficient capacity. Industrial removal, transfer, later reassembly and resumed output remain separate. Rubtsovsk is a distant destination card, not a route clipped at the edge of Europe. Government destinations do not claim Stalin actually departed.

## Preservation and verification

The Phase IV validator checks ten distinct front reconstructions; city ownership chronology for Orel, Kalinin, Kharkov and Tikhvin; Soviet-held Moscow, Tula, Sevastopol, Kerch and Rostov; full German national outline; source locators; article-section links; all paragraph/sentence context records; and unchanged article/palette hashes. The existing geography validator retains earlier collection gates. Earlier non-Phase-IV historical GeoJSON features are compared semantically against baseline `0910665` separately.

The browser review covers every date at 1440px and 390px, feature/source/context navigation, six secondary theatres, Operations/Logistics PNG exports, and Poland/Phase I/Phase II/Phase III regressions. Review records distinguish local testing from hosted preview and production evidence. A successful automated test establishes technical coherence; it does not remove historical precision limitations.

## Dated feature inventory

| Date | Areas | Formations | Operations / events | Front segments | Logistics | Article paragraphs |
|---|---:|---:|---:|---:|---:|---:|
| 1941-09-30 | 3 | 40 | 10 | 3 | 17 | 35 |
| 1941-10-02 | 3 | 40 | 9 | 3 | 17 | 34 |
| 1941-10-07 | 6 | 36 | 13 | 3 | 17 | 33 |
| 1941-10-13 | 7 | 30 | 15 | 3 | 17 | 33 |
| 1941-10-16 | 6 | 34 | 22 | 3 | 17 | 34 |
| 1941-10-19 | 6 | 39 | 26 | 3 | 16 | 33 |
| 1941-10-24 | 3 | 39 | 28 | 3 | 16 | 33 |
| 1941-11-02 | 3 | 39 | 32 | 4 | 16 | 36 |
| 1941-11-09 | 3 | 39 | 36 | 4 | 17 | 35 |
| 1941-11-14 | 3 | 38 | 39 | 4 | 17 | 35 |

Context dispositions: qualified: 1490, contextual: 494. Every row includes an implementation disposition and a linked public paragraph.
