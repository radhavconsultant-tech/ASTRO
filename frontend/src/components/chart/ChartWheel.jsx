import { useMemo, useState } from "react";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { ABBR, PLANET_COLOR, SIGN_ABBR, NAKSHATRAS, NAK_LORDS } from "@/lib/kp";

const S = 640;
const C = S / 2;
const R = { nakO: 314, nakI: 290, signI: 252, planet: 222, houseO: 150, houseI: 116 };

const useGeom = (asc) =>
  useMemo(() => {
    const ang = (lon) => ((180 + (lon - asc)) * Math.PI) / 180;
    const pt = (lon, r) => [C + r * Math.cos(ang(lon)), C - r * Math.sin(ang(lon))];
    const sector = (a, b, r1, r2) => {
      const span = ((b - a) % 360 + 360) % 360;
      const large = span > 180 ? 1 : 0;
      const [x1, y1] = pt(a, r2); const [x2, y2] = pt(b, r2);
      const [x3, y3] = pt(b, r1); const [x4, y4] = pt(a, r1);
      return `M${x1} ${y1} A${r2} ${r2} 0 ${large} 0 ${x2} ${y2} L${x3} ${y3} A${r1} ${r1} 0 ${large} 1 ${x4} ${y4} Z`;
    };
    return { pt, sector };
  }, [asc]);

const placePlanets = (planets) => {
  const sorted = [...planets].sort((a, b) => a.longitude - b.longitude);
  let prev = null;
  return sorted.map((p) => {
    let r = R.planet;
    if (prev && p.longitude - prev.lon < 7.5) r = Math.max(prev.r - 26, 164);
    prev = { lon: p.longitude, r };
    return { ...p, r };
  });
};

export const ChartWheel = ({ data, selection, onSelect, showOuter, compact }) => {
  const { t, lang } = useApp();
  const [zoom, setZoom] = useState(1);
  const [hover, setHover] = useState(null);
  const asc = data.cusps[0].longitude;
  const { pt, sector } = useGeom(asc);
  const planets = placePlanets(data.planets.filter((p) => showOuter || p.kp_core));
  const selP = selection?.type === "planet" ? selection.id : null;
  const selC = selection?.type === "cusp" ? selection.id : null;
  const interactive = !!onSelect;

  return (
    <div className="relative" data-testid="chart-wheel">
      {!compact && (
        <div className="absolute right-0 top-0 z-10 flex gap-1">
          {[[ZoomIn, () => setZoom((z) => Math.min(2.2, z + 0.25)), "zoom-in"], [ZoomOut, () => setZoom((z) => Math.max(1, z - 0.25)), "zoom-out"], [Maximize2, () => setZoom(1), "zoom-reset"]].map(([I, fn, id]) => (
            <button key={id} onClick={fn} data-testid={`wheel-${id}`} aria-label={id.replace("-", " ")}
              className="focus-ring glass rounded-md p-1.5 text-slate-300 hover:text-amber-200"><I className="h-4 w-4" /></button>
          ))}
        </div>
      )}
      <div className="scroll-thin overflow-auto">
        <svg viewBox={`0 0 ${S} ${S}`} style={{ width: `${zoom * 100}%` }} className="mx-auto block max-w-none transition-[width] duration-300" role="img" aria-label="KP chart wheel">
          <defs>
            <radialGradient id="wheelBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#111827" />
              <stop offset="100%" stopColor="#0b0f19" />
            </radialGradient>
            <filter id="glow"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          </defs>
          <circle cx={C} cy={C} r={R.nakO} fill="url(#wheelBg)" stroke="#D4AF37" strokeOpacity="0.35" />
          {NAKSHATRAS.map((n, i) => {
            const a = (i * 40) / 3;
            const [tx, ty] = pt(a + 20 / 3, (R.nakO + R.nakI) / 2);
            const [x1, y1] = pt(a, R.nakI); const [x2, y2] = pt(a, R.nakO);
            return (
              <g key={n}>
                <path d={sector(a, a + 40 / 3, R.nakI, R.nakO)} fill={i % 2 ? "#22D3EE" : "transparent"} fillOpacity="0.035" />
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#22D3EE" strokeOpacity="0.35" strokeWidth="0.7" />
                <text x={tx} y={ty} fill="#67E8F9" fillOpacity="0.85" fontSize="8.5" textAnchor="middle" dominantBaseline="middle" className="font-data">
                  <title>{`${n} · lord ${NAK_LORDS[i % 9]}`}</title>{n.slice(0, 3)}
                </text>
              </g>
            );
          })}
          <circle cx={C} cy={C} r={R.nakI} fill="none" stroke="#D4AF37" strokeOpacity="0.45" />
          {SIGN_ABBR.map((s, i) => {
            const [x1, y1] = pt(i * 30, R.signI); const [x2, y2] = pt(i * 30, R.nakI);
            const [tx, ty] = pt(i * 30 + 15, (R.signI + R.nakI) / 2);
            return (
              <g key={s}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#D4AF37" strokeOpacity="0.6" />
                <text x={tx} y={ty} fill="#E6C668" fontSize={lang === "te" ? 10 : 13} textAnchor="middle" dominantBaseline="middle" className={lang === "te" ? "" : "font-display"} fontWeight="600">
                  {lang === "te" ? t(["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"][i]) : s}
                </text>
              </g>
            );
          })}
          <circle cx={C} cy={C} r={R.signI} fill="none" stroke="#D4AF37" strokeOpacity="0.5" />
          {data.cusps.map((c, i) => {
            const next = data.cusps[(i + 1) % 12].longitude;
            const mid = c.longitude + (((next - c.longitude) % 360 + 360) % 360) / 2;
            const [hx, hy] = pt(mid, (R.houseO + R.houseI) / 2);
            const [x1, y1] = pt(c.longitude, R.houseI); const [x2, y2] = pt(c.longitude, R.signI);
            const angular = [1, 4, 7, 10].includes(c.house);
            const sel = selC === c.house;
            return (
              <g key={c.house}>
                <path d={sector(c.longitude, next, R.houseI, R.signI)} className="house-sector" data-testid={`wheel-house-${c.house}`}
                  fill={sel ? "#D4AF37" : "#fff"} fillOpacity={sel ? 0.12 : 0.0001}
                  onClick={interactive ? () => onSelect({ type: "cusp", id: c.house }) : undefined}
                  onMouseEnter={() => setHover({ kind: "cusp", c })} onMouseLeave={() => setHover(null)} />
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={angular ? "#E6C668" : "#94A3B8"} strokeOpacity={angular ? 0.9 : 0.4} strokeWidth={angular ? 1.6 : 0.8} pointerEvents="none" />
                <text x={hx} y={hy} fill={sel ? "#FDE68A" : "#CBD5E1"} fontSize="12" textAnchor="middle" dominantBaseline="middle" className="font-data" pointerEvents="none">{c.house}</text>
              </g>
            );
          })}
          <circle cx={C} cy={C} r={R.houseO} fill="none" stroke="#94A3B8" strokeOpacity="0.25" />
          <circle cx={C} cy={C} r={R.houseI} fill="#0b0f19" stroke="#D4AF37" strokeOpacity="0.4" />
          {planets.map((p) => {
            const [tx1, ty1] = pt(p.longitude, R.signI); const [tx2, ty2] = pt(p.longitude, R.signI - 8);
            const [x, y] = pt(p.longitude, p.r);
            const sel = selP === p.name;
            return (
              <g key={p.name} className="wheel-planet" data-testid={`wheel-planet-${p.name.toLowerCase()}`}
                onClick={interactive ? () => onSelect({ type: "planet", id: p.name }) : undefined}
                onMouseEnter={() => setHover({ kind: "planet", p, x, y })} onMouseLeave={() => setHover(null)}
                opacity={p.kp_core ? 1 : 0.7}>
                <line x1={tx1} y1={ty1} x2={tx2} y2={ty2} stroke={PLANET_COLOR[p.name]} strokeWidth="2" />
                <line x1={tx2} y1={ty2} x2={x} y2={y} stroke={PLANET_COLOR[p.name]} strokeOpacity="0.25" strokeDasharray="2 2" />
                <circle cx={x} cy={y} r={sel ? 16 : 13} fill="#0b0f19" stroke={sel ? "#FDE68A" : PLANET_COLOR[p.name]} strokeWidth={sel ? 2 : 1.2} filter={sel ? "url(#glow)" : undefined} />
                <text x={x} y={y + 0.5} fill={PLANET_COLOR[p.name]} fontSize="11" fontWeight="600" textAnchor="middle" dominantBaseline="middle" className="font-data">{ABBR[p.name]}</text>
                {p.retrograde && !["Rahu", "Ketu"].includes(p.name) && <text x={x + 13} y={y - 10} fill="#FBBF24" fontSize="8" className="font-data">R</text>}
              </g>
            );
          })}
          <text x={C} y={C - 16} fill="#94A3B8" fontSize="10" textAnchor="middle" letterSpacing="2">{t("ascendant").toUpperCase()}</text>
          <text x={C} y={C + 6} fill="#FDE68A" fontSize="17" textAnchor="middle" className="font-data">{data.cusps[0].dms}</text>
          <text x={C} y={C + 26} fill="#CBD5E1" fontSize="12" textAnchor="middle">{t(data.cusps[0].sign)}</text>
        </svg>
      </div>
      {hover && (
        <div className="glass pointer-events-none absolute left-3 top-3 z-10 min-w-[200px] rounded-lg p-3 text-xs" data-testid="wheel-tooltip">
          {hover.kind === "planet" ? (
            <>
              <div className="font-display text-lg text-amber-100">{t(hover.p.name)}{hover.p.retrograde && !["Rahu", "Ketu"].includes(hover.p.name) ? " (R)" : ""}</div>
              <div className="font-data text-cyan-200">{t(hover.p.sign)} {hover.p.dms}</div>
              <div className="mt-1 text-slate-300">{t(hover.p.nakshatra)} · pada {hover.p.pada}</div>
              <div className="font-data mt-1 text-slate-400">SL {ABBR[hover.p.star_lord]} · Sub {ABBR[hover.p.sub_lord]} · SS {ABBR[hover.p.sub_sub_lord]}</div>
            </>
          ) : (
            <>
              <div className="font-display text-lg text-amber-100">{t("house")} {hover.c.house}</div>
              <div className="font-data text-cyan-200">{t(hover.c.sign)} {hover.c.dms}</div>
              <div className="font-data mt-1 text-slate-400">SL {ABBR[hover.c.star_lord]} · Sub {ABBR[hover.c.sub_lord]} · SS {ABBR[hover.c.sub_sub_lord]}</div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
