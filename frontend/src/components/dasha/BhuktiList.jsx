import { Fragment } from "react";
import { ChevronRight } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { PLANET_COLOR } from "@/lib/kp";
import { fmt, parse, progress } from "./dashaUtils";
import { Signifies } from "./CurrentPeriods";

const PeriodRow = ({ p, refDate, active, open, onToggle, depth, testId }) => {
  const { t } = useApp();
  const now = parse(p.start) <= refDate && refDate < parse(p.end);
  return (
    <button onClick={onToggle} data-testid={testId} aria-expanded={onToggle ? open : undefined}
      className={`focus-ring grid w-full grid-cols-[18px_1fr_auto] items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors sm:grid-cols-[18px_150px_1fr_auto] ${active ? "bg-amber-400/10" : "hover:bg-white/[0.03]"} ${depth ? "pl-9" : ""}`}>
      {onToggle ? <ChevronRight className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${open ? "rotate-90" : ""}`} /> : <span className="h-1.5 w-1.5 justify-self-center rounded-full" style={{ background: PLANET_COLOR[p.lord] }} />}
      <span className="flex items-center gap-2">
        <span className={`text-sm ${depth ? "" : "font-medium"}`} style={{ color: PLANET_COLOR[p.lord] }}>{t(p.lord)}</span>
        {now && <span className="rounded bg-cyan-400/15 px-1.5 text-[10px] font-semibold text-cyan-200">NOW</span>}
      </span>
      <span className="hidden items-center gap-3 sm:flex">
        <span className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
          <span className="block h-full rounded-full" style={{ width: `${progress(p, refDate) * 100}%`, background: PLANET_COLOR[p.lord] }} />
        </span>
        <Signifies lord={p.lord} />
      </span>
      <span className="font-data whitespace-nowrap text-[12px] text-slate-300">{fmt(p.start)} → {fmt(p.end)}</span>
    </button>
  );
};

export const BhuktiList = ({ md, mdIndex, refDate, openAd, setOpenAd }) => {
  const { t } = useApp();
  return (
    <div className="panel p-4 sm:p-5" data-testid="bhukti-list">
      <div className="flex flex-wrap items-baseline justify-between gap-2 px-1">
        <div>
          <div className="eyebrow">Bhuktis</div>
          <h3 className="mt-1 font-display text-3xl font-semibold" style={{ color: PLANET_COLOR[md.lord] }} data-testid="bhukti-list-title">{t(md.lord)} Mahadasha</h3>
        </div>
        <span className="font-data text-xs text-slate-400">{fmt(md.start)} → {fmt(md.end)} · {md.years} years</span>
      </div>
      <div className="mt-4 divide-y divide-white/[0.04]">
        {md.bhuktis.map((b, j) => {
          const open = openAd === j;
          return (
            <Fragment key={`${b.lord}-${j}`}>
              <PeriodRow p={b} refDate={refDate} open={open} active={open} onToggle={() => setOpenAd(open ? null : j)} testId={`bhukti-row-${mdIndex}-${j}`} />
              {open && (
                <div className="pb-2" data-testid={`antara-list-${mdIndex}-${j}`}>
                  {b.antaras.map((a, k) => (
                    <PeriodRow key={`${a.lord}-${k}`} p={a} refDate={refDate} depth={1} testId={`antara-row-${mdIndex}-${j}-${k}`} />
                  ))}
                  <div className="ml-9 mt-1 flex flex-wrap gap-2 text-[11px] text-slate-500">
                    <span className="rounded border border-dashed border-white/10 px-2 py-0.5">Sookshma · unavailable</span>
                    <span className="rounded border border-dashed border-white/10 px-2 py-0.5">Prana · unavailable</span>
                  </div>
                </div>
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
};
