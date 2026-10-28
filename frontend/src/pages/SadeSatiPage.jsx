import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Orbit, RotateCcw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader, Reveal } from "@/components/common";
import { SadeSatiWheel, PHASE_COLOR } from "@/components/sadesati/SadeSatiWheel";
import { fmt } from "@/components/dasha/dashaUtils";
import { useApp } from "@/context/AppContext";
import { useSadeSati, cycleFor } from "@/lib/hooks";

const Status = ({ data, now }) => {
  const { t } = useApp();
  const tn = now.getTime();
  const cur = data.cycles.find((c) => new Date(c.start) <= now && now < new Date(c.end));
  if (cur) {
    const seg = cur.segments.find((s) => new Date(s.start).getTime() <= tn && tn < new Date(s.end).getTime());
    return (
      <div className="panel border-amber-400/30 p-5" data-testid="sadesati-status">
        <div className="eyebrow">Today</div>
        <div className="mt-1 font-display text-3xl font-semibold text-amber-100">In Sade Sati{seg ? ` · ${t(seg.phase)}` : ""}</div>
        <p className="font-data mt-1 text-sm text-slate-300">Saturn in {seg ? t(seg.sign) : "—"} until {seg ? fmt(seg.end) : "—"} · cycle ends {fmt(cur.end)}</p>
      </div>
    );
  }
  const next = data.cycles.find((c) => new Date(c.start) > now);
  return (
    <div className="panel p-5" data-testid="sadesati-status">
      <div className="eyebrow">Today</div>
      <div className="mt-1 font-display text-3xl font-semibold text-slate-100">Not in Sade Sati</div>
      <p className="font-data mt-1 text-sm text-slate-300">{next ? `Next cycle begins ${fmt(next.start)} (Saturn enters ${t(next.segments[0].sign)})` : "No further cycle in the calculated range"}</p>
    </div>
  );
};

export default function SadeSatiPage() {
  const { active, t } = useApp();
  const q = useSadeSati(active);
  const d = q.data;
  const [now] = useState(() => new Date());
  const [sel, setSel] = useState(null);
  const [idx, setIdx] = useState(0);

  const defaultIdx = useMemo(() => (d ? Math.max(0, d.cycles.indexOf(cycleFor(d.cycles, now))) : 0), [d, now]);
  useEffect(() => { setSel(defaultIdx); }, [defaultIdx]);
  const cycle = d?.cycles?.[sel ?? defaultIdx];

  useEffect(() => {
    if (!cycle) return;
    const tn = now.toISOString().slice(0, 10);
    const i = cycle.path.findIndex((p) => p.t >= tn);
    setIdx(i > 0 ? i : 0);
  }, [cycle, now]);

  if (!d) {
    return (
      <div className="px-4 pt-8 sm:px-6 lg:px-10">
        {q.isError ? <div className="panel p-8 text-slate-300" data-testid="sadesati-error">The Sade Sati calculation could not be reached for this chart.</div>
          : <Skeleton className="h-[480px] w-full rounded-2xl bg-white/5" />}
      </div>
    );
  }

  return (
    <div className="space-y-8 px-4 pb-16 pt-8 sm:px-6 lg:px-10" data-testid="sadesati-page">
      <PageHeader eyebrow={`${t("sadeSati")} · ${active.name}${active.sample ? ` · ${t("sample")}` : ""}`} title="Saturn over the Moon"
        right={<Link to="/observatory" className="focus-ring inline-flex items-center gap-2 rounded-full border border-amber-400/40 px-4 py-2 text-sm text-amber-100 hover:bg-amber-400/10" data-testid="sadesati-open-observatory"><Orbit className="h-4 w-4" />See path in 3D</Link>}>
        Natal Moon in <span className="text-amber-100">{t(d.moon_sign)}</span> <span className="font-data">{d.moon.dms}</span>.
        Sade Sati runs while Saturn transits {t(d.signs.rising)}, {t(d.signs.peak)} and {t(d.signs.setting)} (sidereal, KP ayanamsa).
      </PageHeader>
      <div className="font-data flex flex-wrap gap-x-5 gap-y-1 text-[12px] text-slate-400" data-testid="sadesati-meta">
        <span>{d.cycles.length} cycles in {d.range_years} years from birth</span><span>calc {d.calc_ms} ms</span><span>contract {d.contract}</span>
        <span className="text-slate-500">Retrograde re-entries are listed separately</span>
      </div>

      <Status data={d} now={now} />

      <div className="flex flex-wrap gap-2" role="group" aria-label="Cycles">
        {d.cycles.map((c, i) => (
          <button key={c.start} onClick={() => setSel(i)} data-testid={`sadesati-cycle-${i}`} aria-pressed={sel === i}
            className={`focus-ring rounded-full border px-4 py-2 text-sm transition-colors ${sel === i ? "border-amber-300/70 bg-amber-400/15 text-amber-100" : "border-white/10 text-slate-300 hover:border-amber-400/40"}`}>
            <span className="font-data">{c.start.slice(0, 4)}–{c.end.slice(0, 4)}</span>
            {c.in_progress_at_birth && <span className="ml-2 text-[10px] text-slate-400">at birth</span>}
          </button>
        ))}
      </div>

      {cycle && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <Reveal className="panel p-4 sm:p-6 lg:col-span-7">
            <SadeSatiWheel data={d} cycle={cycle} idx={idx} />
            <div className="mt-4 flex items-center gap-3">
              <input type="range" min={0} max={cycle.path.length - 1} value={idx} onChange={(e) => setIdx(Number(e.target.value))}
                className="w-full accent-amber-300" aria-label="Scrub through Saturn's path" data-testid="sadesati-scrub" />
              <button onClick={() => { const tn = now.toISOString().slice(0, 10); const i = cycle.path.findIndex((p) => p.t >= tn); setIdx(i > 0 ? i : 0); }}
                className="focus-ring rounded-md border border-white/10 p-1.5 text-slate-300 hover:text-amber-200" aria-label="Back to today" data-testid="sadesati-scrub-reset"><RotateCcw className="h-4 w-4" /></button>
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5"><span className="h-0.5 w-5 bg-[#D9BF85]" />Direct</span>
              <span className="flex items-center gap-1.5"><span className="h-0.5 w-5 bg-red-400" />Retrograde</span>
              <span>Path spirals outward with time · 8-day samples</span>
            </div>
          </Reveal>
          <div className="space-y-4 lg:col-span-5">
            {cycle.phases.map((p) => (
              <div key={p.phase} className="panel p-5" data-testid={`sadesati-phase-${p.phase}`} style={{ boxShadow: `inset 3px 0 0 ${PHASE_COLOR[p.phase]}` }}>
                <div className="flex items-baseline justify-between gap-2">
                  <div className="text-sm font-semibold" style={{ color: PHASE_COLOR[p.phase] }}>{t(p.phase)}</div>
                  <div className="text-xs text-slate-400">{t(p.sign)}</div>
                </div>
                <div className="font-data mt-2 text-lg text-slate-100">{fmt(p.start)} → {fmt(p.end)}</div>
                {p.entries > 1 && <div className="mt-1 text-xs text-amber-200/80">Saturn enters this sign {p.entries} times (retrograde re-entries)</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {cycle && (
        <div className="panel p-4 sm:p-5">
          <div className="eyebrow mb-3">Every transit in this cycle</div>
          <div className="scroll-thin overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm" data-testid="sadesati-segments">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400">
                <tr><th className="py-2">Phase</th><th>{t("sign")}</th><th>{t("start")}</th><th>{t("end")}</th><th>Entry</th></tr>
              </thead>
              <tbody>
                {cycle.segments.map((s) => (
                  <tr key={s.start} className="border-t border-white/[0.05]">
                    <td className="py-2" style={{ color: PHASE_COLOR[s.phase] }}>{t(s.phase)}</td>
                    <td className="text-slate-200">{t(s.sign)}</td>
                    <td className="font-data text-cyan-200">{fmt(s.start)}</td>
                    <td className="font-data text-cyan-200">{fmt(s.end)}</td>
                    <td className="text-xs">{s.retrograde_entry ? <span className="text-red-300">Retrograde</span> : <span className="text-slate-400">Direct</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <p className="text-xs text-slate-500">Ingress times are found to within a few minutes by bisection on the built-in ephemeris. No interpretations are shown in this milestone.</p>
    </div>
  );
}
