"""Vimshottari Dasha (Mahadasha / Bhukti / Antara) from the natal Moon. Part of the replaceable engine."""
import time
from datetime import datetime, timedelta
import swisseph as swe
from kp_engine import DASHA, NAK_SPAN, NAKSHATRAS, SID, SOURCE, to_jd, kp_point

YEAR_DAYS = 365.25
ORDER = [d[0] for d in DASHA]
YEARS = dict(DASHA)


def _iso(dt: datetime) -> str:
    return dt.isoformat()


def _periods(start: datetime, lord: str, total_years: float, depth: int):
    out, cur = [], start
    i0 = ORDER.index(lord)
    for k in range(9):
        sub = ORDER[(i0 + k) % 9]
        yrs = total_years * YEARS[sub] / 120.0
        end = cur + timedelta(days=yrs * YEAR_DAYS)
        item = {"lord": sub, "start": _iso(cur), "end": _iso(end), "years": round(yrs, 6)}
        if depth > 1:
            item["antaras"] = _periods(cur, sub, yrs, depth - 1)
        out.append(item)
        cur = end
    return out


def build_dasha(dt_utc: datetime) -> dict:
    t0 = time.perf_counter()
    jd = to_jd(dt_utc)
    moon_lon = swe.calc_ut(jd, swe.MOON, SID)[0][0] % 360
    nak = int(moon_lon // NAK_SPAN)
    lord = ORDER[nak % 9]
    elapsed_frac = (moon_lon - nak * NAK_SPAN) / NAK_SPAN
    birth = dt_utc.replace(tzinfo=None)
    first_start = birth - timedelta(days=elapsed_frac * YEARS[lord] * YEAR_DAYS)
    mahadashas, cur = [], first_start
    i0 = ORDER.index(lord)
    for k in range(10):
        md = ORDER[(i0 + k) % 9]
        end = cur + timedelta(days=YEARS[md] * YEAR_DAYS)
        mahadashas.append({"lord": md, "start": _iso(cur), "end": _iso(end), "years": YEARS[md],
                           "bhuktis": _periods(cur, md, YEARS[md], 2)})
        cur = end
    balance_years = (1 - elapsed_frac) * YEARS[lord]
    return {
        "contract": "kp-dasha/1.0", "source": SOURCE, "system": "Vimshottari", "year_days": YEAR_DAYS,
        "birth_utc": birth.isoformat(), "moon": kp_point(moon_lon), "nakshatra": NAKSHATRAS[nak],
        "balance": {"lord": lord, "years": round(balance_years, 6)},
        "mahadashas": mahadashas,
        "levels": {"available": ["Mahadasha", "Bhukti", "Antara"], "unavailable": ["Sookshma", "Prana"]},
        "calc_ms": round((time.perf_counter() - t0) * 1000, 2),
    }
