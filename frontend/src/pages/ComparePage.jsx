import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/common";
import { ChartWheel } from "@/components/chart/ChartWheel";
import { useApp } from "@/context/AppContext";
import { fetchAnyChart } from "@/lib/api";
import { KP_PLANETS, PLANET_COLOR } from "@/lib/kp";

const useChart = (c) => useQuery({ queryKey: ["chart-any", c?.id, c?.kind, c?.number, c?.date, c?.time, c?.latitude, c?.longitude, c?.tz], queryFn: () => fetchAnyChart(c), enabled: !!c, staleTime: Infinity });

const Picker = ({ value, onChange, testId }) => {
  const { charts } = useApp();
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} data-testid={testId}
      className="focus-ring w-full rounded-lg border border-white/10 bg-[#0b0f19] px-3 py-2.5 text-sm text-slate-100">
      {charts.map((c) => <option key={c.id} value={c.id}>{c.name}{c.sample ? " (sample)" : ""}</option>)}
    </select>
  );
};

const Lord = ({ v, hit }) => {
  const { t } = useApp();
  return <span className={`rounded px-1.5 py-0.5 ${hit ? "bg-amber-400/20 ring-1 ring-amber-300/50" : ""}`} style={{ color: PLANET_COLOR[v] }}>{t(v)}</span>;
};

const Row = ({ label, a, b, testId }) => {
  const star = a.star_lord === b.star_lord;
  const sub = a.sub_lord === b.sub_lord;
  return (
    <tr className="border-t border-white/[0.04]" data-testid={testId}>
      <td className="py-2 pr-2 text-slate-200">{label}</td>
      <td><Lord v={a.star_lord} hit={star} /></td><td><Lord v={a.sub_lord} hit={sub} /></td>
      <td className="border-l border-white/5 pl-3"><Lord v={b.star_lord} hit={star} /></td><td><Lord v={b.sub_lord} hit={sub} /></td>
      <td className="font-data text-xs text-amber-200">{[star && "star", sub && "sub"].filter(Boolean).join(" + ")}</td>
    </tr>
  );
};

export default function ComparePage() {
  const { charts, activeId, t } = useApp();
  const [aId, setA] = useState(activeId);
  const [bId, setB] = useState(() => (charts.find((c) => c.id !== activeId) || charts[0]).id);
  const ca = charts.find((c) => c.id === aId);
  const cb = charts.find((c) => c.id === bId);
  const qa = useChart(ca);
  const qb = useChart(cb);
  const A = qa.data;
  const B = qb.data;

  const rows = A && B ? [
    ...KP_PLANETS.map((n) => ({ label: t(n), a: A.planets.find((p) => p.name === n), b: B.planets.find((p) => p.name === n), id: n.toLowerCase() })),
    ...A.cusps.map((c, i) => ({ label: `${t("house")} ${c.house}`, a: c, b: B.cusps[i], id: `cusp-${c.house}` })),
  ] : [];
  const stars = rows.filter((r) => r.a.star_lord === r.b.star_lord).length;
  const subs = rows.filter((r) => r.a.sub_lord === r.b.sub_lord).length;

  return (
    <div className="space-y-8 px-4 pb-16 pt-8 sm:px-6 lg:px-10" data-testid="compare-page">
      <PageHeader eyebrow={t("compare")} title="Two charts, side by side">
        Planets and cusps are matched row by row. Shared star-lords and sub-lords are highlighted in gold.
      </PageHeader>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {[[aId, setA, A, "compare-a"], [bId, setB, B, "compare-b"]].map(([v, set, d, id]) => (
          <div key={id} className="panel p-4">
            <Picker value={v} onChange={set} testId={`${id}-select`} />
            <div className="mx-auto mt-4 max-w-[380px]">{d ? <ChartWheel data={d} compact /> : <div className="py-24 text-center text-sm text-slate-400">Calculating…</div>}</div>
          </div>
        ))}
      </div>
      {A && B && (
        <div className="panel p-4 sm:p-5">
          <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
            <div className="eyebrow">Shared lords</div>
            <div className="font-data text-sm text-amber-200" data-testid="compare-summary">{stars} shared star-lords · {subs} shared sub-lords of {rows.length} points</div>
          </div>
          <div className="scroll-thin mt-3 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm" data-testid="compare-table">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400">
                <tr><th className="py-2">Point</th><th>A {t("starLord")}</th><th>A {t("subLord")}</th><th className="pl-3">B {t("starLord")}</th><th>B {t("subLord")}</th><th>Shared</th></tr>
              </thead>
              <tbody>{rows.map((r) => <Row key={r.id} label={r.label} a={r.a} b={r.b} testId={`compare-row-${r.id}`} />)}</tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
