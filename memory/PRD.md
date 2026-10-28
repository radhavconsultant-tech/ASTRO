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

## Backlog
- P1 (Phase 2): Sade Sati explorer, ruling planets.
- P2 (Phase 3): connect user engine/rules/knowledge, Telugu passages, topic reports, remedies via approved rules, wellbeing guardrails, report export/history, optional AI explanations.
- Nice-to-have: node agency rules for Rahu/Ketu significators, more cities / geocoding.

## Next tasks
Sade Sati path on KP sky ring; ruling planets; report export.
