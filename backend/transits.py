"""Saturn transits over the natal Moon (Sade Sati) and KP ruling planets. Part of the replaceable engine."""
import time
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo
import swisseph as swe
from kp_engine import SID, SIGNS, SOURCE, SIGN_LORDS, to_jd, kp_point

PHASES = {-1: ("rising", "Rising · 12th from Moon"), 0: ("peak", "Peak · over the Moon"), 1: ("setting", "Setting · 2nd from Moon")}
DAY_LORDS = ["Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Sun"]  # Python weekday() Monday=0


def _jd_to_dt(jd: float) -> datetime:
    y, m, d, h = swe.revjul(jd)
    return datetime(y, m, d, tzinfo=timezone.utc) + timedelta(hours=h)


def _sat(jd):
    xx, _ = swe.calc_ut(jd, swe.SATURN, SID)
    return xx[0] % 360, xx[3]


def _sign(jd):
    return int(_sat(jd)[0] // 30)


def _refine(a, b, sa):
    for _ in range(30):
        m = (a + b) / 2
        if _sign(m) == sa:
            a = m
        else:
            b = m
    return b


def build_sade_sati(birth_utc: datetime, years: int = 100) -> dict:
    t0 = time.perf_counter()
    jd_birth = to_jd(birth_utc)
    moon_lon = swe.calc_ut(jd_birth, swe.MOON, SID)[0][0] % 360
    msign = int(moon_lon // 30)
    rel = {(msign + k) % 12: k for k in (-1, 0, 1)}
    jd, end, step = jd_birth - 3650, jd_birth + years * 365.25, 3.0
    cur, seg_start, segs = _sign(jd), jd, []
    while jd < end:
        nxt = jd + step
        s = _sign(nxt)
        if s != cur:
            t = _refine(jd, nxt, cur)
            segs.append((cur, seg_start, t))
            seg_start, cur = t, s
        jd = nxt
    segs.append((cur, seg_start, end))

    cycles = []
    for i, (s, a, b) in enumerate(segs):
        if s not in rel or i == 0:
            continue
        k = rel[s]
        key, label = PHASES[k]
        seg = {"phase": key, "label": label, "sign": SIGNS[s], "start": a, "end": b, "retrograde_entry": _sat(a + 1e-4)[1] < 0}
        if cycles and a - cycles[-1]["_end"] < 400:
            cycles[-1]["segments"].append(seg)
            cycles[-1]["_end"] = b
        else:
            cycles.append({"segments": [seg], "_end": b})

    out = []
    for c in cycles:
        segs_c = c["segments"]
        c_start, c_end = segs_c[0]["start"], segs_c[-1]["end"]
        if c_end < jd_birth or c_end >= end - 1:
            continue
        phases = []
        for key in ("rising", "peak", "setting"):
            ps = [s for s in segs_c if s["phase"] == key]
            if ps:
                phases.append({"phase": key, "label": ps[0]["label"], "sign": ps[0]["sign"],
                               "start": _jd_to_dt(ps[0]["start"]).isoformat(), "end": _jd_to_dt(ps[-1]["end"]).isoformat(),
                               "entries": len(ps)})
        path, j = [], c_start - 120
        while j <= c_end + 120:
            lon, spd = _sat(j)
            path.append({"t": _jd_to_dt(j).isoformat()[:10], "lon": round(lon, 3), "r": spd < 0})
            j += 8
        out.append({
            "start": _jd_to_dt(c_start).isoformat(), "end": _jd_to_dt(c_end).isoformat(),
            "years": round((c_end - c_start) / 365.25, 2), "in_progress_at_birth": c_start < jd_birth,
            "phases": phases,
            "segments": [{**s, "start": _jd_to_dt(s["start"]).isoformat(), "end": _jd_to_dt(s["end"]).isoformat()} for s in segs_c],
            "path": path,
        })
    return {
        "contract": "kp-sadesati/1.0", "source": SOURCE, "birth_utc": birth_utc.isoformat(),
        "moon": kp_point(moon_lon), "moon_sign": SIGNS[msign],
        "signs": {"rising": SIGNS[(msign - 1) % 12], "peak": SIGNS[msign], "setting": SIGNS[(msign + 1) % 12]},
        "range_years": years, "cycles": out, "calc_ms": round((time.perf_counter() - t0) * 1000, 1),
    }


def build_ruling(dt_utc: datetime, lat: float, lon: float, tz: str) -> dict:
    t0 = time.perf_counter()
    jd = to_jd(dt_utc)
    _, ascmc = swe.houses_ex(jd, lat, lon, b"P", swe.FLG_SIDEREAL)
    asc = kp_point(ascmc[0])
    moon = kp_point(swe.calc_ut(jd, swe.MOON, SID)[0][0])
    zone = ZoneInfo(tz)
    local = dt_utc.astimezone(zone)
    midnight = datetime(local.year, local.month, local.day, tzinfo=zone).astimezone(timezone.utc)
    sunrise_local, before = None, False
    try:
        res, tret = swe.rise_trans(to_jd(midnight), swe.SUN, swe.CALC_RISE | swe.BIT_DISC_CENTER,
                                   (lon, lat, 0), 0, 0, swe.FLG_MOSEPH)
        if res == 0:
            sr = _jd_to_dt(tret[0])
            sunrise_local = sr.astimezone(zone).isoformat()
            before = dt_utc < sr
    except Exception:
        pass
    vedic_day = (local - timedelta(days=1)) if before else local
    day_lord = DAY_LORDS[vedic_day.weekday()]
    rows = [
        {"role": "Day lord", "key": "day", "planet": day_lord},
        {"role": "Ascendant sign lord", "key": "asc_sign", "planet": asc["sign_lord"]},
        {"role": "Ascendant star lord", "key": "asc_star", "planet": asc["star_lord"]},
        {"role": "Ascendant sub lord", "key": "asc_sub", "planet": asc["sub_lord"]},
        {"role": "Moon sign lord", "key": "moon_sign", "planet": moon["sign_lord"]},
        {"role": "Moon star lord", "key": "moon_star", "planet": moon["star_lord"]},
        {"role": "Moon sub lord", "key": "moon_sub", "planet": moon["sub_lord"]},
    ]
    unique = []
    for r in rows:
        if r["planet"] not in unique:
            unique.append(r["planet"])
    return {
        "contract": "kp-ruling/1.0", "source": SOURCE, "utc": dt_utc.isoformat(), "local": local.isoformat(),
        "tz": tz, "latitude": lat, "longitude": lon, "weekday": vedic_day.strftime("%A"),
        "sunrise_local": sunrise_local, "before_sunrise": before, "ascendant": asc, "moon": moon,
        "ruling": rows, "unique": unique,
        "notes": ["Day lord changes at local sunrise.", "Rahu/Ketu agency (node as ruling planet) is not applied in this milestone."],
        "calc_ms": round((time.perf_counter() - t0) * 1000, 2),
    }
