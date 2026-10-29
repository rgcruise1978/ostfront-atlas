# Harmonized Volume One website reconciliation

Local review candidate dated October 23, 2026. Branch: `codex/harmonized-volume-one`. Production publication requires approval of the completed preview.

## Scope and recovery

The candidate starts from production/main commit `05784f04b2c2776b5def2c3e112f0731bf35c447`. The verified production deployment at the start was Netlify `6ad9453b0f5da682207b3f8f`. The repository is `rgcruise1978/ostfront-atlas`; Netlify site ID is `b66e88e4-ebc3-4556-8a75-c90ca7467478`.

The source is `Ostkrieg_Volume_One_Harmonized.docx`, SHA-256 `2d065d987a3f964486a69cbc412a95b08053afdcd394ff314cfc0246a820ffa6`. It was read directly as a Word package, including native endnotes, preface, reader note, chapter text, asides, tables and bibliography. The manuscript and synced project sources were not modified or uploaded. Extracts, comparison files, browser captures and test runners remain in the private task workspace, outside the website and its public assets.

The baseline has 49 dated map selections and 50 article records: 49 manuscript studies plus the separate Poland introduction. All remain. The earlier local Part VI work was used only for compatible reading controls and five reference records, after comparison with the harmonized manuscript; it was not treated as published content.

To inspect or recover the change, compare this branch with the baseline commit. The exact changed-file list is the Git diff. The manifest also records baseline hashes for 79 protected files. No merge, production deployment, indexing configuration change, DNS change or modification of another branch is part of this candidate.

## Complete coverage

| Part | Chapters | Study dates | Notes | Asides | Tables |
|---|---|---|---:|---:|---:|
| I | 1–5 | Aug. 23–Oct. 26, 1939 | 116 | 16 | 2 |
| II | 6–13 | June 21–July 9, 1941 | 129 | 20 | 0 |
| III | 14–22 | July 10–Aug. 25, 1941 | 139 | 18 | 0 |
| IV | 23–31 | Aug. 26–Sept. 29, 1941 | 132 | 19 | 0 |
| V | 32–41 | Sept. 30–Nov. 14, 1941 | 163 | 20 | 0 |
| VI | 42–49 | Nov. 15–Dec. 5, 1941 | 126 | 16 | 0 |
| Total | 49 | Two distinct periods | 805 | 109 | 2 |

Every study contains the harmonized narrative, including operational, institutional and civilian material. The transfer accounts for 1,726 nonempty narrative/aside paragraphs, 367 section headings, 109 aside headings, both tables and all 805 native notes. Drop-cap letters are joined to their paragraphs. Print fields and blank paragraphs are omitted. Book cross-references become named study links. The manuscript's spelling, original source titles and quotations, `en-CA` language configuration and Robert M. Dobo's authorship are preserved.

The original 49 study routes and dates remain, including routes whose displayed titles changed. All 2,470 existing body/note fragment IDs checked against the baseline remain as current targets or compatibility aliases. A retired aside target leads to its retained parent section; consolidated older note targets lead to the closest corresponding current note. These aliases preserve access without claiming that an older note number is the manuscript's current numbering.

The two command tables retain their complete cell contents, column headers and keyboard-accessible horizontal scrolling using the site's existing command-table styling. Every aside appears in its study's contents. Part VI now has the same usable reading path, contents and lettered note controls as the preceding parts. No fixed word-count minimum is imposed.

The Poland introduction remains byte-identical after review against the new scope. Existing compatible collection introductions are retained; the Part VI introduction and reading controls were reconciled and integrated. Homepage, collection descriptions, study summaries, map-side study summaries, About, Guide and Sources copy explain the two periods and December 5 as an editorial endpoint. No Volume Two material or manuscript download is added. Article metadata derives from the revised title and summary.

## Reconciliation registers

- [Chapter crosswalk](harmonized-chapter-crosswalk.csv): all 49 chapters, routes, dates, sections, asides, tables, notes, narrative word counts and content hashes.
- [Section reconciliation](harmonized-section-reconciliation.csv): 367 sections and 49 opening blocks, with retained, revised, substantially recast/added, and consolidated/removed paragraph counts. Matching is section-local; a substantially recast paragraph is not automatically a new historical claim.
- [Coverage manifest](harmonized-volume-one.json): individual native note, aside and table dispositions; note text hashes, passage anchors, source IDs, compatibility aliases and protected-file hashes.
- [Reference corrections](harmonized-reference-corrections.json): 162 source-link mappings corrected relative to the closest earlier website note. This includes removal of irrelevant inherited links and routing printed page references to the correct chapter of a digitized book. It does not mean that 162 manuscript notes were rewritten.

All 805 native note texts match the Word definitions after removal of soft URL-wrapping characters. The numbers remain in the reconciliation register; visitors use consistent lettered notes within each study and separate numbered source links. Each note remains attached to its source paragraph and has a working return link. Shortened references use the existing bibliographic source register, supplemented by five compatible Part VI records. All 531 original source records remain unchanged; the resulting register has 536 records. Additional older references remain accessible rather than being deleted.

One concrete citation repair is note 48: its reference to Steinhardt's September 17 telegram now links to FRUS document 438, rather than Bullitt's document 439. Notes citing Ziemke and Bauer now link to the appropriate online book chapter for the printed page range. Unsupported edition precision and unavailable archival originals are not supplied by inference.

## Map-context synchronization

The existing Phase IV and V caches now contain 328 and 268 current study passages respectively. `scripts/build-study-context.mjs` rebuilds them as part of the ordinary build, using the article paragraphs, section headings, asides and native-note associations. It records the article body hash. Running the generator twice produces identical bytes.

An inherited geographic association survives only when the text, section and aside status are identical. Revised passages remain explicitly contextual with no inferred feature or coordinate connection. Their new paragraph IDs distinguish revised prose from the former associations; stable historical feature, source, event, route and section identities are preserved. Passages without a direct note show explicitly labeled section-level references, rather than presenting those references as exact passage citations.

The map's linked study title and summary come from the current article. Changing the selected date clears the previous cached context before loading the next study. This removes the opportunity to display the previous study's context during a fetch. Neither generator changes the historical map layers, snapshot dates, geometry, palette or feature source relationships.

## Historical checks and remaining uncertainty

Manuscript reconciliation is complete as a content transfer and comparison. Independent historical checking was targeted, not an audit of every assertion or all 536 references. No original archival files were inspected. The following checks were made against the identified source material:

| Passage or question | Source inspected and result |
|---|---|
| Lwów killings, study 10 / native note 187 | [USHMM's current Lwów account](https://encyclopedia.ushmm.org/content/en/article/the-lwow-pogrom-of-july-1-1941) distinguishes the pogrom's victims from wider July executions. The site's attribution was narrowed to at least several hundred, with higher estimates potentially combining different killings. This is the sole substantive departure from the supplied narrative; the exact native note is retained. |
| Soviet invasion justification, note 48 | [FRUS 1939 document 438](https://history.state.gov/historicaldocuments/frus1939v01/d438) identifies Steinhardt's telegram and reproduces Molotov's claims. The narrative continues to identify these as official justifications. |
| Łódź's administrative transfer | [Grochowina, printed p. 77](https://zawacka.pl/uploads/dokumenty/Grochowina_KulturalPolicy1939_19.pdf#page=78) dates inclusion of Łódź in Wartheland to November 9. Current feature `lodz-october` already describes the October 26 position consistently. No new map correction is warranted from this check. |
| Kamenets-Podolsk, note 400 | [USHMM](https://encyclopedia.ushmm.org/content/en/article/kamenets-podolsk) supports the August 26–28 interval and attribution of 23,600 to Jeckeln's report. The figure is not treated as an August 26 daily total. |
| Allied assistance, note 398 | [FRUS 1941 document 765](https://history.state.gov/historicaldocuments/frus1941v01/d765) supports the August 18 transmission and distinction between promised/shipped supplies and delivery to combat formations. |
| Moscow emergency, notes 603–604 | [FRUS document 647](https://history.state.gov/historicaldocuments/frus1941v01/d647) is an October 26 report about conditions over an interval. [Gebhardt's published translation of resolution 813](https://battlefield.ru/library/archives/reports/reports11.html) distinguishes the October 19 declaration from its October 20 effect. Neither was treated as an inspected archival original. |
| Kharkiv industrial evacuation, notes 617–618 | [Horlova's museum paper](https://museum.kh.ua/academic/publications.html?n=934) supports September 18–October 20 evacuation and 3,745 of 3,851 large equipment units moved. The article distinguishes removal from restored productive capacity. |
| Soviet POW treatment, notes 559 and 692 | [USHMM](https://encyclopedia.ushmm.org/content/en/article/the-treatment-of-soviet-pows-starvation-disease-and-shootings-june-1941january-1942) supports the policy, starvation, shelter, marches and shootings context. It does not independently verify each local camp episode in other notes. |
| November command and reserve context | [Ziemke and Bauer, chapter III, pp. 47–68](https://www.ibiblio.org/hyperwar/USA/USA-EF-Decision/USA-EF-Decision-3.html) supplies the cited published account and clarifies the appropriate chapter links. The current October map records already change Hoth to Reinhardt between the October 2 and 7 snapshots. |

**Material unresolved map question: Hiiumaa.** Features `p3-1941-09-16-hiiumaa-bridgehead`, `p3-1941-09-19-hiiumaa-bridgehead`, `p3-1941-09-26-hiiumaa-bridgehead` and `p3-1941-09-29-hiiumaa-bridgehead` retain a September 16 observation. The cited [WLB September chronology](https://wwwstatic.wlb-stuttgart.de/seekrieg/41-09.htm) does report a bridgehead on Dagö on that date, while its [October chronology](https://wwwstatic.wlb-stuttgart.de/seekrieg/41-10.htm) places the main Dagö landings and conquest on October 12–21. These entries need reconciliation against the underlying naval/land-operation records; a preliminary foothold and a later main operation must not be conflated. No precise replacement date or geometry was invented here. PR #26 separately contains a qualified chronology change and must be assessed on its own evidence before integration.

Other documented qualifications remain: the General Government decree's disputed signature chronology; differing accounts of Klin's capture; retrospective command narratives; unidentified editions in some excerpts; local testimony that cannot establish campaign totals; and the compiled First Shock Army journal's transcription limits. The RKKA Zhukov transcriptions returned no usable text through the web reader during this task. The Halder PDF exceeded that reader's size limit. Those failures do not erase the manuscript's citations and are not claims that the originals were checked. External-link reachability was sampled, not exhaustively certified.

## Verification

- Direct Word re-read confirms the source hash, 805 exact native note definitions, 1,726 narrative/aside paragraphs, all heading/aside identities and every table cell. All 49 chapters have explicit dispositions.
- The complete data/citation validator and harmonized-manuscript validator pass. They check unique IDs, note order, paragraph placement, source locators, FRUS document identity, word counts, body hashes, section/aside destinations and legacy anchors.
- Geographic validation passes all 49 dates, geometry validity, source relationships and temporal records. Separately, 79 protected-file hashes match the baseline exactly. The old geography script's article-preservation fixture covers the one unchanged introduction; the intentionally revised 49 articles are checked by the manuscript validator instead.
- Production-mode local build and metadata generation pass for 61 routes. Preview indexing remains blocked. Existing bundle-size warnings remain; no dependencies or launch configuration were changed.
- Browser automation reviews all 50 article pages and six collection pages at 1440×1000 and 390×844. It compares rendered paragraphs, checks every note's forward/return interaction (1,610 across both widths), section fragments, headings, language, table headers, overflow and exceptions. It checks 242 distinct internal links, including their known cross-page fragments. Screenshot review covers all study headers and an aside per study, every collection, both tables and expanded evidence panels across all six parts.
- Map regression exercises all 49 date selections in both viewports (98 views), checks current study titles/summaries and all 596 cached passages twice, and exercises phase/date/region controls, layers, feature details, search, presentation, clipboard links, study returns and four PNG downloads. No browser exceptions were recorded.
- Final table layout, keyboard navigation, print behavior and preview indexing are checked after the content/reference changes. Hosted-preview verification is unavailable: no remote candidate was created. Local checks are not production checks.

Browser review uses Chromium/Brave with emulated viewports. Physical devices, Safari, Firefox, a screen reader and printed-paper output are not certified. Map regression and unchanged hashes demonstrate preservation and working alignment, not an independent reconstruction of every historical feature.

## Delivery access limit

The implementation is committed locally and runs at http://127.0.0.1:5210 while the preview server is active. The Git upload failed because no authenticated GitHub command-line session was available. The connected GitHub blob-write API returned HTTP 403, “Resource not accessible by integration”; the browser also showed GitHub signed out. Consequently no remote branch, draft PR or hosted preview was created.

Automatic approval review rejected the generic Netlify `deploy-site` action because it could affect the existing production site and did not identify a draft-only target. That action was not executed or bypassed. Production remains deploy `6ad9453b0f5da682207b3f8f`, and main remains `05784f04b2c2776b5def2c3e112f0731bf35c447`, both rechecked after the upload attempts.

Resume by restoring repository write access, pushing this branch, creating a draft PR against main, and verifying the resulting non-production preview against its exact commit. Re-run the browser checks against that hosted URL before requesting publication approval. A local review archive, patch and Git bundle accompany the working checkout; they exclude the source DOCX and private manuscript extracts.

## PR #26 integration

[PR #26](https://github.com/rgcruise1978/ostfront-atlas/pull/26), “Connect all 49 maps to current studies and clarify site coverage,” was rechecked as open and draft at `049b07452256308ace0f1609731e87955e770f53`. Its branch is unchanged and its additional map features were not included here.

Overlaps include `README.md`, `CURRENT_STATE.md`, `package.json`, the two study-context caches, `src/data/sources.json`, and the About, Article, Atlas, Campaign, Guide, Home and Sources pages. Resolve those overlaps deliberately after the manuscript candidate is approved. Preserve the current 49 article bodies and native-note mappings, carry forward compatible map UI changes, and regenerate PR #26's coverage/section registers from these current articles. Do not restore its older prose caches or copy section associations by paragraph position. Re-run both manuscript and map validators and review its additional geographic evidence before any combined publication.
