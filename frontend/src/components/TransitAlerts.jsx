import { differenceInCalendarDays } from "date-fns";
import { ArrowRight } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useTransits } from "@/lib/hooks";
import { fmt, parse } from "@/components/dasha/dashaUtils";
import { PLANET_COLOR } from "@/lib/kp";

const ord = (n) => `${n}${n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th"}`;

export const TransitAlerts = () => {
  const { active, t } = useApp();
  const q = useTransits(active);
  const d = q.data;
  if (q.isError) return null;
  return (
    <div data-testid="transit-alerts">
      <div className="eyebrow">Upcoming transits · {active.name}</div>
      <h2 className="mt-2 font-display text-3xl font-semibold text-amber-50">Saturn & Jupiter sign changes</h2>
      <p className="mt-1 text-sm text-slate-400">Next 3 years, sidereal (KP). Houses are counted by sign from the natal Moon and Ascendant.</p>
      {!d ? <div className="panel mt-6 p-6 text-sm text-slate-400">Calculating…</div> : (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-3 lg:col-span-4">
            {["Saturn", "Jupiter"].map((n) => {
              const c = d.current[n];
              return (
                <div key={n} className="panel p-4" data-testid={`transit-current-${n.toLowerCase()}`}>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Now</div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="font-display text-2xl font-semibold" style={{ color: PLANET_COLOR[n] }}>{t(n)}</span>
                    <span className="text-sm text-slate-200">{t(c.sign)}</span>
                    <span className="font-data text-xs text-cyan-200">{c.dms}{c.retrograde ? " R" : ""}</span>
                  </div>
                  <div className="mt-1 text-xs text-slate-400">{ord(c.house_from_moon)} from Moon · {ord(c.house_from_asc)} from Ascendant</div>
                </div>
              );
            })}
          </div>
          <ol className="panel divide-y divide-white/[0.05] p-2 lg:col-span-8" data-testid="transit-events">
            {d.events.slice(0, 10).map((e) => {
              const days = differenceInCalendarDays(parse(e.utc), new Date());
              return (
                <li key={`${e.planet}${e.utc}`} className="grid grid-cols-[88px_1fr] items-center gap-3 px-3 py-3 sm:grid-cols-[110px_1fr_auto]" data-testid="transit-event">
                  <div>
                    <div className="font-data text-sm text-slate-100">{fmt(e.utc)}</div>
                    <div className="text-[11px] text-slate-500">{days <= 0 ? "today" : `in ${days} days`}</div>
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 text-sm">
                      <span className="font-medium" style={{ color: PLANET_COLOR[e.planet] }}>{t(e.planet)}</span>
                      <span className="text-slate-400">{t(e.from_sign)}</span><ArrowRight className="h-3.5 w-3.5 text-slate-500" /><span className="text-slate-100">{t(e.to_sign)}</span>
                      {e.retrograde && <span className="rounded bg-red-400/15 px-1.5 text-[10px] font-semibold text-red-200">RETRO</span>}
                      {e.sade_sati && <span className="rounded bg-amber-400/15 px-1.5 text-[10px] font-semibold text-amber-200">Sade Sati · {e.sade_sati}</span>}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-400">{ord(e.house_from_moon)} from Moon · {ord(e.house_from_asc)} from Ascendant</div>
                  </div>
                </li>
              );
            })}
            {!d.events.length && <li className="p-4 text-sm text-slate-400">No sign changes in the next 3 years.</li>}
          </ol>
        </div>
      )}
    </div>
  );
};
