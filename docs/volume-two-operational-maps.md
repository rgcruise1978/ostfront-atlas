# Volume Two operational layers

The update adds the missing map primitives: opposing military-held areas, enclosed pocket areas, source-map urban reference features and readable directional arrows. The existing Volume One geography, study bodies, routes and identifiers are retained.

## Evidence and dates

- `scripts/reconstruction/operational-scenes.json` records 56 separately dated control situations, source pixels, coverage closures, urban registration controls, source coastline and 12 new movement arrows.
- The existing 407 source features remain unchanged. `public/data/history/volume-two-operational.geojson` adds 255 features, including geometry variants needed to clip earlier coverage under later situations without overlapping opposing colors.
- All 67 Volume Two selections are retained. 65 selections display dated control evidence. April 5 is a prospective plan; January 18 Iskra remains an event selection because the available geographic source dates its corridor January 12–19. The January 19 selection supplies that shaded corridor.
- Earlier source situations retain their actual dates. They are not asserted as unchanged positions on a later selected date. Arrows show complete, explicitly labeled operation intervals, including earlier phases, from their start date onward. Their endpoints do not mean the advance had already reached that point on the selected day.
- Control describes generalized military-held land, not sovereignty, occupation administration or continuous policing. Straight outer edges are coverage limits and receive no front-line stroke. The source's disconnected front segments are not joined into a theater-wide boundary.
- Newer pocket situations replace earlier versions, including Kharkov May 24/26 and the Sixth Army pocket January 10/12/17. Later January surrender selections retain explicitly dated January 17 evidence; no exact January 26 split or final surrender perimeter is invented.

## Cartographic qualifications

CMH source maps 6–44 and *Stalingrad to Berlin* maps 4, 9 and the explicitly January-dated change zone of map 10 supply historical geometry. Existing affine registrations remain unchanged. Urban maps 27 and 34 use GeoNames cape, locality, railway-station and hill controls. Maps 41 and 44 use correlated landmark ties to map 34; their errors inherit that registration. Metrics and complete controls are in `public/data/history/operational-georeferencing.json`.

Natural Earth 1:50m land clips regional control coverage. It is too coarse for the last Sevastopol coastal position, so that close-up uses the shoreline traced from the same historical map 27 and registered with the siege lines. The modern Don reservoir is not used as wartime geography.

Kharkov May 24 closes along the unchanged northern source line where the dotted boundary rejoins it. The short southwest gap in the May 26 resistance contour and the segment obscured by the Sixth Army label on the December 12 Stalingrad contour are explicitly described as generalized pocket envelopes. They do not claim verified tactical contact. The southwest area hidden by the Operation Ring legend is excluded from coverage. Map 44's arrow legend prints February 25 although its title ends February 2; new arrows use the complete operation interval in the title and disclose the inconsistency.

Map labels for units indicate source-chart command sectors, not headquarters or exact daily unit positions. Registered factories, stations, forts and hills remain approximate; the site does not claim street- or property-level accuracy.

## Validation

`validate-operational-maps.mjs` checks source references, explicit state eligibility, absence of future control, opening operation arrows, pocket replacement and the two justified gaps. The builder rejects invalid polygons and removes lower-dimensional clipping remnants. Browser verification covers every Volume Two selection at desktop size, selected phone views, rendering errors, layer toggles, evidence exports and a Volume One regression. Existing manuscript/data validators preserve all 86 articles and their notes.
