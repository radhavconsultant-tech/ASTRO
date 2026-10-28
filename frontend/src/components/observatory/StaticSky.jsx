import { ABBR, PLANET_COLOR, SIGN_ABBR } from "@/lib/kp";

const C = 200;
const pt = (lon, r) => [C + r * Math.cos((lon * Math.PI) / 180), C - r * Math.sin((lon * Math.PI) / 180)];

export const StaticSky = ({ sky, reason }) => {
  const geo = sky?.geocentric_sidereal || {};
  return (
    <div className="relative flex h-full w-full items-center justify-center bg-[#05070d]" data-testid="observatory-static-fallback">
      <svg viewBox="0 0 400 400" className="h-full max-h-[520px] w-full max-w-[520px]">
        <circle cx={C} cy={C} r={170} fill="none" stroke="#D4AF37" strokeOpacity="0.4" />
        <circle cx={C} cy={C} r={150} fill="none" stroke="#D4AF37" strokeOpacity="0.25" />
        {SIGN_ABBR.map((s, i) => {
          const [x1, y1] = pt(i * 30, 150);
          const [x2, y2] = pt(i * 30, 170);
          const [tx, ty] = pt(i * 30 + 15, 160);
          return (
            <g key={s}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#D4AF37" strokeOpacity="0.5" />
              <text x={tx} y={ty} fill="#E6C668" fontSize="10" textAnchor="middle" dominantBaseline="middle" className="font-data">{s}</text>
            </g>
          );
        })}
        <circle cx={C} cy={C} r={8} fill="#5AB4FF" />
        {Object.entries(geo).map(([n, p], i) => {
          const r = 70 + (i % 4) * 18;
          const [x, y] = pt(p.longitude, r);
          const [ex, ey] = pt(p.longitude, 150);
          return (
            <g key={n}>
              <line x1={x} y1={y} x2={ex} y2={ey} stroke={PLANET_COLOR[n]} strokeOpacity="0.3" strokeDasharray="2 3" />
              <circle cx={x} cy={y} r={5} fill={PLANET_COLOR[n]} />
              <text x={x + 8} y={y + 3} fill="#E2E8F0" fontSize="9" className="font-data">{ABBR[n]}</text>
            </g>
          );
        })}
      </svg>
      <div className="absolute bottom-3 left-3 rounded-md bg-black/60 px-2 py-1 text-[11px] text-slate-300">
        Static view · {reason}
      </div>
    </div>
  );
};
