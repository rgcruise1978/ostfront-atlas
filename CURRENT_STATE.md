# Current state

## Implemented

- React, Vite, JavaScript, standard CSS, MapLibre GL JS, local Natural Earth geography, and fixed University of Minnesota 1939 Poland and surrounding-state outlines.
- Home, interactive Poland 1939 atlas, article index and article route, source library, responsive layout.
- Five source-linked timeline dates, each with a full-article placeholder, and a dated historical GeoJSON layer.
- 51 city locations, including major neighbouring cities labelled at the default view; nine labelled major rivers and six additional rivers at closer zoom, seven neighbouring state outlines, additional area labels, and independent visibility switches for geographic layers.
- Approximate German–Soviet partition line shown from 28 September 1939 onward.
- Four German and two Soviet sourced, schematic operational axes, date-filtered with a separate toggle and clickable explanations. Soviet axes start on 17 September.
- Broad German and Soviet occupation-sector polygons for 26 October only, with consistent colours, separate toggle, legal-status/accuracy notes, and source links.
- Netlify build configuration, client-side route fallback, and development `noindex` headers.

## Operational status

See the latest commit and Netlify deployment for the verified build and live URL. Run `npm run validate` and `npm run build` locally. Map geometry loads from local files, without external map tiles.

## Known limits

The Poland and neighbouring outlines are annual, generalized 1939 reconstructions without an exact day. They stay fixed as references across the timeline. The source's obsolete 1939 Czechoslovakia polygon is excluded; Slovakia and the Czech protectorate are labelled without precise borders. The partition trace and October sector edge are generalized, guided by a contemporary report and river courses. No day-specific September control polygons, actual troop positions, or battle crossings are mapped. The arrows show operational directions, not exact routes or advance limits. Roads, railways, bridges, terrain, woodland/wetland extent, internal administrative boundaries, and precise Danzig and southern political borders remain unmapped. Search indexing is discouraged with `noindex`; the Netlify URL remains publicly reachable.

## Next objective

Research and digitize verified 1939 transportation, terrain, regional boundaries, and date-specific September control/front geometry. Keep their provenance, date, precision, and legal status distinct.

## Change log

- 2026-10-12: Initial website foundation and Poland 1939 timeline.
- 2026-10-12: Added the 23 August Pact date and five date-article placeholders.
- 2026-10-12: Added a fixed 1939 Poland outline, 25 cities, and nine rivers with source and uncertainty notes.
- 2026-10-12: Added surrounding areas and an approximate 28 September partition line.
- 2026-10-12: Made neighbouring city names visible at the default view and added cities in East Prussia, Slovakia, Hungary, Romania, and Latvia.
- 2026-10-12: Added more regional cities and rivers, Estonia, schematic invasion axes, October occupation sectors, dated legend/toggles, and feature-level sources and uncertainty notes.
