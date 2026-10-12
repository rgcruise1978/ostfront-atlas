# Ostfront Atlas

A developing public historical atlas of the Eastern Front, 1939–1945. Stage one covers the partition of Poland in 1939 with fixed Poland and surrounding-area references, 51 city points, 15 rivers, an approximate date-filtered partition line, a five-date sourced timeline, article placeholders, and a source register. It also shows schematic German and Soviet invasion directions and broad 26 October occupation sectors. Exact day-by-day control limits and unit positions are not mapped.

## Run locally

Use Node.js 22 or later. Install dependencies with `npm install`, start with `npm run dev`, validate records with `npm run validate`, and build with `npm run build`. Open the local address printed by Vite.

## Content and geography

- Add articles as JSON files in `src/content/articles/`; the filename and `slug` must match. The `body` field accepts Markdown. New files appear automatically in the index and at `/articles/<slug>`. The five date pages are marked `"status": "placeholder"`; when an article is ready, replace its empty `body` with Markdown, add `author` and `publicationDate`, and remove `status`. The atlas links already point to these pages.
- Add cited records to `src/data/sources.json` and use their stable IDs in timeline or article files.
- The five timeline records live in `src/data/timeline.json`.
- Local Natural Earth land, cities, and rivers are in `public/data/geography/`. Fixed 1939 Poland and surrounding outlines and area labels are in `public/data/history/` and stay visible across all dates.
- Date-filtered historical geometry is separated into `public/data/history/poland-1939.geojson` (partition trace), `control-areas.geojson` (26 October occupation sectors), and `advance-axes.geojson` (schematic operational directions). Rebuild the control sectors with `scripts/build-control-areas.mjs` after changing the Poland outline or treaty trace. Every new feature needs stable IDs, dates, source IDs, accuracy and uncertainty notes. Coordinates use longitude, latitude order. Add only source-supported, clearly qualified features.

## Deployment

Connect a Netlify development project to this repository's `main` branch. `netlify.toml` sets `npm run build`, publishes `dist`, supplies client-side route fallback, and sends a `noindex` header. The custom domain is intentionally not connected.

See [SOURCES.md](SOURCES.md) for data provenance and rights, and [CURRENT_STATE.md](CURRENT_STATE.md) for verified status and the next objective.
