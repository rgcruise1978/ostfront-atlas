# Ostfront Atlas

A developing public historical atlas of the Eastern Front, 1939–1945. Stage one covers the partition of Poland in 1939 with a working geographic reference map, a four-date sourced timeline, an article system, and a source register. Historical borders and military positions are not yet mapped.

## Run locally

Use Node.js 22 or later. Install dependencies with `npm install`, start with `npm run dev`, validate records with `npm run validate`, and build with `npm run build`. Open the local address printed by Vite.

## Content and geography

- Add articles as JSON files in `src/content/articles/`; the filename and `slug` must match. The `body` field accepts Markdown. New files appear automatically in the index and at `/articles/<slug>`.
- Add cited records to `src/data/sources.json` and use their stable IDs in timeline or article files.
- The four timeline records live in `src/data/timeline.json`.
- Local Natural Earth geography is in `public/data/geography/`. The current basemap has no political borders.
- Future historical geometry belongs in `public/data/history/poland-1939.geojson`. Each feature must have a stable `id`, `category`, `startDate`, optional `endDate`, `entity`, `sourceIds`, and `uncertainty` properties. Geometry coordinates use longitude, latitude order. Only verified, dated features should be added.

## Deployment

Connect a Netlify development project to this repository's `main` branch. `netlify.toml` sets `npm run build`, publishes `dist`, supplies client-side route fallback, and sends a `noindex` header. The custom domain is intentionally not connected.

See [SOURCES.md](SOURCES.md) for data provenance and rights, and [CURRENT_STATE.md](CURRENT_STATE.md) for verified status and the next objective.
