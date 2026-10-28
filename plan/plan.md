# KP Insight — Cinematic 3D KP Astrology Platform (Milestone 1)

A premium, desktop-first web application that combines a live 3D planetary observatory with a professional KP (Krishnamurti Paddhati) chart explorer.
The focus here is the interface. Chart positions are real, from a built-in standard ephemeris, and everything connects through a clear data contract so your own engine (being built separately in Claude Code) can replace it later.

## Who it's for
- KP astrology practitioners who need cusps, star-lords, sub-lords and significators shown precisely.
- Serious learners who want the key facts first, with technical detail available when they ask for it.
- You, the product owner, who will connect your own calculation and knowledge engine later.

## Core features and experience (Milestone 1 — built now)

**Application shell**
- Refined left navigation that can collapse, a compact top bar, a global birth-chart selector, quick search and an English / తెలుగు switch for interface labels.
- A calculation-status indicator that always shows where the data comes from: "Ephemeris (built-in)", "Demo fixture", or "Pending module".
- The navigation lists all planned modules (Dasha, Sade Sati, Horary 1–249, career, marriage, finance, gemstones, Rudraksha, remedies, wellbeing, knowledge library, reports). Modules not built yet open an honest "In development" page that explains what will appear there. They never show a generic prediction.

**3D Planetary Observatory (home screen centrepiece)**
- The Sun, Mercury, Venus, Earth, Moon, Mars, Jupiter, Saturn, Uranus and Neptune, with realistic textured materials, lighting, atmosphere glow, Saturn's rings and a subtle star field.
- Orbit, zoom and pan controls. Click a planet to focus the camera on it and open its detail panel.
- Two clearly labelled views:
  - **Solar system (heliocentric, illustrative)**: sizes and distances are exaggerated and labelled as not to scale.
  - **KP sky (geocentric zodiac)**: planets placed around a zodiac ring at their real sidereal longitudes. Rahu and Ketu are shown as marked node points, not as physical planets.
- A time panel with date and time selection, play, pause, reset and step controls (hour, day, month). Positions are calculated from the ephemeris at each step, and the motion between steps is only smoothed, never invented.
- A natal versus selected-date comparison, plus a visible calculation time and status.
- Planet labels and tooltips. The scene pauses when off-screen. A reduced-motion setting and a static fallback are provided if 3D graphics are unavailable.

**Birth-chart workflow**
- Enter name, date, time and place. The place is searched from a built-in list of major Indian and world cities with coordinates and time zone, and can also be entered manually.
- Saved charts can be switched from the global selector.
- One sample chart is preloaded and labelled as a sample.

**Interactive KP Chart Explorer**
- A custom, precise chart wheel showing 12 cusps, the Ascendant, signs, the 27 nakshatra divisions and planets at their real positions.
- Hover tooltips, click to select, zoom and highlighting.
- Selecting a planet or cusp highlights its row in the tables and updates a side detail panel showing sign, degree, nakshatra, star-lord, sub-lord and sub-sub-lord.
- A planetary table and a cusp table with search, sort, filters, copy-value buttons and retrograde markers.
- A significator view (houses signified by each planet, at four levels) with a clear switch between **Cusp-based (KP)** and **Whole-sign**. The two methods are never mixed.

## User flow
1. Open the app and see the dashboard with the 3D observatory and the sample chart.
2. Create a birth chart by searching for the city, then save it.
3. Explore the observatory: pick a date, press play, and click Saturn to see its current and natal positions.
4. Open the Chart Explorer and click the 7th cusp to see its sub-lord, then click a planet to see its row and significations.
5. Switch between English and Telugu labels, or between cusp-based and whole-sign methods.
6. Open a planned module such as Sade Sati to see its "In development" page.

## UI/UX feel
- Midnight navy and deep-space blue, restrained champagne gold for celestial elements, cool cyan for secondary data and warm neutral surfaces for reports.
- Fine-line astronomical diagrams, bold editorial headings and a precise data font for numbers.
- A cinematic opening: the title is revealed line by line, then the camera moves into the solar system.
- Smooth scrolling, section reveals and camera transitions that each serve a purpose. Detail is revealed progressively, so the dashboard is not a wall of equal cards.
- An original "KP Insight" logo mark (a gold orbit ring around a star point), also used as the browser tab icon.
- Built for desktop first and adapted for tablet and phone. It supports keyboard navigation and respects reduced-motion settings.

## Implementation phases
- **Phase 1 (MVP, built now)**: application shell, design system, 3D observatory with real ephemeris motion, birth-chart workflow with city search, KP Chart Explorer with linked tables, detail panel and both significator methods, an honest status system, and pages for planned modules.
- **Phase 2**: a Vimshottari Dasha timeline (Mahadasha, Bhukti and Antara calculated; Sookshma and Prana marked unavailable), the Saturn and Sade Sati explorer driven by the ephemeris, and ruling planets.
- **Phase 3**: connecting your own engine, rule and knowledge system (sources, Telugu passages, rule review), topic reports, gemstone, Rudraksha and remedy logic driven by approved rules, the wellbeing section with safety guardrails, optional AI explanations, and report export and history.

## Assumptions
- The calculation source is a built-in standard ephemeris using the KP (Krishnamurti) ayanamsa and Placidus cusps. It sits behind a documented data contract so your own engine can replace it without changing any screens.
- Emergent is used for the interface. Deeper engine, rule and knowledge work happens on your side in Claude Code.
- Uploaded books, rules and reference tests are not part of this milestone. No interpretations, predictions or remedies are shown yet.
- No login. Saved charts are stored per browser.
- Telugu covers interface labels only in this milestone. Telugu translations of book passages come later.
- No AI provider is connected in Phase 1.
- The city list covers major Indian and world cities. Other places can be entered manually with coordinates.
- The planet surfaces use freely licensed texture images.
