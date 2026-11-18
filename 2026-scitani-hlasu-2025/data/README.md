# Data

- `precincts_2025.csv`: `obec` (municipality or city-part code, 999997 = abroad), `okrsek`, `batch_time` (first batch that contained it), `t` (time ČSÚ processed the precinct, local), `poradi`, `repeat`, `voters`, `valid`, `ano`, `n_rep` (repeated records).
- `precinct_positions_2025.csv`: `obec, okrsek, muni, lon, lat` (WGS84 centroid; `muni` is the municipality the city part belongs to).
- `counting_batches_2025.csv`: `timestamp` (batch time), `counted_ids_pct`, `counted_votes_pct` (valid votes counted / final valid votes), `valid_votes` (cumulative, abroad included), party columns (% of valid votes counted so far),
  `batch, counted_ids, total_ids, new_ids` and `<party>_votes`. Ballot numbers: Piráti 16, SPOLU 11, STAN 23, Motoristé 20, ANO 22, SPD 6, Stačilo! 25, Přísaha 8.

Source: ČSÚ (volby.cz) real-time results of the 2025 Chamber of Deputies election, recorded on 4 October 2025; positions from RÚIAN (ČÚZK).
