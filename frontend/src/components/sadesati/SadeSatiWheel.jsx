import { useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { SIGNS, SIGN_ABBR, PLANET_COLOR } from "@/lib/kp";

const S = 520;
const C = S / 2;
const RO = 236;
const RI = 204;
const ang = (lon) => ((180 + lon) * Math.PI) / 180;
const pt = (lon, r) => [C + r * Math.cos(ang(lon)), C - r * Math.sin(ang(lon))];
const sector = (a, b, r1, r2) => {
  const [x1, y1] = pt(a, r2); const [x2, y2] = pt(b, r2); const [x3, y3] = pt(b, r1); const [x4, y4] = pt(a, r1);
  return `M${x1} ${y1} A${r2} ${r2} 0 0 0 ${x2} ${y2} L${x3} ${y3} A${r1} ${r1} 0 0 1 ${x4} ${y4} Z`;
};
export const PHASE_COLOR = { rising: "#22D3EE", peak: "#E6C668", setting: "#F59E0B" };

export const SadeSatiWheel = ({ data, cycle, idx }) => {
  const { t } = useApp();
  const ms = SIGNS.indexOf(data.moon_sign);
  const phaseSigns = { [(ms + 11) % 12]: "rising", [ms]: "peak", [(ms + 1) % 12]: "setting" };
  const path = cycle?.path || [];
  const pts = useMemo(() => path.map((p, i) => ({ ...p, xy: pt(p.lon, 80 + (110 * i) / Math.max(1, path.length - 1)) })), [path]);
  const segs = useMemo(() => {
    const out = [];
    pts.forEach((p, i) => {
      if (!i) return;
      const last = out[out.length - 1];
      if (last && last.r === p.r) last.pts.push(p.xy);
      else out.push({ r: p.r, pts: [pts[i - 1].xy, p.xy] });
    });
    return out;
  }, [pts]);
  const cur = pts[Math.min(idx, pts.length - 1)];

  return (
    <svg viewBox={`0 0 ${S} ${S}`} className="mx-auto block w-full max-w-[560px]" role="img" aria-label="Saturn path over the natal Moon" data-testid="sadesati-wheel">
      <circle cx={C} cy={C} r={RO} fill="#0b0f19" stroke="#D4AF37" strokeOpacity="0.35" />
      {SIGN_ABBR.map((s, i) => {
        const ph = phaseSigns[i];
        const [x1, y1] = pt(i * 30, RI); const [x2, y2] = pt(i * 30, RO);
        const [tx, ty] = pt(i * 30 + 15, (RI + RO) / 2);
        return (
          <g key={s}>
            <path d={sector(i * 30, i * 30 + 30, RI, RO)} fill={ph ? PHASE_COLOR[ph] : "transparent"} fillOpacity={ph ? 0.16 : 0} />
            {ph && <path d={sector(i * 30, i * 30 + 30, 60, RI)} fill={PHASE_COLOR[ph]} fillOpacity="0.04" />}
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#D4AF37" strokeOpacity="0.45" />
            <text x={tx} y={ty} fill={ph ? PHASE_COLOR[ph] : "#94A3B8"} fontSize="12" fontWeight="600" textAnchor="middle" dominantBaseline="middle" className="font-data">{s}</text>
          </g>
        );
      })}
      <circle cx={C} cy={C} r={RI} fill="none" stroke="#D4AF37" strokeOpacity="0.4" />
      <circle cx={C} cy={C} r={60} fill="none" stroke="#94A3B8" strokeOpacity="0.15" strokeDasharray="2 4" />
      {segs.map((s, i) => (
        <polyline key={i} points={s.pts.map((p) => p.join(",")).join(" ")} fill="none"
          stroke={s.r ? "#F87171" : PLANET_COLOR.Saturn} strokeWidth={s.r ? 2.2 : 1.6} strokeOpacity="0.9" strokeLinejoin="round" />
      ))}
      {(() => {
        const [x, y] = pt(data.moon.longitude, RI - 10);
        return (
          <g data-testid="sadesati-moon-marker">
            <circle cx={x} cy={y} r={7} fill="#0b0f19" stroke={PLANET_COLOR.Moon} strokeWidth="1.5" />
            <text x={x} y={y + 0.5} fill={PLANET_COLOR.Moon} fontSize="8" textAnchor="middle" dominantBaseline="middle" className="font-data">Mo</text>
          </g>
        );
      })()}
      {cur && (
        <g data-testid="sadesati-saturn-marker">
          <circle cx={cur.xy[0]} cy={cur.xy[1]} r={9} fill="#0b0f19" stroke={PLANET_COLOR.Saturn} strokeWidth="2" />
          <text x={cur.xy[0]} y={cur.xy[1] + 0.5} fill={PLANET_COLOR.Saturn} fontSize="8" fontWeight="700" textAnchor="middle" dominantBaseline="middle" className="font-data">Sa</text>
        </g>
      )}
      <text x={C} y={C - 8} fill="#94A3B8" fontSize="10" textAnchor="middle" letterSpacing="2">{t("Saturn").toUpperCase()}</text>
      <text x={C} y={C + 10} fill="#FDE68A" fontSize="13" textAnchor="middle" className="font-data">{cur ? cur.t : "—"}</text>
      <text x={C} y={C + 26} fill="#67E8F9" fontSize="11" textAnchor="middle" className="font-data">{cur ? `${cur.lon.toFixed(2)}°${cur.r ? " R" : ""}` : ""}</text>
    </svg>
  );
};
