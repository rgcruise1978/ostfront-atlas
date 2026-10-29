# Whole campaign maps — October 24, 2026

The earlier control builder closed each traced source front against its small source-image frame. That produced the rectangular gray/red patches visible in the user's Caucasus and Stalingrad screenshots. This release replaces those frame closures with a continuous regional military-control surface across the historical Eastern Front land mask.

## Scope

All 67 Volume Two selections receive three side areas and a continuous regional front. The builder combines 44 dated source profiles with the retained Volume One baseline and historical outlines. It preserves the 407 detailed source-map features and 109 operational/terrain features, including isolated pockets, movements and formation sectors. The Caucasus opening also gains the narrative-supported advance directions to Krasnodar and Maykop. Neutral neighboring countries remain outside military-control shading. The Sevastopol siege uses its historical source coastline.

Each selection loads its own small control file, rather than downloading every whole-front surface. A date guard prevents stale surfaces during rapid selection. Source comparisons can be switched off without hiding regional control. Presentation mode gives the flexible layout row to the map.

## Evidence and limits

New broader source traces use U.S. Army CMH *Stalingrad to Berlin*, maps 2, 5, 6 and 7, plus the registered *Moscow to Stalingrad* Caucasus narrative. The source register records exact locators, support and rights. GeoNames controls and fit residuals are in `whole-campaign-control-validation.json`; these are regional reconstructions, not surveyed tactical positions. Source dates, earlier context and generalized spatial connections remain explicit in feature evidence. No unverified temporal interpolation is used. Movement arrows retain their complete labeled operation intervals.

The combined control geometry is CC BY-SA 4.0 with attribution to the historical-outline sources; CMH and Natural Earth reference material is public domain. The new source registration fits have approximately 3.6–12.5 km RMS residuals; generalized joins can be substantially longer. A filled regional map does not imply that every sector has a new observation for every selected date. November 23 retains the dated opening-front context while the operation arrows show the encirclement; later Ring selections retain their named source perimeter until a newer supported situation is available. February 2 removes the active Stalingrad pocket. This is not a comprehensive historical fact audit.

## Verification

- All five existing data, manuscript and atlas validators pass, with all 85 numbered chapters, their notes and protected Volume One records preserved.
- Whole-map regression checks pass for all 67 selections: valid non-overlapping polygons, no uncovered theater land, non-crossing fronts and no future source profiles. Four Caucasus locality checks and four isolated-pocket checks pass.
- Production build succeeds with 109 routes. Existing bundle-size and duplicate-import warnings remain.
- Browser checks pass for all 67 selections at desktop width and one selection in each of the six Volume Two collections at phone width. All load the expected date with no horizontal overflow. Volume One's December 5 map also loads correctly on desktop and phone.
- Both reported views were visually inspected and exported as full-size PNGs. Whole-map contact sheets were reviewed, including source-front junctions, Sevastopol and the Stalingrad pockets. Presentation mode, layer switching, rapid date changes and evidence export were checked.

The user explicitly requested the corrected public-site update. Publication evidence and the exact source snapshot are stored separately in `../publication-whole-maps-2026-10-24/` after deployment. GitHub write access remains unavailable; retain the recovery bundle before any future Git-triggered deployment from the older remote tree.
