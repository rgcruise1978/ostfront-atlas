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
| `umn-historical-borders-1939` | [University of Minnesota, Historical National Boundaries](https://doi.org/10.13020/146x-1412) | Fixed 1939 Poland and six surrounding outlines | [CC BY 3.0 US](https://creativecommons.org/licenses/by/3.0/us/); selected polygons extracted and coordinates rounded |
| `ushmm-danzig` | [USHMM, Danzig](https://encyclopedia.ushmm.org/content/en/article/danzig) | East Prussia and Danzig area labels | Link only; reproduction rights not assumed |
| `us-state-frus-1939-border-report` | [U.S. Department of State, 29 September 1939 diplomatic report](https://history.state.gov/historicaldocuments/frus1939v01/d501) | Described route of 28 September German–Soviet partition line | Link only; no map image or text reproduced |
| `ghdi-1939-partition-map` | [German History in Documents and Images, treaty map](https://germanhistorydocs.org/en/nazi-germany-1933-1945/ghdi:image-2005) | Confirms general Narew–Bug–San route | Link only; original map image rights held by bpk |
| `us-state-koenigsberg` | [U.S. Department of State, East Prussia historical record](https://history.state.gov/historicaldocuments/frus1943/d366) | Confirms the period name Königsberg in East Prussia | Link only; reproduction rights not assumed |

## Geographic material

`natural-earth-land.geojson` is a regional subset of the Natural Earth 1:50m land layer. `reference-places.geojson` selects 30 locations from Natural Earth 1:10m populated places, including major cities beyond Poland's 1939 border. Place names are present-day labels except Königsberg, which uses its 1939 name for present-day Kaliningrad. These markers do not claim 1939 jurisdiction. `major-rivers.geojson` selects nine named courses from the Natural Earth 1:10m rivers and European rivers datasets. River courses show physical geography and do not establish military barriers, crossings, or battle positions. All data is served locally without third-party map tiles.

`poland-1939-reference.geojson` contains Poland's polygon from the University of Minnesota's annual 1939 historical boundary layer. `surrounding-1939-reference.geojson` selects Germany, the Soviet Union, Lithuania, Latvia, Romania, and Hungary from that layer. The source is a generalized, smoothed annual reconstruction without an exact day. These outlines remain fixed across the timeline and do not depict later occupation. Its Czechoslovakia polygon is excluded because it fails to represent the March 1939 formation of Slovakia and the Protectorate of Bohemia and Moravia. Those areas are marked by approximate text labels only; East Prussia and the Danzig area are also labels without their own border geometry. The Danzig label is geographic and does not imply that Free City status continued after German annexation.

`poland-1939.geojson` contains a dashed, date-filtered **approximate** German–Soviet partition trace starting 28 September 1939. Its route follows waypoints in a contemporary U.S. diplomatic report; the long Bug and San sections use generalized Natural Earth river coordinates. Connectors are schematic, not surveyed border coordinates. The original treaty map is linked for comparison, not reproduced. This layer does not show troop positions or battle crossings.

The fourth date is **26 October 1939** because the USHMM chronology and its article on German administration identify that date for German annexations and the establishment of the General Government civilian administration. It denotes an administrative change, unlike the two invasion dates and the treaty date.
