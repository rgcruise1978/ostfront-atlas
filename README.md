# Ostfront Atlas

A React/Vite historical atlas covering the Partition of Poland (five dated maps) and Operation Barbarossa Phases I and II (seventeen dated maps). It uses one MapLibre engine, one country/control palette and dated source records. All 22 map selections are implemented locally as qualified regional interpretations.

## Run and verify

Use the installed Node runtime (20.19+). Run `npm install`, `npm run dev`, `npm run validate`, and `npm run build`. The current local review runs at http://127.0.0.1:5191/atlases/barbarossa-1941?date=1941-08-25&phase=2.

Geographic validation additionally requires Shapely and pyproj: `python scripts/validate-map-geography.py`. In this workspace use `../../work/map-venv/bin/python`. This entry point retains the earlier geography/chronology gates and checks all 22 dates and all 23 protected article hashes. `git diff --check` checks whitespace.

## Shared cartography

`src/map/cartography.js` owns country, authority, coalition and actor colours and movement semantics. `mapStyle.js` draws the shared layers; `temporalGeography.js` resolves dated territorial records; `AtlasMap.jsx` handles the engine, label anchors and export; `pages/Atlas.jsx` handles date/region controls, search, feature sources and presentation. `src/map-workstation.css` owns the atlas layout.

Dated political records are in `src/data/territorial-states.json`; fixed geographic masks are in `public/data/history/europe-geometries.geojson`. The military-control, military-operations, formation-positions, dated-fronts, historical-logistics and reference-borders GeoJSONs carry source IDs, dates and precision notes. No modern political outline is silently substituted. Formation points mean representative sectors, not verified headquarters. Operational reach does not mean secure control. Fine local boundaries and several August connecting fronts remain qualified; consult the feature notes.

Physical geography includes 993 settlement records, 787 river features and 216 lakes. The separately licensed Mshaga/Sinyukha file adds 11 natural waterway features. Capitals and administrative seats have independent date-dependent records. Country names remain enabled by default and independent of shading/border toggles. Presets, commander search, source panels, presentation and 2560 × 1440 PNG export are available.

## Research and recovery

The current map review package is `../../outputs/all-maps-upgrade/`: coverage matrix, style guide, research/precision notes, visual evidence, exports, validation and recovery archive. `scripts/upgrade-map-system.py` and `map-research-records.py` reproduce this enrichment from its preserved before-state ZIP; keep that ZIP at the documented relative path. Read `public/data/history/MAP_DATA_NOTES.md` for geometry provenance and reuse rights. Source artwork stays outside the public site.

## Articles and release status

Article JSON files in `src/content/articles/` credit R.G. Cruise. The collection contains 32 complete articles: 23 published studies, including all nine Phase III chapters, and nine Phase II review drafts. The Phase III publication release includes its dated military companion maps and the consolidated editorial revisions. Article Markdown/HTML, linked numbered citations, contents and chronological/map returns use the existing renderer. New source records go in `src/data/sources.json`.

The completed Phase III studies are included in the production publication release. `netlify.toml` retains the existing Vite build, `dist` publish directory and client-route fallback. Production deployment and publication are separate actions. See `CURRENT_STATE.md` for the newest checkpoint and older verified live releases.
