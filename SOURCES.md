# Sources and reuse register

The machine-readable source register is `src/data/sources.json`. Source IDs connect the timeline, articles, and future GeoJSON. Links below were checked on 12 October 2026. Linking is not permission to reproduce text, images, or maps.

| ID | Source | Use | Reuse |
| --- | --- | --- | --- |
| `ushmm-invasion-poland` | [USHMM, Invasion of Poland, Fall 1939](https://encyclopedia.ushmm.org/content/en/article/invasion-of-poland-fall-1939) | 1 and 17 September invasions, occupation context | Link only; reproduction rights not assumed |
| `ushmm-german-soviet-pact` | [USHMM, German-Soviet Pact](https://encyclopedia.ushmm.org/content/en/article/german-soviet-pact) | Soviet invasion and partition context | Link only; reproduction rights not assumed |
| `us-state-frus-1939` | [U.S. Department of State, FRUS 1939, Volume I, chapter 11](https://history.state.gov/historicaldocuments/frus1939v01/ch11) | 28 September treaty date and diplomatic record | Link only; reproduction rights not assumed |
| `ushmm-1939-dates` | [USHMM, 1939: Key Dates](https://encyclopedia.ushmm.org/content/en/article/1939-key-dates) | 26 October annexations and civilian General Government | Link only; reproduction rights not assumed |
| `ushmm-german-administration` | [USHMM, German Administration of Poland](https://encyclopedia.ushmm.org/content/en/article/german-administration-of-poland) | German occupation administration | Link only; reproduction rights not assumed |
| `natural-earth-50m` | [Natural Earth vector data](https://github.com/nvkelso/natural-earth-vector) | Local 1:50m land layer | [Public domain](https://www.naturalearthdata.com/about/terms-of-use/); attribution displayed |
| `natural-earth-10m` | [Natural Earth places and rivers](https://www.naturalearthdata.com/downloads/10m-physical-vectors/10m-rivers-lake-centerlines/) | Selected 1:10m city locations and nine major river courses | [Public domain](https://www.naturalearthdata.com/about/terms-of-use/); selection and format modified |
| `umn-historical-borders-1939` | [University of Minnesota, Historical National Boundaries](https://doi.org/10.13020/146x-1412) | Fixed 1939 Poland outline reference | [CC BY 3.0 US](https://creativecommons.org/licenses/by/3.0/us/); Poland extracted and coordinates rounded |

## Geographic material

`natural-earth-land.geojson` is a regional subset of the Natural Earth 1:50m land layer. `reference-places.geojson` selects 25 locations from Natural Earth 1:10m populated places. `major-rivers.geojson` selects nine named courses from the Natural Earth 1:10m rivers and European rivers datasets. Place names are present-day labels; these markers do not claim 1939 jurisdiction. River courses show physical geography and do not establish military barriers, crossings, or battle positions. All data is served locally without third-party map tiles.

`poland-1939-reference.geojson` contains Poland's polygon from the University of Minnesota's annual 1939 historical boundary layer. It is a generalized, smoothed reconstruction without an exact day stated in the source. It remains fixed on every timeline date as a pre-invasion reference. It must not be read as the boundary of German or Soviet occupation on any selected date. The separate date-filtered historical feature collection remains empty pending source-supported reconstruction of occupation lines. No military movements have been inferred from these layers.

The fourth date is **26 October 1939** because the USHMM chronology and its article on German administration identify that date for German annexations and the establishment of the General Government civilian administration. It denotes an administrative change, unlike the two invasion dates and the treaty date.
