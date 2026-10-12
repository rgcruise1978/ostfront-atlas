# Current state

## Implemented

- React, Vite, JavaScript, standard CSS, MapLibre GL JS, local Natural Earth geography, and a fixed University of Minnesota 1939 Polish outline.
- Home, interactive Poland 1939 atlas, article index and article route, source library, responsive layout.
- Five source-linked timeline dates, each with a full-article placeholder, and a separate, currently empty historical GeoJSON layer.
- 25 labelled city locations, nine labelled major rivers, the 1939 Polish border reference, and independent visibility switches for each layer.
- Netlify build configuration, client-side route fallback, and development `noindex` headers.

## Operational status

See the latest commit and Netlify deployment for the verified build and live URL. Run `npm run validate` and `npm run build` locally. Map geometry loads from local files, without external map tiles.

## Known limits

The Polish outline is an annual, generalized 1939 reconstruction with no exact day assigned by its source. It stays fixed as a pre-invasion reference across the timeline. No occupation areas, dated partition lines, troop positions, or battle crossings are mapped. A selected date updates historical text and the empty dated-layer filter. Search indexing is discouraged with `noindex`; the Netlify URL remains publicly reachable.

## Next objective

Research and prepare a dated occupation or partition boundary for Poland 1939, with explicit provenance and uncertainty notes.

## Change log

- 2026-10-12: Initial website foundation and Poland 1939 timeline.
- 2026-10-12: Added the 23 August Pact date and five date-article placeholders.
- 2026-10-12: Added a fixed 1939 Poland outline, 25 cities, and nine rivers with source and uncertainty notes.
