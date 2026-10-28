"""KP horary (1-249) — sub-division table and chart casting. Part of the replaceable engine."""
from datetime import datetime
import swisseph as swe
from kp_engine import DASHA, NAK_SPAN, NAKSHATRAS, SIGNS, SIGN_LORDS, build_chart, to_jd, dms
from transits import _jd_to_dt


def _table():
    rows, eps = [], 1e-9
    for nak in range(27):
        star, acc = nak % 9, nak * NAK_SPAN
        for k in range(9):
            i = (star + k) % 9
            a, b = acc, acc + NAK_SPAN * DASHA[i][1] / 120
            boundary = (int((a + eps) // 30) + 1) * 30
            parts = [(a, boundary), (boundary, b)] if a < boundary - eps < b - 2 * eps else [(a, b)]
            for s, e in parts:
                sign = int((s + eps) // 30)
                rows.append({"number": len(rows) + 1, "start": round(s, 6), "end": round(e, 6),
                             "start_dms": dms(s), "sign": SIGNS[sign], "sign_lord": SIGN_LORDS[sign],
                             "nakshatra": NAKSHATRAS[nak], "star_lord": DASHA[star][0], "sub_lord": DASHA[i][0]})
            acc = b
    return rows


HORARY = _table()
assert len(HORARY) == 249, len(HORARY)


def _asc(jd, lat, lon):
    return swe.houses_ex(jd, lat, lon, b"P", swe.FLG_SIDEREAL)[1][0]


def _diff(a, t):
    return (a - t + 540) % 360 - 180


def find_cusp_time(jd, lat, lon, target):
    step, best = 1 / 288, None
    j, prev = jd - 0.5, _diff(_asc(jd - 0.5, lat, lon), target)
    while j < jd + 0.5:
        nj = j + step
        d = _diff(_asc(nj, lat, lon), target)
        if prev < 0 <= d and d - prev < 30:
            a, b = j, nj
            for _ in range(32):
                m = (a + b) / 2
                if _diff(_asc(m, lat, lon), target) < 0:
                    a = m
                else:
                    b = m
            if best is None or abs(b - jd) < abs(best - jd):
                best = b
        prev, j = d, nj
    return best


def build_horary(number: int, dt_utc: datetime, lat: float, lon: float) -> dict:
    row = HORARY[number - 1]
    target = row["start"] + 5e-4
    jd = to_jd(dt_utc)
    jc = find_cusp_time(jd, lat, lon, target)
    if jc is None:
        raise ValueError("The Ascendant does not reach this degree at this latitude on this day")
    cusp_dt = _jd_to_dt(jc)
    data = build_chart(dt_utc, lat, lon, cusp_dt=cusp_dt)
    data["horary"] = {**row, "cusp_time_utc": cusp_dt.isoformat(),
                      "method": "Ascendant fixed at the start of the chosen sub; Placidus cusps for the moment that day the Ascendant reaches it; planets at the question time."}
    return data
