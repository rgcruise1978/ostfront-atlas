# Current state — launch expansion checkpoint

## 14 October 2026 — consolidated collection release

Completed source: shared map and historical publication updates, all 14 completed articles and nine Phase II research briefs, three equally discoverable homepage collections, /collections and the Poland landing page, grouped phase navigation, breadcrumbs, searchable study/source indexes and /guide. The Poland introduction leads its reading sequence; its revised cited text is included. Source IDs, publication dates and all 23 article bodies match the latest completed workspace records. Phase II retains its explicit June 21 reference and research status.

Verified release candidate: build/data validation and whitespace checks pass; 31 page routes, all 22 map dates and 392 internal link targets pass, including downloadable JSON references. Six primary layouts pass at a measured 390px width; secondary map panels start collapsed and the map remains 420px high. Search, filters, no-results/reset behavior, filtered-index return links, source fragments, keyboard menu close and July 9–10 continuity pass. Regional camera loading fix retained.

Deployment: production publication will be verified after the consolidated release PR is merged. Record the observed release commit, PR and Netlify deployment in the completion checkpoint. This source checkpoint does not itself confirm production deployment.

Research pending: nine Phase II full studies and military snapshots; specific fine boundaries, historical transport, Mshaga/Sinyukha geometry and remaining period place names. Next: complete the Phase II river and period-place audit beginning with Smolensk and Luga.


## 14 October 2026 — Phase II increment 1 completed locally

Completed: Operation Barbarossa now has Phase I and Phase II selectors on the shared atlas and collection page. Nine fixed Phase II dates (10, 16, 23, 30 July; 6, 12, 19, 21, 25 August) have routes, R.G. Cruise metadata, full supplied editorial outlines, candidate references and chronology cautions. Map and study navigation cross July 9–10 continuously. Study return links preserve date, region and camera position. Added Smolensk, Uman, Luga, Gomel and Odessa camera presets; extended capital marker designations through August 25. Poland keeps all five actual supported dates, including its August prelude, and its 1 September–26 October navigation range.

Verified: Build and data validator pass; nine map dates and nine brief pages render, existing Poland/Phase I maps load, July 9–10 transitions work, region/capital controls retain dates, article return links retain the camera, and 390px mobile has no overflow with a 420px map and collapsed secondary panels. All fourteen existing article bodies, publication dates and source associations are unchanged. July 9 receives only a next-study metadata link. Source register grows by two checked starting references. Evidence, before files, source archive and the exact brief are in ../../outputs/barbarossa-phase-ii/. Local preview: http://127.0.0.1:5183/campaigns/barbarossa-1941?phase=2.

Outstanding: The nine full studies, dated military positions, battle/event markers and daily control are not implemented. Phase II country colours explicitly show the 21 June opening reference. Phase I military positions are not carried forward. National capital markers identify cities, not sovereign or military control. Production remains the published Phase I release; this increment is saved locally on codex/barbarossa-phase-ii-foundation, without changing the working branch.

Historical sources pending: LOC Phase II sheet identifiers and printed dates (collection fetch returned HTTP 403); authenticated command documents; Soviet operational corroboration; detailed Glantz page locators; remaining required river geometry and 1941 place names. Geography inventory is saved in geography-coverage.json. No external map artwork was copied.

Next: Complete the Phase II river and period-place coverage audit and add verified missing features, beginning with the Smolensk and Luga regional views (Increment 2).


## 14 October 2026 — All eight Barbarossa studies published

All eight complete Phase I Historical Studies are live at https://ostfront-atlas.netlify.app/campaigns/barbarossa-1941. GitHub PR #6 merged as 72f5109b135641d80824341b2eb11673d769538b; Netlify production deploy 6acfdecb0eaad42a7c1411bf is ready (19:58 UTC). All eight public articles render full content with 64 sections, 24 asides and 343 working citation anchors. A superscript/source/return round trip also passed. Publication date: 14 October 2026. The local eight JSON records, collection/home labels and validator have been synchronized and validated.

The release was isolated from current production main: sixteen files, with no map data or Poland article changes. The separate local redesign and map-upgrade draft PR #5 remain unpublished. The local source registry still contains additional map research entries beyond the production registry. Do not overwrite production with the entire local working tree. Publication evidence and a release archive are in `outputs/barbarossa-publication` at the project base. Earlier statements below that the eight studies are unpublished are superseded by this checkpoint.


## 14 October 2026 — Barbarossa studies completed locally

All eight Phase I Historical Studies are complete and installed for local review: 28,751 narrative words, 64 sections, 24 asides and 343 citation links to 68 distinct references. They retain their identities, dates, author R.G. Cruise and atlas connections. Status is `ready-for-review`, with no publication date. Sixty sources were added; all 187 existing registry entries are unchanged. The older notes below describing the eight studies as unwritten are superseded by this checkpoint.

The data validator and build pass. All 54 files in the writing-task protection manifest are unchanged, including the Poland articles and map data. Desktop and mobile review checks passed. The final Library of Congress URL recheck met its security gate; the underlying printed map sheets had already been inspected. Detailed counts, research qualifications, verification and the saved review package are in `../../outputs/barbarossa-studies/EDITORIAL_HANDOFF.md` relative to this repository. Nothing was published, pushed or deployed.


## Completed

- 14 October 2026: published the 26 October 1939 chapter, German Occupation Administration Takes Shape, with eight sections, two asides and 28 references. GitHub PR #4 merged as a913a58370bc3c375e3684c6c3742ff53b2cea17; Netlify production deploy 6acf6d64697f0992dce33e79 is ready and the public article was verified. Only the article JSON and source registry were released. Evidence: outputs/occupation-chapter-publication.md and outputs/occupation-chapter-live.jpg at the project base.

- Treaty chapter for 28 September 1939: approximately 5,700 words, 39 checked references, 10 navigable sections and four asides; established style, author R.G. Cruise, previous/next chapter links and dated atlas connection. Research decisions, reading copies and release evidence are in outputs/treaty-1939-09-28 at the project base.

- Increment 1: scalable Atlases drop-down navigation with Poland’s supported 1 September–26 October 1939 range; the 23 August Pact prelude remains selectable. All original articles credit R.G. Cruise. Existing article bodies, dates and URLs are preserved.
- Shared capital registry and star markers for Berlin, Moscow and Warsaw. Locator buttons work in both collections, preserve the date and return to the prior region. Warsaw’s historic capital designation is distinguished from German occupation on later dates.
- Increment 2: Barbarossa Phase I introduction, eight fixed dates (21, 22, 25, 28 June; 1, 3, 6, 9 July 1941), eight unpublished research briefs, previous/next chapter links and correct dated map links.
- Both collections use the same Atlas page, MapLibre component, style factory and faction palette. North/Center/South, theatre, Lepel and Prut camera presets preserve the selected date. Mobile legends and information panels start collapsed.
- Poland retains its five dates, 210 reference cities, river data, seven surrounding outlines, dated partition line, German/Soviet operational annotations and 26 October occupation sectors. The four historical chapters and foundation introduction are published.
- Barbarossa maps now show a sourced, generalized 21 June 1941 territorial reference using the same MapLibre layers and German/Soviet colours as Poland: the former Polish sectors, Baltic republics, Bessarabia/northern Bukovina, Romania/Hungary, opening frontier, regional labels, rivers and 213 place markers. This opening reference remains fixed on the eight selected dates and is explicitly labelled as such.

## Outstanding / historical research pending

- Barbarossa still lacks the changing dated front, formations, movements and battle markers. The new territorial polygons are a broad 21 June reference, not eight daily military situations. The Finnish border and some 1940 frontier adjustments remain unresolved.
- Geographic coverage and place labels need further 1941 verification. Current physical references contain mixed historical and modern names. Bucharest, Helsinki and Riga capital treatment remains for later work.
- Eight full Barbarossa chapters remain unwritten; briefs are not presented as published articles. All five dated Poland chapters are now published.
- Library of Congress candidate sheets from the user’s brief are research links only. Verify their printed dates, perspective and reuse status before digitizing. No imagery copied or operational positions inferred.

## Next action

Research and digitize dated military positions from the source sheets before adding changing fronts or advance arrows. The 21 June territorial foundation is now in place; refine remaining northern and southern border gaps as sources allow.

## Verification and repository

Local build/data validation, unchanged-body checks, capital navigation, dated article links and 390px mobile layout passed. The final preview/production commit and deployment are recorded in outputs/launch-expansion-checkpoint.md at the project base. Source backups are saved there as well. Continue from this checkpoint; do not repeat the full project audit.


## Map completion checkpoint — 14 October 2026
Shared gray-Germany/red-USSR geography, Slovakia, European background, dated political register, expanded natural rivers/lakes/cities/capitals and relief are implemented locally. Eight printed Barbarossa sheets were inspected; dated approximate operational areas, resistance markers and comparisons are generated by scripts/build-military-snapshots.py. No finished article text or publishing metadata has been changed by this map task. Production is unchanged at this checkpoint. Backup: outputs/map-completion/before-map-work.tar.gz. Geometry/source integrity checks and desktop/mobile review are underway. Local preview: http://127.0.0.1:5180/atlases/barbarossa-1941. Fine November Slovak transfer perimeters, local occupation boundaries, and October Łódź administration boundaries remain explicitly qualified, not invented.


## 14 October 2026 — saved map review checkpoint

Map changes saved on `codex/shared-historical-maps` at `cb964afbec305bdcf9f6f4a0a0ec48dd394120d8`. Both builds and data validation pass; all 13 local date views load without map errors; mobile 390px has no overflow. All 14 article files are unchanged. Production remains unchanged. See `../../outputs/map-completion/IMPLEMENTATION_REPORT.md` for completed work, precise remaining boundary limits and next steps. Full source archive: `../../outputs/map-completion/ostfront-map-checkpoint.zip`. Do not redo the foundation research.

Draft PR: https://github.com/rgcruise1978/ostfront-atlas/pull/5
Hosted preview: https://deploy-preview-5--ostfront-atlas.netlify.app/atlases/barbarossa-1941?date=1941-07-09
Netlify preview ready and checked on 9 July; zero map errors. Production remains unchanged.


## Historical Studies editorial checkpoint — 14 October 2026

Five Poland studies revised directly in src/content/articles; shared navigation now uses Historical Studies. Added 14 research references, expanded international responses and operational/occupation analysis, and reduced repeated treaty/occupation background. Existing article identities and map behaviour are preserved. Data validation and build pass; five rendered pages, citation returns, previous/next navigation and 390px mobile reading checked. No deployment made. Local review: http://127.0.0.1:5182/articles. Report and before/after archives: ../../outputs/historical-studies-revision/. These local edits are later than the map PR checkpoint above; do not overwrite them with that release stage.


## Poland collection introduction — 14 October 2026
The existing introduction was rewritten to approximately 2,300 words with 25 references (two USHMM), linked superscript citations, contents navigation and links to all five studies. It now appears first through explicit collection-introduction metadata. Build and data validation pass; bibliography return links and narrow-screen reading checked. Local only, not deployed. Backup, revised files and screenshots: ../../outputs/poland-introduction-revision/. This supersedes the prior editorial report’s note about the stale introduction.
