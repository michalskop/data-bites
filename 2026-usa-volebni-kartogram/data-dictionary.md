# Data dictionary

House schema version: **1**, or **2** when the 2024 presidential join is present.
UTF-8 CSV and JSON contain the same records. CSV empty cells
represent JSON `null`; zeros are actual zero totals. Votes are counts, percentages
are in the range 0–100, and times use the source's ISO 8601 UTC timestamps.

## Keys and scope

One district row for each of 435 voting seats. Primary key: `district_id`;
geometry join: four-character **string** `geoid`. Preserve leading zeros.
For example, `PA-07` joins `4207`; `AK-AL` joins `0200`.

| Field | Meaning |
| --- | --- |
| `district_id` | Postal state plus two-digit district, or `AL` for at-large. |
| `geoid` | Census state FIPS + two-digit district; at-large is `00`. |
| `state`, `state_name`, `state_fips` | Postal abbreviation, source state name, two-character FIPS. |
| `district_number` | Integer district, with `0` for at-large. |
| `race_id`, `election_date` | NYT race identifier and ballot date. |
| `snapshot_at` | NYT feed's `resultsMeta.resultsUpdatedAt`, shared by the snapshot. |
| `race_updated_at` | Source race update time. |
| `nyt_model_updated_at` | Source top reporting unit's model update; can lag reported votes. |
| `source_url` | NYT district results page. |

## Votes and estimates

| Fields | Meaning |
| --- | --- |
| `votes_d_reported`, `votes_r_reported`, `votes_other_reported` | Candidate sums grouped by literal ballot party, using top-level district totals. No summing state totals together with counties. |
| `votes_total_reported` | NYT district total ballots/votes as supplied. |
| `votes_d_estimated_nyt`, `votes_r_estimated_nyt`, `votes_other_estimated_nyt` | Sums of candidate `nyt_model_estimates.votes_estimated`. Null if any candidate in that group lacks an estimate. Zero if no candidate belongs to the group. |
| `votes_total_estimated_nyt` | NYT top reporting unit model's `votes_estimated`; retained separately, not forced to equal the candidate estimate sum. |
| `votes_total_expected_nyt` | NYT `total_expected_vote`; distinct from the model's estimated total. |
| `percent_expected_vote_reported` | NYT `eevp`, not percentage of precincts and not proof of completion; it commonly caps at 99. |
| `votes_d_selected`, `votes_r_selected` | Both estimated if all D/R candidate estimates exist; otherwise both reported. |
| `margin_votes_reported` | Reported D minus reported R. Positive means D; negative means R. |
| `margin_votes_estimated_nyt` | Estimated D minus estimated R; null if either group estimate is unavailable. |
| `margin_votes_selected` | Selected D minus selected R. |
| `margin_abs_selected` | Absolute selected D–R difference, used as cartogram area weight. |
| `margin_method` | `nyt_candidate_estimates` or `reported_votes`. No locally extrapolated estimates. |

## Outcomes

| Fields | Meaning |
| --- | --- |
| `dr_leader_selected` | `D`, `R`, or `TIE`, based on the signed selected party margin; not a race call. |
| `candidate_leader_reported_party` | Party group of the unique individual candidate leading reported votes; `TIE` for a tied lead or all zero. Can differ from the aggregated party lead. |
| `called_winner_party`, `called_winner_name` | Single candidate in NYT `outcome.won`; null while uncalled. |
| `color_party` | Called winner's party group, else selected D–R lead; renderer recalculates the lead for reported-only view. |
| `call_status`, `certified` | Source call status and separate certification boolean. |
| `tabulation_method`, `candidate_count` | Source voting method and candidate vector length. |
| `flags` | Semicolon-separated quality notes; empty string means none. |

Party groups are `D` = `DEM`, `R` = `GOP`, and `O` = all other party IDs.
No independent or nonpartisan candidate is reassigned to a major party.

## Quality flags

- `reported_fallback_no_complete_dr_estimates`: missing at least one D/R estimate.
- `single_party_ballot`: all listed candidates have the same ballot party ID.
- `no_democratic_candidate`, `no_republican_candidate`: absent major-party candidate.
- `ranked_choice_party_totals_are_not_final_round_margin`: party aggregation
  is not a last-round winning margin.
- `some_nyt_estimates_below_latest_reported`: at least one candidate's model
  estimate is below its newer reported count. Values are preserved verbatim.

## Candidate table

Composite key: (`district_id`, `candidate_id`). `geoid` and `race_id` duplicate
district join keys. `name` is assembled from NYT name fields; `party_id` retains
the original NYT party; `party_group` supplies D/R/O aggregation. `votes_reported`,
`votes_estimated_nyt`, `win_probability_nyt`, and `called_winner` retain the
candidate totals, model estimate, model probability, and official source call.
Missing estimates/probabilities are null, not zero.

## Provenance and geometry

`manifest.json` records the frozen file, its SHA-256, upstream location, source
URL, preparation time, snapshot time, schema version, scope, and quality counts.
The `.json.gz` snapshot remains unmodified. Source URLs are attribution; rebuilding
the dataset does not poll NYT or modify the upstream project.

`districts_2026.geojson`, once downloaded, contains WGS84 geographic polygons with
Census `GEOID` and download provenance in `data/raw/boundaries/`. The copy under
`data/processed/` repairs self-intersections with Shapely, joins district vote
attributes, and records the raw SHA-256 and repair log. `boundary_repaired` marks
altered shapes; `boundary_source_congress` is 119 for Missouri and 120 elsewhere.
The raw file remains unchanged. A normal renderer run exports
`layout_selected.json` and `layout_reported.json` as **Cartesian display geometry**,
explicitly not GeoJSON longitude/latitude. These include a common `area_per_vote`,
each district's polygons and center, target/measured area, maximum area error,
and overlap count. The SVGs use these same coordinates.

## 2024 President on 2026 House district boundaries

`president_2024.csv` and `.json` contain 435 rows with the same `district_id`,
`geoid`, and `state` keys as the House table. They use The Downballot's actual
presidential vote tallies retabulated onto the 2026 districts. The importer does
not estimate 2024 vote totals from 2026 turnout or rounded historical shares.

| Fields | Meaning |
| --- | --- |
| `votes_d`, `votes_r` | 2024 Harris and Trump vote counts in the 2026 district. |
| `votes_total`, `votes_other` | Published total and its remainder after subtracting Harris and Trump; follows source write-in conventions. |
| `margin_votes`, `margin_abs` | Signed Harris minus Trump count and its absolute value. |
| `pct_d`, `pct_r`, `margin_pp` | Candidate percentages and signed margin using all published votes as denominator. |
| `margin_two_party_pp` | `100 × (Harris − Trump) / (Harris + Trump)`. |
| `winner_party`, `winner_name` | District winner: D/Harris, R/Trump, or TIE/null; independent of the 2026 House call. |
| `election_date`, `boundary_vintage` | `2024-11-05` and `2026_election_districts`. |
| `source`, `source_url`, `source_row` | Attribution, explanatory source page, and CSV row number for auditing the original input. |

The same fields are joined to the main district table with prefix `pres2024_`,
excluding duplicated join keys. `house2026_vs_pres2024_two_party_swing_pp` is the
selected 2026 House two-party margin minus the 2024 presidential two-party margin.
It compares different offices, candidates, and turnout, rather than measuring
change between two presidential elections. It is null when selected House D+R
votes are zero. Presidential values are preserved when `prepare.py` is rerun.

`president_2024_manifest.json` records input hashes, source URLs, boundary vintage,
district winner counts, 50-state totals, and preparation time. DC is excluded.
Missouri is checked against a frozen operative-map margin reference extracted
from the local pre-election workbook; its source file hash and extraction fields
are in `data/raw/president2024/missouri_operative_baseline.json`. The NYT feed has
no top-level historical comparison for those eight districts. An
optional old-line Missouri input can override a stale new-map source.

`layout_president2024.json` contains the 2024 cartogram coordinates and area
validation. All exported election layouts share `area_per_vote` and `view_bounds`;
the area normalization is based on the largest sum of absolute margins among
the available election/vote modes.
