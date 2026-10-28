# KP Insight — PRD

## Original problem statement
"can u buold ui ux for me not web app can emrgent handle it" — followed by the approved plan "KP Insight — Cinematic 3D KP Astrology Platform (Milestone 1)": a premium, desktop-first web app combining a live 3D planetary observatory with a professional KP chart explorer; real positions from a built-in ephemeris behind a data contract so the user's own engine (Claude Code) can replace it later.

## Architecture
- Backend: FastAPI + pyswisseph (Moshier, no ephemeris files). `kp_engine.py` (KP ayanamsa, Placidus, mean node, star/sub/sub-sub lords, 4-level significators cusp-based & whole-sign), `cities.py` (63 cities with IANA tz), `server.py` routes `/api/chart`, `/api/sky`, `/api/cities`. Contract documented in `backend/CONTRACT.md`.
- Frontend: React 19 + react-three-fiber 9 / drei 10 / three 0.170, framer-motion, shadcn. Charts stored per browser (localStorage). Bundled sample-chart fixture used only if the API is unreachable ("Demo fixture").
- Textures: Solar System Scope (CC BY 4.0) via GitHub mirror, three.js example moon texture; stored in `frontend/public/textures`.

## User personas
KP practitioners, serious learners, the product owner (will plug in own engine).

## Core requirements (static)
App shell (collapsible nav, chart selector, quick search ⌘K, EN/Telugu labels, status badge), 3D observatory (helio illustrative + geocentric KP sky, time controls, natal comparison, focus on click, reduced motion, static fallback), birth-chart workflow with city search/manual coords, KP Chart Explorer (wheel, linked tables, detail panel, significators w/ method switch), honest "In development" module pages.

## Implemented (2026-10-28)
- All Phase 1 items above. No login, no AI, no predictions.
- Vimshottari Dasha page (/dasha): POST /api/dasha (kp-dasha/1.0, year = 365.25 days) — Mahadasha/Bhukti/Antara, balance at birth, current periods for a reference date, 120-year timeline, expandable Bhukti→Antara list with cusp-based house significations; Sookshma/Prana marked unavailable.
- Sade Sati page (/sade-sati): POST /api/sade-sati (kp-sadesati/1.0) — cycles over 100 years from birth, phase dates, every ingress incl. retrograde re-entries, SVG Saturn path wheel with scrubber; 3D KP-sky overlay toggle in the observatory.
- Ruling planets page (/ruling): POST /api/ruling (kp-ruling/1.0) — live (30s refresh) or custom time, any city; day lord from local sunrise; snapshots saved per browser with match count against natal Asc/Moon lords.
- Observatory shows running Dasha › Bhukti › Antara for the selected date.
- Printable A4 Dasha sheet (/print/dasha) in English or Telugu, warm report styling.
- Horary 1–249 (/horary): GET /api/horary/table (249 subs, sign-split), POST /api/horary — Asc fixed at sub start (Placidus cusps at the moment that day the Asc reaches it, planets at question time); saved as a chart (kind 'horary') and opened in the Explorer with a banner.
- Node agency: Rahu/Ketu act for sign lord, planets conjoined ≤ 3°20′, planets aspecting their sign (7th; Mars 4/8, Jupiter 5/9, Saturn 3/10); planet view 'Agency' column, house view dashed chips, toggle in Explorer; ruling planets add nodes in sign/star of an RP, conjoined or aspected.
- Full chart report (/print/report): 3-page A4 (wheel, key facts, planets, cusps, significators both views with agency, Dasha), EN/Telugu.
- Dashboard transit alerts: POST /api/transits — Saturn & Jupiter sidereal ingresses next 3 years incl. retro, houses from natal Moon & Asc, Sade Sati tags.
- Career page (/career): cusps 2/6/10/11 sub-lords + significations (cusp-based + agency), house significators, Dasha Bhuktis (next 25y) where both lords link to 2/6/10/11. Connections only, no verdicts.
- Horary analysis panel in Explorer: topic → relevant cusp (standard KP house groups in lib/sig.js), sub-lord & star-lord significations, house significators. Topic chosen when casting.
- Compare charts (/compare): two saved charts, mini wheels, planet + cusp star/sub lord matching with counts.
- Transit calendar (/transits): month grid of Saturn/Jupiter ingresses, jump to previous/next change.

## Backlog
- P1 (Phase 2): complete. Next is Phase 3.
- P2 (Phase 3): connect user engine/rules/knowledge, Telugu passages, topic reports, remedies via approved rules, wellbeing guardrails, report export/history, optional AI explanations.
- Nice-to-have: node agency rules for Rahu/Ketu significators, more cities / geocoding.

## Next tasks
Marriage / finance pages (same pattern as Career); report history; user's rule engine.
