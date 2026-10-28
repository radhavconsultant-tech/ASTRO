"""Built-in ephemeris adapter (Swiss Ephemeris / Moshier). Replaceable via the chart data contract."""
import time
from datetime import datetime, timezone
import swisseph as swe

swe.set_sid_mode(swe.SIDM_KRISHNAMURTI)
SID = swe.FLG_MOSEPH | swe.FLG_SIDEREAL | swe.FLG_SPEED
TROP = swe.FLG_MOSEPH | swe.FLG_SPEED

CONTRACT_VERSION = "kp-chart/1.0"
SOURCE = {"id": "ephemeris-builtin", "label": "Ephemeris (built-in)", "ayanamsa": "Krishnamurti (KP)",
          "house_system": "Placidus", "node": "Mean node", "engine": "Swiss Ephemeris (Moshier)"}

SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio",
         "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
SIGN_LORDS = ["Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury", "Venus", "Mars",
              "Jupiter", "Saturn", "Saturn", "Jupiter"]
NAKSHATRAS = ["Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya",
              "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati",
              "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana",
              "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"]
DASHA = [("Ketu", 7), ("Venus", 20), ("Sun", 6), ("Moon", 10), ("Mars", 7),
         ("Rahu", 18), ("Jupiter", 16), ("Saturn", 19), ("Mercury", 17)]
NAK_SPAN = 40.0 / 3.0

KP_PLANETS = [("Sun", swe.SUN), ("Moon", swe.MOON), ("Mars", swe.MARS), ("Mercury", swe.MERCURY),
              ("Jupiter", swe.JUPITER), ("Venus", swe.VENUS), ("Saturn", swe.SATURN), ("Rahu", swe.MEAN_NODE)]
OUTER = [("Uranus", swe.URANUS), ("Neptune", swe.NEPTUNE)]
HELIO = [("Mercury", swe.MERCURY), ("Venus", swe.VENUS), ("Mars", swe.MARS), ("Jupiter", swe.JUPITER),
         ("Saturn", swe.SATURN), ("Uranus", swe.URANUS), ("Neptune", swe.NEPTUNE)]


def to_jd(dt_utc: datetime) -> float:
    h = dt_utc.hour + dt_utc.minute / 60 + (dt_utc.second + dt_utc.microsecond / 1e6) / 3600
    return swe.julday(dt_utc.year, dt_utc.month, dt_utc.day, h)


def dms(lon: float) -> str:
    d = lon % 30
    deg = int(d)
    m_f = (d - deg) * 60
    mi = int(m_f)
    s = int(round((m_f - mi) * 60))
    if s == 60:
        s, mi = 0, mi + 1
    if mi == 60:
        mi, deg = 0, deg + 1
    return f"{deg:02d}°{mi:02d}′{s:02d}″"


def _divide(pos, span, start):
    acc = 0.0
    for k in range(9):
        i = (start + k) % 9
        s = span * DASHA[i][1] / 120.0
        if pos < acc + s or k == 8:
            return i, pos - acc, s
        acc += s


def kp_point(lon: float) -> dict:
    lon %= 360.0
    nak = int(lon // NAK_SPAN)
    star = nak % 9
    sub, pos2, span2 = _divide(lon - nak * NAK_SPAN, NAK_SPAN, star)
    ssub, _, _ = _divide(pos2, span2, sub)
    sign = int(lon // 30)
    return {"longitude": round(lon, 6), "sign": SIGNS[sign], "sign_index": sign, "sign_lord": SIGN_LORDS[sign],
            "degree_in_sign": round(lon % 30, 6), "dms": dms(lon), "nakshatra": NAKSHATRAS[nak],
            "nakshatra_index": nak, "pada": int((lon - nak * NAK_SPAN) // (NAK_SPAN / 4)) + 1,
            "star_lord": DASHA[star][0], "sub_lord": DASHA[sub][0], "sub_sub_lord": DASHA[ssub][0]}


def _house_of(lon, cusps):
    for i in range(12):
        a, b = cusps[i], cusps[(i + 1) % 12]
        span = (b - a) % 360
        if (lon - a) % 360 < span:
            return i + 1
    return 12


def _significators(planets, occ_key, owned):
    by = {p["name"]: p for p in planets}
    names = [p["name"] for p in planets if p["name"] in dict(DASHA)]
    planet_view = {}
    for n in names:
        sl = by[n]["star_lord"]
        planet_view[n] = {"L1": [by[sl][occ_key]], "L2": [by[n][occ_key]],
                          "L3": owned.get(sl, []), "L4": owned.get(n, []), "star_lord": sl}
    house_view = {}
    for h in range(1, 13):
        occupants = [n for n in names if by[n][occ_key] == h]
        owners = [n for n in names if h in owned.get(n, [])]
        house_view[str(h)] = {
            "A": [n for n in names if by[n]["star_lord"] in occupants],
            "B": occupants,
            "C": [n for n in names if by[n]["star_lord"] in owners],
            "D": owners}
    _node_agency(by, names, planet_view, house_view)
    return {"planets": planet_view, "houses": house_view}


CONJ_ORB = 40.0 / 12.0  # 3°20′
ASPECTS = {"Mars": (6, 3, 7), "Jupiter": (6, 4, 8), "Saturn": (6, 2, 9)}


def aspects_sign(planet: str, from_sign: int, to_sign: int) -> bool:
    return (to_sign - from_sign) % 12 in ASPECTS.get(planet, (6,))


def node_agents(by: dict, node: str, pool) -> dict:
    n = by[node]
    conj = [p for p in pool if p not in ("Rahu", "Ketu") and abs(((by[p]["longitude"] - n["longitude"]) + 540) % 360 - 180) <= CONJ_ORB]
    asp = [p for p in pool if p not in ("Rahu", "Ketu") and p not in conj
           and aspects_sign(p, by[p]["sign_index"], n["sign_index"])]
    return {"sign_lord": n["sign_lord"], "star_lord": n["star_lord"], "conjoined": conj, "aspected_by": asp}


def _node_agency(by, names, planet_view, house_view):
    for node in ("Rahu", "Ketu"):
        if node not in planet_view:
            continue
        ag = node_agents(by, node, names)
        agents = [ag["sign_lord"]] + ag["conjoined"] + ag["aspected_by"]
        houses = set()
        detail = []
        for a in dict.fromkeys(agents):
            pv = planet_view[a]
            hs = sorted(set(pv["L1"] + pv["L2"] + pv["L3"] + pv["L4"]))
            role = "sign lord" if a == ag["sign_lord"] else "conjoined" if a in ag["conjoined"] else "aspects"
            detail.append({"planet": a, "role": role, "houses": hs})
            houses.update(hs)
        planet_view[node]["agency"] = {"agents": detail, "houses": sorted(houses)}
        for h in house_view.values():
            h.setdefault("agency", {"A": [], "B": [], "C": [], "D": []})
            for k in ("A", "B", "C", "D"):
                if node not in h[k] and any(a in h[k] for a in agents):
                    h["agency"][k].append(node)


def build_chart(dt_utc: datetime, lat: float, lon: float, cusp_dt: datetime = None) -> dict:
    t0 = time.perf_counter()
    jd = to_jd(dt_utc)
    jd_c = to_jd(cusp_dt) if cusp_dt else jd
    cusps, ascmc = swe.houses_ex(jd_c, lat, lon, b"P", swe.FLG_SIDEREAL)
    cusps = list(cusps)[:12]
    planets = []
    for name, pid in KP_PLANETS + OUTER:
        xx, _ = swe.calc_ut(jd, pid, SID)
        planets.append({"name": name, **kp_point(xx[0]), "speed": round(xx[3], 6),
                        "retrograde": xx[3] < 0, "kp_core": name not in ("Uranus", "Neptune")})
        if name == "Rahu":
            planets.append({"name": "Ketu", **kp_point(xx[0] + 180), "speed": round(xx[3], 6),
                            "retrograde": True, "kp_core": True})
    asc_sign = int(cusps[0] // 30)
    for p in planets:
        p["house"] = _house_of(p["longitude"], cusps)
        p["whole_sign_house"] = (p["sign_index"] - asc_sign) % 12 + 1
    owned_cusp, owned_ws = {}, {}
    for i, c in enumerate(cusps):
        owned_cusp.setdefault(SIGN_LORDS[int(c // 30)], []).append(i + 1)
    for s in range(12):
        owned_ws.setdefault(SIGN_LORDS[s], []).append((s - asc_sign) % 12 + 1)
    for d in (owned_cusp, owned_ws):
        for k in d:
            d[k] = sorted(set(d[k]))
    cusp_rows = [{"house": i + 1, **kp_point(c)} for i, c in enumerate(cusps)]
    return {
        "contract": CONTRACT_VERSION, "source": SOURCE,
        "meta": {"jd_ut": round(jd, 6), "utc": dt_utc.isoformat(), "latitude": lat, "longitude": lon,
                 "ayanamsa_value": round(swe.get_ayanamsa_ut(jd), 6),
                 "ascendant": kp_point(ascmc[0]), "mc": kp_point(ascmc[1]),
                 "calc_ms": round((time.perf_counter() - t0) * 1000, 2)},
        "planets": planets, "cusps": cusp_rows,
        "significators": {
            "cusp_based": _significators(planets, "house", owned_cusp),
            "whole_sign": _significators(planets, "whole_sign_house", owned_ws)},
        "notes": ["Node agency applied: Rahu/Ketu act for their sign lord, planets conjoined within 3°20′, and planets aspecting their sign (7th; Mars 4/8, Jupiter 5/9, Saturn 3/10). Nodes own no houses."],
    }


def sky_positions(dt_utc: datetime) -> dict:
    t0 = time.perf_counter()
    jd = to_jd(dt_utc)
    helio = {}
    for name, pid in HELIO:
        xx, _ = swe.calc_ut(jd, pid, TROP | swe.FLG_HELCTR)
        helio[name] = {"longitude": round(xx[0], 5), "latitude": round(xx[1], 5), "distance_au": round(xx[2], 5)}
    sun, _ = swe.calc_ut(jd, swe.SUN, TROP)
    helio["Earth"] = {"longitude": round((sun[0] + 180) % 360, 5), "latitude": 0.0, "distance_au": round(sun[2], 5)}
    moon, _ = swe.calc_ut(jd, swe.MOON, TROP)
    helio["Moon"] = {"longitude": round(moon[0], 5), "latitude": round(moon[1], 5),
                     "distance_au": round(moon[2], 7), "geocentric": True}
    geo = {}
    for name, pid in KP_PLANETS + OUTER:
        xx, _ = swe.calc_ut(jd, pid, SID)
        geo[name] = {**kp_point(xx[0]), "retrograde": xx[3] < 0, "speed": round(xx[3], 5)}
        if name == "Rahu":
            geo["Ketu"] = {**kp_point(xx[0] + 180), "retrograde": True, "speed": round(xx[3], 5)}
    return {"contract": "kp-sky/1.0", "source": SOURCE, "utc": dt_utc.astimezone(timezone.utc).isoformat(),
            "heliocentric": helio, "geocentric_sidereal": geo,
            "calc_ms": round((time.perf_counter() - t0) * 1000, 2)}
