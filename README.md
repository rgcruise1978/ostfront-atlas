# Ostfront Atlas

A React/Vite historical atlas with 49 dated map selections: Poland in 1939 and Operation Barbarossa Phases I–V through December 5, 1941. It uses one MapLibre engine, a shared country/control palette, and dated source records. The collection contains 50 published studies by R.G. Cruise. Phase IV adds ten edited and source-checked studies; its ten map dates now have dated regional military reconstructions, source notes and complete linked article context.

## Run and verify

Use the installed Node runtime (20.19+). Run `npm install`, `npm run dev`, `npm run validate`, and `npm run build`. The current local review runs at http://127.0.0.1:5196/collections.

Geographic validation additionally requires Shapely and pyproj: `python scripts/validate-map-geography.py`. In this workspace use `../../work/map-venv/bin/python`. This entry point retains the earlier geography/chronology gates and checks the dated geography and all 32 protected article hashes. `git diff --check` checks whitespace.

## Shared cartography

`src/map/cartography.js` owns country, authority, coalition and actor colours and movement semantics. `mapStyle.js` draws the shared layers; `temporalGeography.js` resolves dated territorial records; `AtlasMap.jsx` handles the engine, label anchors and export; `pages/Atlas.jsx` handles date/region controls, search, feature sources and presentation. `src/map-workstation.css` owns the atlas layout.

Dated political records are in `src/data/territorial-states.json`; fixed geographic masks are in `public/data/history/europe-geometries.geojson`. The military-control, military-operations, formation-positions, dated-fronts, historical-logistics and reference-borders GeoJSONs carry source IDs, dates and precision notes. No modern political outline is silently substituted. Formation points mean representative sectors, not verified headquarters. Operational reach does not mean secure control. Fine local boundaries and several August connecting fronts remain qualified; consult the feature notes.

Physical geography includes 993 settlement records, 787 river features and 216 lakes. The separately licensed Mshaga/Sinyukha file adds 11 natural waterway features. Capitals and administrative seats have independent date-dependent records. Country names remain enabled by default and independent of shading/border toggles. Presets, commander search, source panels, presentation and 2560 × 1440 PNG export are available.

## Research and recovery

The current map review package is `../../outputs/all-maps-upgrade/`: coverage matrix, style guide, research/precision notes, visual evidence, exports, validation and recovery archive. `scripts/upgrade-map-system.py` and `map-research-records.py` reproduce this enrichment from its preserved before-state ZIP; keep that ZIP at the documented relative path. Read `public/data/history/MAP_DATA_NOTES.md` for geometry provenance and reuse rights. Source artwork stays outside the public site.

## Articles and release status

Article JSON files in `src/content/articles/` credit R.G. Cruise. This release contains 50 published studies, including the nine Phase II studies whose completed editorial reviews were reconciled on October 15, 2026. The Phase III publication release includes its dated military companion maps and the consolidated editorial revisions. Article Markdown/HTML, linked numbered citations, contents and chronological/map returns use the existing renderer. New source records go in `src/data/sources.json`.

Phase IV has ten published studies, each containing 3,500–5,000 substantive words, linked numbered citations, historical asides and chronological reading links. The per-study review is recorded in `phase-iv-review/`. Its ten maps now provide dated regional military reconstructions, formation sectors, movement categories, control shading, logistics, civilian context and article-section links. Read `phase-iv-maps-review/RESEARCH_AND_COVERAGE.md` for evidence and retained precision limits.

The completed Phase III studies are included in the production publication release. `netlify.toml` retains the existing Vite build, `dist` publish directory and client-route fallback. Production deployment and publication are separate actions. See `CURRENT_STATE.md` for the newest checkpoint and older verified live releases.

## Launch preparation — October 15, 2026

The information menu contains About, How to Use this Site (`/guide`), and About the Author. `src/data/informationPages.js` is the shared menu configuration. Reading colors and typography are consolidated in `src/launch.css`; existing faction meanings remain unchanged.

The default build is a review build and stays out of search indexes. It generates static route metadata, a sitemap, robots.txt and response headers. Only after domain-launch authorization, set `VITE_SITE_ORIGIN=https://ostfrontatlas.com` and `VITE_LAUNCH_READY=true` for the production build. Review-pending studies remain excluded from indexing. Do not set these values for previews.

The geography validator accepts `OSTFRONT_AUDIT_DIR` pointing to a writable folder containing `before-hashes.json`, so checks can run in an isolated candidate. This folder receives `data-validation.json`. The launch review package includes that baseline and the audit results.

Deployment of this corrected release to the existing Netlify site is authorized. Custom-domain DNS and search-index activation remain separate. See the accompanying local `launch-review` package for verification, retained historical limitations and domain instructions.

## Phase V studies

The five Barbarossa phases contain 44 selected dates through 5 December 1941. Phase V adds eight edited, cited studies of 3,000–5,000 substantive words with historical asides and chronological reading links. Its eight maps now provide dated regional military reconstructions with formations, advances, counterattacks, withdrawals, logistics, civilian context and article-section links. Detailed canal and river courses supplement the shared geography. Read `phase-v-maps-review/RESEARCH_AND_COVERAGE.md` for evidence and precision limits. The atlas closes this campaign on 5 December as an editorial endpoint, with no empty winter campaign.

`phase-v-review/checkpoint.json` protects all 42 published article files, historical/physical data and the shared palette. `scripts/validate-phase-five-foundation.py` verifies preservation, honest publication status, sources and capital-role extension. Foundation evidence is in `phase-v-review/`; study editorial, browser and release evidence is in `phase-v-edit-review/`. Phase V map review, coverage, checks and recovery evidence are in `phase-v-maps-review/`.
