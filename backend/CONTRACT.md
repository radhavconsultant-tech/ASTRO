# KP Insight — Calculation Data Contract (v1)

Every screen reads only these shapes. Replace `kp_engine.py` with your own engine and keep the response shapes identical.

## POST /api/chart  → `kp-chart/1.0`
Request: `{ name, date "YYYY-MM-DD", time "HH:MM", latitude, longitude, tz (IANA) | utc_offset (hours) }`

Response:
- `contract`: "kp-chart/1.0"
- `source`: `{ id, label, ayanamsa, house_system, node, engine }` (label is shown in the status badge)
- `meta`: `{ jd_ut, utc, latitude, longitude, ayanamsa_value, ascendant: Point, mc: Point, calc_ms }`
- `planets[]`: Point + `{ name, speed, retrograde, kp_core, house (cusp-based), whole_sign_house }`
  - names: Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu (kp_core) + Uranus, Neptune (reference)
- `cusps[]`: Point + `{ house 1..12 }`
- `significators`: `{ cusp_based, whole_sign }`, each `{ planets: {Name: {L1,L2,L3,L4,star_lord}}, houses: {"1": {A,B,C,D}} }`
  - L1 houses occupied by star-lord · L2 house occupied · L3 houses owned by star-lord · L4 houses owned
  - A planets in star of occupants · B occupants · C planets in star of owner · D owner
- `notes[]`

Point = `{ longitude (sidereal 0–360), sign, sign_index, sign_lord, degree_in_sign, dms, nakshatra, nakshatra_index, pada, star_lord, sub_lord, sub_sub_lord }`

## POST /api/dasha  → `kp-dasha/1.0`
Same request as /api/chart. Response: `{ system, year_days, birth_utc, moon: Point, nakshatra, balance: {lord, years}, mahadashas: [{lord, start, end, years, bhuktis: [{lord, start, end, years, antaras: [{lord, start, end, years}]}]}], levels: {available, unavailable}, calc_ms }` (dates are UTC ISO).

## POST /api/sade-sati  → `kp-sadesati/1.0`
Same request as /api/chart. Response: `{ moon: Point, moon_sign, signs: {rising, peak, setting}, range_years, cycles: [{start, end, years, in_progress_at_birth, phases: [{phase, label, sign, start, end, entries}], segments: [{phase, sign, start, end, retrograde_entry}], path: [{t, lon, r}]}], calc_ms }`

## POST /api/ruling  → `kp-ruling/1.0`
Request `{ utc? (ISO, default now), latitude, longitude, tz }`. Response: `{ local, weekday, sunrise_local, before_sunrise, ascendant: Point, moon: Point, ruling: [{role, key, planet}], unique: [planet], notes, calc_ms }`

## GET /api/horary/table → `{ count: 249, rows: [{number, start, end, start_dms, sign, sign_lord, nakshatra, star_lord, sub_lord}] }`
## POST /api/horary → `kp-chart/1.0` + `horary: {...row, cusp_time_utc, method}`. Request = chart request + `number` (1–249).
## POST /api/transits?years=3 → `kp-transits/1.0`: `{ current: {Saturn, Jupiter}, events: [{planet, from_sign, to_sign, utc, retrograde, house_from_moon, house_from_asc, sade_sati?}] }`
## Node agency (in significators): `planets.Rahu.agency = {agents: [{planet, role, houses}], houses}`, `houses["n"].agency = {A,B,C,D: [nodes]}`. Ruling: `node_agents: [{node, sign, reasons}]`.

## GET /api/sky?utc=ISO  → `kp-sky/1.0`
- `heliocentric`: `{ Mercury..Neptune, Earth: {longitude (tropical), latitude, distance_au}, Moon: {geocentric: true, ...} }`
- `geocentric_sidereal`: `{ Name: Point + {retrograde, speed} }` incl. Rahu, Ketu, Uranus, Neptune
- `utc`, `calc_ms`, `source`

## GET /api/cities?q=  → `{ results: [{ name, region, lat, lon, tz }] }`
