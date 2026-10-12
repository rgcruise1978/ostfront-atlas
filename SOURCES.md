# Sources and reuse register

The machine-readable source register is `src/data/sources.json`. Source IDs connect the timeline, articles, and future GeoJSON. Links below were checked on 12 October 2026. Linking is not permission to reproduce text, images, or maps.

| ID | Source | Use | Reuse |
| --- | --- | --- | --- |
| `ushmm-invasion-poland` | [USHMM, Invasion of Poland, Fall 1939](https://encyclopedia.ushmm.org/content/en/article/invasion-of-poland-fall-1939) | 1 and 17 September invasions, occupation context | Link only; reproduction rights not assumed |
| `ushmm-german-soviet-pact` | [USHMM, German-Soviet Pact](https://encyclopedia.ushmm.org/content/en/article/german-soviet-pact) | Soviet invasion and partition context | Link only; reproduction rights not assumed |
| `us-state-frus-1939` | [U.S. Department of State, FRUS 1939, Volume I, chapter 11](https://history.state.gov/historicaldocuments/frus1939v01/ch11) | 28 September treaty date and diplomatic record | Link only; reproduction rights not assumed |
| `ushmm-1939-dates` | [USHMM, 1939: Key Dates](https://encyclopedia.ushmm.org/content/en/article/1939-key-dates) | 26 October annexations and civilian General Government | Link only; reproduction rights not assumed |
| `ushmm-german-administration` | [USHMM, German Administration of Poland](https://encyclopedia.ushmm.org/content/en/article/german-administration-of-poland) | German occupation administration | Link only; reproduction rights not assumed |
| `natural-earth-50m` | [Natural Earth vector data](https://github.com/nvkelso/natural-earth-vector) | Local 1:50m land and selected populated-place coordinates | [Public domain](https://www.naturalearthdata.com/about/terms-of-use/); attribution voluntary and displayed |

## Geographic material

`natural-earth-land.geojson` is a regional subset of the Natural Earth 1:50m land layer, downloaded from the project's public GeoJSON repository; it retains features with coordinates in the atlas's wider viewing area. `reference-places.geojson` selects Warsaw, Kraków, Gdańsk, Brest, and Lviv from Natural Earth 1:50m populated places; these are geographic locators, not claims about their 1939 jurisdiction. No third-party tile service is used, so there are no tile traffic limits or private keys. The files are locally served with the site.

Natural Earth land shows coastlines only. It is a modern geographic reference, not a historical political basemap. The historical feature collection is empty pending source-supported reconstruction; no boundaries, occupation zones, or military movements have been inferred from modern geography.

The fourth date is **26 October 1939** because the USHMM chronology and its article on German administration identify that date for German annexations and the establishment of the General Government civilian administration. It denotes an administrative change, unlike the two invasion dates and the treaty date.
