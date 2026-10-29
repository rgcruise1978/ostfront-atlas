# Volume Two continuation — review candidate

The complete harmonized Volume Two manuscript is implemented as website Chapters 50–85, Parts VII–XII, Sections III–IV, through February 2, 1943. The combined candidate contains 85 numbered studies and the separate unnumbered Poland introduction, in twelve collections. Robert M. Dobo’s authorship and the existing Canadian English site configuration are retained.

This is an unpublished local candidate on `codex/harmonized-volume-two-continuation`. It starts at the completed, also unpublished Volume One candidate `de3b66fa0896ea93329ec4ec7d9e45c947442d6c`; it does not replace or rewrite that branch. Production/main remains `05784f04b2c2776b5def2c3e112f0731bf35c447`, and Netlify’s published deployment remains `6ad9453b0f5da682207b3f8f`. Production publication requires approval of a completed hosted preview.

## Manuscript reconciliation

The actual read-only DOCX was opened and its full front material, introductions, 36 chapters, 737 native notes, 107 asides and bibliography were read. Its recalculated SHA-256 is `0856ee03101832d48208966be999f79e1dea0ed055f35bb8574836f5248454dd`. A fresh XML comparison verifies all 1,933 narrative/aside paragraphs, native note wording and passage placement, 246 headings and all asides. The rendered chapter narratives total 149,718 words under the recorded tokenization, excluding notes and bibliography. No native tables exist in Volume Two.

All 50 existing article JSON files are byte-identical to the Volume One baseline. Its 805 notes, 109 asides, two tables, old routes, source fragments and manuscript content remain intact. The combined registers account for 1,542 notes and 216 asides. The 536 existing source records remain unchanged; 143 Volume Two bibliography entries and one licensed locality dataset record are appended.

Web adaptations rejoin drop caps, remove print artifacts, convert manuscript-local chapter references into links using the +49 rule, and provide stable paragraph and note namespaces. Original native note wording remains unchanged. Separate clarifications repair the Wannsee section-IV locator in note 236 and identify bibliography destinations missing from the wording of notes 304, 427 and 537. Kaluga citations retain distinct documentary, interview and locality records. No substantive narrative, civilian-history or evidentiary qualification was omitted. Full preface publication and manuscript downloads were not added.

Reading order is independent of map dates and narrative periods. Runtime navigation connects every part, including the existing Poland-to-Barbarossa gap, Chapter 49 to 50, and Sevastopol to the earlier Case Blue planning. Chapter 85 has no next chapter. Existing article files are not edited to achieve these links. Section introductions, homepage, indexes, sources, guide, about text, metadata and sitemap entries reflect both volumes. Chapter chunks load individually; the current app entry is about 895 KB compressed, compared with 823 KB for the Volume One candidate, rather than the initial 1.35 MB eager combined entry. This is a local size comparison, not a controlled network benchmark.

## Map scope and evidence

There are 37 new selected event dates and 51 locality markers across all six new parts: 4, 7, 4, 5, 6 and 11 dates respectively. They cover northern, central and southern events, including Moscow/Tikhvin, the winter encirclements, Crimea/Kharkov, Case Blue, the Caucasus/Stalingrad, Mars/Velikiye Luki and Iskra. Thirty gazetteer records provide traceable modern WGS84 reference coordinates in GeoJSON longitude/latitude order, with CC BY 4.0 attribution. Event and background settlement labels are limited to thirty documented manuscript localities. Background dots provide orientation across the volume; they do not assert events or military control on the selected date. The broader modern gazetteer is not loaded into this mode.

These are sourced event-locality maps, not completed military reconstructions. Each state and feature records dates, historical note locators, coordinate provenance, accuracy, uncertainty and missing evidence. City coordinates do not locate an exact hospital, battlefield junction, headquarters or formation. There are no inferred front lines, control polygons, movement arrows, block positions or interpolated daily advances. Modern physical geography does not reconstruct historical shorelines. The map register was prepared before generating new point geometry.

All 49 existing map states and geographic files remain unchanged. A separate new-period mode empties the earlier political and military sources at initialization and on every new selection. The browser audit inspects actual MapLibre source contents, not just layer visibility. Every new selected marker lies within its opening view. Study context is derived from the current full article, with directly attached native notes distinguished from wider section context; no paragraph inherits an old geographic association by position. Map-to-study returns retain the selected date and camera.

## Verification

- Production-format local build succeeds: 109 route metadata files, preview noindex safeguards and no private manuscript/extraction assets.
- Current data/citation checks and both manuscript checks pass. The Volume One check still enforces its original protected hashes, with three explicit, separately hashed engine extensions. All old article and geographic bytes also match the independent baseline register.
- Automated browser review covers all 86 articles and all twelve collections at desktop and phone widths: 172 article views, 24 collection views, 3,084 note opening/return interactions and 595 distinct internal links checked in that run. All new chapter headers/asides and collection layouts were visually reviewed in captured images; representative expanded evidence and tablet layouts were inspected.
- New map audit passes all 37 dates at both widths (74 views), checking empty legacy sources, visible sourced points, related studies, context, layers, copied links, presentation and six exports. Regression audit passes all 49 earlier dates at both widths (98 views), 1,192 current context passages and four exports.
- Final interactions verify all eleven part boundaries, note deep links, seven tablet/print samples, keyboard skip/menu behavior, filtered-index returns, 36 related-map lists, six selected-date map returns and the clean ending at Chapter 85. Print checks prompted a small fix hiding the on-screen skip link and keeping collapsed evidence notes printable.
- The current geographic validator passes all 49 earlier dates, geometry validity, temporal records and sources. Three historical one-off validators cannot pass unchanged: the Phase IV and Phase V foundation scripts compare pre-harmonization article hashes, and the Phase V map script requires an untracked `before-state.zip` absent from this checkout. Their limitations are recorded rather than described as passes. Current baseline preservation, semantic geography checks and full browser regressions provide the applicable combined-candidate checks.

Targeted independent historical checks are recorded in `volume-two-independent-checks.json`. They cover selected operation dates, planning versus execution, Maykop oil installations, Uranus, airlift distinctions, Stalingrad surrender/return figures, Iskra and source-transcription problems. They do not constitute a complete fact audit, a verification of every external URL, or archival-original inspection. Inaccessible material and inconsistent source summaries are explicitly recorded. No historical imagery was added.

All browser, print and build checks are local. Hosted-preview behavior, hosting headers, deployment-build equivalence, slow-device performance and production behavior of these new changes remain unverified.

## Review files and recovery

- `harmonized-volume-two.json`: complete study and note/aside reconciliation manifest.
- `volume-two-chapter-crosswalk.csv`: manuscript-to-website numbering, dates, parts, sections, counts, sources and map dispositions.
- `volume-two-note-aside-register.csv` and `volume-two-heading-register.csv`: passage and fragment dispositions.
- `volume-two-map-coverage.json`: event register, coordinate records, reuse terms and missing evidence.
- `volume-two-preservation.json` and `volume-two-engine-extensions.json`: immutable baseline and bounded engine changes.
- `volume-two-independent-checks.json`: actually inspected sources and their limits.
- Local `release/` beside the checkout: Git bundle, source archive, deployable preview archive, patch, revision and recovery instructions. Source DOCXs and private extracts are excluded.

The source DOCXs and protected project `sources/` were not modified. To discard this candidate, retain its bundle and return to baseline `de3b66f`; do not reset or overwrite the separate Volume One checkout.

## Hosting and resumption

The fresh GitHub blob-write attempt returned HTTP 403, “Resource not accessible by integration,” although repository metadata reports the human owner’s push permission. No remote continuation branch, draft PR or hosted preview was created. No authenticated GitHub or Netlify CLI was available. The earlier automatic approval review rejected the generic Netlify deploy action because it could affect production and did not identify a draft-only target; that action was not repeated or bypassed. The existing site, domain and production indexing settings remain unchanged.

Restore write access, then push the exact local Volume One candidate as `codex/harmonized-volume-one` and this continuation branch. Create a draft Volume One PR against `main` if none exists, then a draft continuation PR against that Volume One branch, explaining the combined preview dependency. Use the draft PR’s non-production Deploy Preview, with launch indexing disabled. Re-run the browser checks against its exact revision and verify hosting headers before requesting publication approval. Do not merge either PR or deploy production during this step.

PR #26, “Connect all 49 maps to current studies and clarify site coverage,” remains an untouched draft at `049b07452256308ace0f1609731e87955e770f53`. Its 482 optional locality links, three civilian records, Hiiumaa chronology change and richer export/context work were not incorporated. Later integration must rebase and reconcile its UI/context changes against the harmonized articles, explicitly review geographic associations and chronology, and repeat preservation and map checks; a blind merge could reintroduce older context.
