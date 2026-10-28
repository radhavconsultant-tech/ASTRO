import { useApp } from "@/context/AppContext";
import { PLANET_COLOR } from "@/lib/kp";
import { parse } from "./dashaUtils";

const YEAR_MS = 365.25 * 864e5;

export const DashaTimeline = ({ dasha, refDate, selected, onSelect }) => {
  const { t } = useApp();
  const birth = parse(dasha.birth_utc);
  const start = birth.getTime();
  const end = start + 120 * YEAR_MS;
  const pct = (d) => ((Math.min(Math.max(d, start), end) - start) / (end - start)) * 100;
  const refPct = pct(refDate.getTime());
  const birthYear = birth.getUTCFullYear();

  return (
    <div className="scroll-thin overflow-x-auto pb-2" data-testid="dasha-timeline">
      <div className="relative min-w-[760px] pt-8">
        <div className="relative flex h-16 overflow-hidden rounded-xl border border-white/[0.08]">
          {dasha.mahadashas.map((m, i) => {
            const s = pct(parse(m.start).getTime());
            const e = pct(parse(m.end).getTime());
            if (e - s <= 0) return null;
            const sel = selected === i;
            return (
              <button key={`${m.lord}-${i}`} onClick={() => onSelect(i)} data-testid={`timeline-md-${i}`}
                aria-pressed={sel} title={`${m.lord} Mahadasha`}
                className={`focus-ring group absolute inset-y-0 flex flex-col justify-center overflow-hidden border-r border-[#0b0f19] px-2 text-left transition-[filter,background-color] duration-200 ${sel ? "brightness-125" : "hover:brightness-110"}`}
                style={{ left: `${s}%`, width: `${e - s}%`, background: `${PLANET_COLOR[m.lord]}${sel ? "40" : "1f"}`, boxShadow: sel ? `inset 0 -3px 0 ${PLANET_COLOR[m.lord]}` : "none" }}>
                <span className="truncate text-xs font-semibold" style={{ color: PLANET_COLOR[m.lord] }}>{t(m.lord)}</span>
                <span className="font-data truncate text-[10px] text-slate-400">{m.years}y</span>
              </button>
            );
          })}
        </div>
        <div className="pointer-events-none absolute top-6 bottom-6" style={{ left: `${refPct}%` }} data-testid="timeline-ref-marker">
          <div className="absolute -top-6 -translate-x-1/2 whitespace-nowrap rounded bg-cyan-400/15 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-200">{format(refDate)}</div>
          <div className="h-[76px] w-px bg-cyan-300 shadow-[0_0_8px_#22D3EE]" />
        </div>
        <div className="font-data relative mt-2 h-4 text-[10px] text-slate-500">
          {Array.from({ length: 13 }, (_, i) => (
            <span key={i} className={`absolute ${i === 0 ? "" : i === 12 ? "-translate-x-full" : "-translate-x-1/2"}`} style={{ left: `${(i / 12) * 100}%` }}>
              {i === 0 ? `Birth ${birthYear}` : birthYear + i * 10}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

const format = (d) => d.toISOString().slice(0, 10);
