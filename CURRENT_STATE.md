# Current state

## Implemented

- React, Vite, JavaScript, standard CSS, MapLibre GL JS, and local Natural Earth GeoJSON.
- Home, interactive Poland 1939 atlas, article index and article route, source library, responsive layout.
- Four source-linked timeline dates and a separate, currently empty historical GeoJSON layer.
- Netlify build configuration, client-side route fallback, and development `noindex` headers.

## Operational status

See the latest commit and Netlify deployment for the verified build and live URL. Run `npm run validate` and `npm run build` locally. The map's land and reference-place geometry load from local files, without external map tiles.

## Known limits

No 1939 borders, occupation areas, troop positions, or other historical geometry have been published. A selected date updates historical text and the layer filter, but the map shows the same geographic reference layer for all four dates until verified dated geometry exists. Search indexing is discouraged with `noindex`; an ordinary Netlify URL remains publicly reachable.

## Next objective

Research and prepare the first source-supported, dated GeoJSON layer for Poland 1939, with explicit provenance and uncertainty notes.

## Change log

- 2026-10-12: Initial website foundation and Poland 1939 timeline.
