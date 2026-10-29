# Ostkrieg atlas reconstruction — review candidate

This candidate extends the combined harmonized website at `f4fc84dd9c819c731c6d9d614e45c3e65c613176` on `codex/harmonized-atlas-reconstruction`. It covers all 12 collections through February 2, 1943. It is ready for editorial and cartographic review, not certified as a complete historical atlas.

The 49 Volume One selections and all 37 earlier Volume Two selections remain. Thirty supported dates bring Volume Two to 67 selections and the whole atlas to 116. The 51 earlier Volume Two event markers remain unchanged. Separate from those markers, 137 new source-map features have been added. All 85 numbered chapters, the Poland introduction, 1,542 native-note texts, 216 asides and two tables are preserved.

## Improvements by collection

| Collection | Selections | Work beyond locality markers |
|---|---:|---|
| I — Poland | 5 retained | Reviewed invasion/treaty chronology; preserved distinctions among borders, occupation and administrative claims; current harmonized context and evidence exports. No new border reconstruction claimed. |
| II — Barbarossa opening | 8 retained | Added separately qualified Kaunas, Bialystok and Iasi civilian localities; current section links; period-name screening and improved label collision behavior. |
| III — Drive into the interior | 9 retained | Reviewed Smolensk/Uman/Gomel/turn-south chronology at narrative level; retained qualified operational geometry; current context and export provenance. |
| IV — Strategic objectives | 9 retained | Corrected four Hiiumaa records: September Soviet-held context replaces premature German bridgeheads. Mainland geometry retained; current context and exports. |
| V — Autumn offensive | 10 retained | Reviewed Typhoon and southern/northern chronology; retained dated regional, urban and evacuation views; current context and exports. |
| VI — Offensive exhausted | 8 retained | Reviewed Yakhroma, Rostov, Tikhvin and the staggered Moscow counteroffensive; retained qualified geometry; current context and exports. |
| VII — Moscow counterstroke | 6, including 2 new | 20 traces: December 6/15/16 and January 1 front fragments, directions, sector labels, Moscow railway and earlier Tikhvin salient/railway. Northern and Tula–Kaluga developments retain distinct chronology. |
| VIII — Winter offensive | 11, including 4 new | 28 traces: Rzhev–Vyazma penetrations, Toropets/Kholm/Demyansk/Lyuban contacts, Demyansk pocket, later relief connections, Barvenkovo salient and railway. Separate regional views prevent conflating these operations. |
| IX — Spring disasters | 12, including 8 new | 18 traces: Kerch opening defenses and interval directions; Kharkov opening salient, gains, counteroffensive and successive contact/pocket lines. Sevastopol forts, terrain and dated fronts remain available at the historical plate's own scale. |
| X — Case Blue | 7, including 2 new | 17 traces: optional intended objectives, June 28/July 11 and July 14/31 contacts, command sectors, operational directions and railway context. Planned objectives are separated from executed movements. |
| XI — Caucasus and Stalingrad | 15, including 9 new | 27 traces: Kuban/Maykop/Terek contacts, mountain barrier and railway, Don approaches, Nalchik/Gizel directions, Sinyavino opening and counterattack. Two detailed city plates show Stalingrad factories, railways, heights and changing urban positions without invented modern block boundaries. |
| XII — Winter reversal | 16, including 5 new | 27 traces: Uranus sectors and junction vicinity, changing regional pocket/relief contacts, approximate airfields, Winter Storm and Little Saturn, Mars and Velikiye Luki, January theater reach and a generalized Iskra change zone. Ring's January 10/12/17 perimeters remain in the detailed source plate. |

## Evidence and reconstruction

Twenty-seven U.S. Army Center of Military History plates were inspected; 26 are reproduced unchanged with credits and hashes. Twenty-three plates supply source-pixel traces and documented settlement controls. The complete *Stalingrad to Berlin* map 10 reaches March 1943 and is excluded from the public plate set; only its explicitly dated January 12–19 Ladoga change zone is used.

The registration is an unweighted two-dimensional affine fit from source pixels to WGS84 longitude/latitude. Source projections are unstated, and no projection is invented. Fit and leave-one-out residuals are recorded per control and plate. They measure registration performance, not the historical accuracy of the source or a confidence radius. The broad southern-theater plate has about 9.8 km fit RMSE and 16.7 km leave-one-out RMSE; it supports regional interpretation only. Narrow corridors and urban sites require substantially better evidence.

Traces preserve open source gaps. Direction arrows summarize the dates printed on their source, and are not road itineraries. Formation points locate printed sector labels, not headquarters or complete unit frontages. Earlier lines carry their own dates and a different dash pattern. Later lines are not silently shown on earlier selections. Plans are optional and off by default. Source plates have a separate warning because a single plate may compare several dates.

Current study context is read from the actual harmonized article sections and notes. No older paragraph-number association is imported. Original article files and cached manuscript-context hashes remain intact. The PR #26 material was reviewed selectively: four Hiiumaa corrections, three civilian records, label collision behavior and export utilities were reconciled with the combined candidate. The older branch and its context cache were not merged wholesale.

Modern Volgodonsk, Zheleznogorsk and Dubna labels are suppressed; the western Donetsk label uses Stalino. Suppression does not imply that no earlier settlement existed nearby. The modern Don course is removed from Volume Two; a source-traced pre-reservoir course is shown where supported in Part XII. Other modern physical-reference layers remain generalized and cannot establish every wartime shoreline. The postwar reservoir shown in some later published source maps is explicitly warned about and is not traced.

## Registers

- [Every map: JSON](atlas-map-coverage.json) and [compact CSV](atlas-map-coverage.csv): 116 rows, including chapter sections, existing layers, changes, sources, limits and desktop/phone outcomes.
- [Feature provenance](atlas-feature-provenance.json): 137 traces, four corrected Hiiumaa records and three civilian localities, with dates, methods, locators, rights and uncertainty.
- [Source plates and rights](atlas-sources-and-rights.json), [actual source access](atlas-source-access.json), and the preserved full [source catalog](../src/data/sources.json).
- [Georeferencing controls and diagnostics](../public/data/history/atlas-georeferencing.json); [reviewable source-pixel traces](../scripts/reconstruction/traces.json).
- [New dates, layers and views](atlas-new-dates-and-views.json); [Volume One changes and before/after records](atlas-volume-one-corrections.json).
- [Recoverable baseline](atlas-baseline.json), [authorized preservation exceptions](atlas-authorized-changes.json), and [geometry checks](atlas-geometry-checks.json).

The portable review package supplies eight before/after comparisons, all 232 state screenshots and contact overviews, source-tracing overlays, representative exports, test logs, the finished build and a Git recovery bundle. Private manuscript extracts are excluded.

## Verification

The production build and current data, harmonized-manuscript, Volume Two and atlas validators pass. The original preservation hashes remain the baseline: four explicitly reviewed engine/data exceptions carry before/after hashes and reasons. A semantic comparison additionally proves that the inherited operations file changed only in the four documented Hiiumaa records. Article exceptions are prohibited. Validators were not made to accept arbitrary new hashes.

All 116 selections were exercised at 1440 × 1000 and 390 × 844: 232 checks passed, with no JavaScript errors or horizontal overflow. Tests inspected actual map sources, explicit date membership and absence of old political/military data in Volume Two. All screenshot contact overviews were visually reviewed; this is not pixel-by-pixel label proofreading. Dense pockets, corridor views, source plates, selected full-size maps and exports received additional inspection. Tablet checks used 820 × 1180.

All 137 new geometries are valid and simple in GEOS. The whole public GeoJSON inventory was checked: two self-intersecting polygons remain in the unused legacy `control-areas.geojson`, which the current renderer does not load. They are recorded rather than silently reshaped. Valid geometry does not establish historical accuracy, and meaningful overlaps such as earlier and later fronts are intentional comparisons.

Twelve representative PNG/evidence exports passed, one for each collection. PNGs contain title, selected date, legend, attribution, uncertainty, scale near the center, north indicator and embedded evidence JSON. Export temporarily makes the map north-up and untilted, then restores the visitor's camera. Evidence downloads preserve dates, source locators, geometry limitations and rights. Extent filtering uses feature bounding boxes; exported geometries are not clipped, and the record does not claim that every eligible label was visible.

Layer controls, feature panels, current context, copied links, presentation escape and map-to-study returns passed representative checks across all collections. Three detailed source plates loaded on demand and supported keyboard controls. These are browser checks, not a full assistive-technology audit or testing on physical phones.

Cold production-preview measurements used a 390 × 844 viewport, disabled browser cache, software WebGL and no CPU throttle. At an emulated 1.6 Mbit/s download and 150 ms latency, the Moscow and Stalingrad selections each reached the application's map-ready state in about 21 seconds, transferring about 2.04 and 2.07 MB of recorded resources. Only the selected reconstruction collection loaded; no plate images were requested before opening the source viewer. These are single local samples, not hosted CDN benchmarks. The existing main JavaScript chunk remains about 3.99 MB uncompressed (0.92 MB gzip), and the atlas chunk about 1.90 MB (0.40 MB gzip). The unthrottled Poland sample transferred about 16.2 MB of recorded resources and became ready in 1.63 seconds; inherited Volume One data loading remains heavy. No speed claim is made for low-bandwidth Volume One.

## Remaining evidence gaps

- **Volume One:** Every state has a recorded outcome, but original-sheet verification of every inherited border, crossing, unit and vertex is incomplete. The Hiiumaa chronology conflict is documented. Other inherited geometry remains a qualified regional synthesis.
- **Moscow/Tikhvin:** No independently supported December 9 Tikhvin replacement front or December 30 Kaluga line was established. Earlier fronts are explicitly labeled; January 1 is a separate comparison. Detailed serviceability of railways and local bridges is not established.
- **Winter campaigns:** Exact Kholm/Demyansk relief widths and Lyuban temporary closures are unresolved. The May contacts are not relabeled as the final June 2nd Shock Army pocket. Airlift event localities do not identify every landing strip or flight route.
- **Kharkov/Crimea:** Kharkov's open source line is not closed artificially into a control polygon. Kerch evacuation tracks are not inferred. Sevastopol source-map detail is readable but has not been georeferenced to surveyed forts or streets. Rebuilding and occupation systems remain thematic chapter context where exact geographic records are unavailable.
- **Case Blue:** Intermediate daily fronts, precise contested Voronezh control, Rostov crossing status, changing railheads and Hoth's full redeployment route are not reconstructed. July 14 and July 31 lines retain their own dates.
- **Caucasus/Stalingrad:** Railway lines do not establish continuous service, usable oil or conversion dates. Mountain-barrier detail does not locate every pass. City plates provide factories, heights and positions, but not a surveyed interactive street map. Krasnodar atrocity context remains a city locality; no hospital or grave coordinate is asserted.
- **Winter reversal:** The Kalach bridge, town and junction chronology remains distinct, but the junction symbol is approximate. Airfields are approximate areas, not footprints. The December 24 relief contact is not the December 19 high-water mark. Mars arrowheads do not establish exact maximum reach. Iskra's small-scale change zone cannot establish corridor width or full relief of Leningrad. The Ring plate's last perimeter is January 17: January 26 split and January 31/February 2 surrender boundaries are not invented. The source arrow legend contains an apparent end-date typo and is not adopted.
- **Source access:** Operational histories and their published maps were inspected; underlying wartime archival series were not comprehensively accessed. Earlier independent checks and manuscript citations remain separately identified. A source bibliography entry alone is not counted as fresh inspection.

## Review, hosting and recovery

GitHub write access was retested and returned HTTP 403, `Resource not accessible by integration`, on the create-blob API. No remote branch or draft pull request was created. PR #26 remains a separate draft. The available generic Netlify deploy action did not establish an explicitly nonproduction target, so it was not used. No merge or publication occurred. The production deploy verified during this work remained `6ad9453b0f5da682207b3f8f`, based on main `05784f04b2c2776b5def2c3e112f0731bf35c447`.

The package's `REVISION.txt` identifies the exact committed review revision. To recover, clone `ostkrieg-atlas-review.bundle` with branch `codex/harmonized-atlas-reconstruction`; verify `git rev-parse HEAD` against that file. The separate `site/` directory also contains the complete committed source, and `website/` contains the ready build. The supplied local preview server supports direct article/map routes without contacting Netlify.

For development use Node 20.19+ and `npm ci`, then `npm run dev`. Run `npm run validate`, `npm run validate:manuscript`, `npm run validate:volume-two`, `npm run validate:atlas` and `npm run build`. The optional geometry generator requires Python and NumPy; normal builds do not. Do not regenerate data merely to view the candidate.

Next action: review the local candidate and its evidence gaps. Hosting still requires restored GitHub write access or an explicitly nonproduction deployment capability. Publication remains a separate decision.
