# Map and section-description update

Baseline: `05784f04b2c2776b5def2c3e112f0731bf35c447`, the production release verified through Netlify at the start of this task. Six collections, 49 dated maps (5/8/9/9/10/8), 50 published study records including the Poland introductory essay, 531 sources, 61 route paths. Locale remains en-CA. This branch is for preview; production publication is separate.

## Reader-facing changes

All 49 selected dates have an explanation of the situation, the interval from the previous snapshot, significance and specific limits. Current study text, citation locators and lettered evidence notes supply Study context in all six collections. Section links retain the date, region and view when moving between map and study. Sections without a defensible geographic link remain explanatory context.

An optional diamond layer identifies named study localities using existing gazetteer geometry. These are reading references, including places discussed in earlier or later context; they are not new claims of an event, atrocity site, troop position, achieved movement or control. The section register records all 391 introductory and dated-study sections and their dispositions. There are 482 optional locality references, with duplicate names consolidated within each date. The new civilian-context records are separate: Kaunas on 25 June, Białystok's 27 June killings as context on 28 June, and late-June Iași persecution as context on 3 July. These broad city markers have event intervals, sources and precision notes, with no invented route or aggregate victim total.

All six collection pages explain geography, questions, studies, map content and chronological neighbours. Home distinguishes current coverage from the eventual 1939–1945 scope. The study index supplies substantive summaries and companion-map links. Sources exposes study locators, accuracy, access and reuse limitations, plus the per-date source register. The guide now matches the actual controls. About explains reconstruction and source perspective. The author page preserves the established authorship without adding credentials. Footer coverage matches the pages.

Search exposes all matching records instead of silently truncating after 70. Selecting another date clears stale details and section state. Optional layers remain off by default. Existing colour, type, navigation, routes and reading components remain. Save PNG includes an iTXt evidence record with sources, precision, source rights and selected layers; Save evidence provides an accessible JSON copy.

## Historical correction

The September Hiiumaa bridgehead markers conflicted with the later local chronology. The naval summary really does state a bridgehead on Dagö on 16 September; the local Hiiumaa history describes the landings on 12 October. The September markers now follow the October local chronology and explicitly retain the conflict. No precise September beachhead is plotted. Four marker IDs are preserved, and the corresponding authority notes and source entry disclose the correction. The existing island geometry already retained Hiiumaa as Soviet-held and is unchanged.

Volgodonsk, Zheleznogorsk and Dubna, previously suppressed only on Phase V views, are suppressed throughout the covered period. No claim is made of a complete audit of every modern geographic feature. No geography, source artwork, tiles or media were imported.

## Registers and evidence limits

- `map-coverage.csv`: one row per date with regions, original layer counts, additions, source checks, limits and status.
- `/data/history/map-coverage.json`: the same dated register with source IDs and current article-body hashes.
- `/data/history/study-section-register.json`: all substantive study sections, including the collection introductory essay.
- `/data/history/source-checks.json`: exact scope of selected source-content inspections and the unavailable LOC request.

Original feature references and inherited geometry are retained. Thirteen source records were inspected in this update; the LOC sheet request returned 403. This does not independently verify every claim, original report, archive, command identity or geographic edge. The locality connections are derived from named places in the current studies and are deliberately weaker than evidence for military geometry. Existing study files are byte-for-byte unchanged. Build-time compatibility caches are regenerated from the same text; the interface reads the current studies directly.

## Verification

Run `npm run build`, `npm run validate`, `node scripts/validate-map-coverage.mjs` and `node scripts/validate-map-geometry.mjs`. The new checks cover section completeness, citations, exact study preservation, feature IDs, original geography preservation, source IDs, coordinates, polygon closure, validity and PNG metadata. The optional Playwright check is `node scripts/verify-maps-browser.mjs`; `PLAYWRIGHT_MODULE`, `BROWSER_EXECUTABLE` and `OSTKRIEG_AUDIT_DIRECTORY` can select an existing installation and output folder. Browser results and visual inspection are reported separately in the delivery verification record. Structural checks are not proof of historical accuracy.
