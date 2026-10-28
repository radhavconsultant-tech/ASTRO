import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader, Reveal } from "@/components/common";
import { useApp } from "@/context/AppContext";
import { useDasha } from "@/lib/hooks";
import { planetHouses, houseSignificators } from "@/lib/sig";
import { fmt, parse } from "@/components/dasha/dashaUtils";
import { ABBR, PLANET_COLOR } from "@/lib/kp";

const GROUPS = {
  career: { key: "career", title: "Career houses", houses: [2, 6, 10, 11] },
  marriage: { key: "marriage", title: "Marriage houses", houses: [2, 7, 11] },
  finance: { key: "finance", title: "Finance houses", houses: [2, 6, 11] },
};
export const TOPIC_PAGES = GROUPS;
let GROUP = GROUPS.career.houses;

const HouseChips = ({ list, group = GROUP }) => (
  <span className="flex flex-wrap gap-1">
    {list.length ? list.map((h) => (
      <span key={h} className={`font-data rounded px-1.5 text-[12px] ${group.includes(h) ? "bg-amber-400/20 text-amber-100" : "text-slate-400"}`}>{h}</span>
    )) : <span className="text-slate-600">—</span>}
  </span>
);

const CuspCard = ({ chart, house }) => {
  const { t } = useApp();
  const c = chart.cusps[house - 1];
  const sub = c.sub_lord;
  const hs = planetHouses(chart, sub);
  const hits = hs.filter((h) => GROUP.includes(h));
  const sigs = houseSignificators(chart, house);
  return (
    <div className="panel p-5" data-testid={`career-cusp-${house}`}>
      <div className="flex items-baseline justify-between">
        <div className="font-data text-xs text-cyan-300">CUSP {house}</div>
        <div className="text-xs text-slate-400">{t(c.sign)} <span className="font-data">{c.dms}</span></div>
      </div>
      <div className="mt-2 text-[11px] uppercase tracking-wider text-slate-400">{t("subLord")}</div>
      <div className="font-display text-3xl font-semibold" style={{ color: PLANET_COLOR[sub] }} data-testid={`career-cusp-${house}-sub`}>{t(sub)}</div>
      <div className="mt-1 text-xs text-slate-400">star {t(c.star_lord)} · sub-sub {t(c.sub_sub_lord)}</div>
      <div className="mt-4 text-[11px] uppercase tracking-wider text-slate-400">Sub-lord signifies</div>
      <div className="mt-1"><HouseChips list={hs} /></div>
      <div className="mt-2 text-xs text-slate-300">Links to {hits.length ? hits.join(", ") : "none"} of {GROUP.join(" · ")}</div>
      <div className="mt-4 border-t border-white/5 pt-3 text-[11px] uppercase tracking-wider text-slate-400">Significators of house {house}</div>
      <div className="mt-1 flex flex-wrap gap-1">{sigs.map((p) => <span key={p} className="font-data rounded border border-white/10 px-1.5 text-[12px]" style={{ color: PLANET_COLOR[p] }}>{ABBR[p]}</span>)}</div>
    </div>
  );
};

const Timing = ({ chart, dasha }) => {
  const { t } = useApp();
  const [all, setAll] = useState(false);
  const now = new Date();
  const rows = useMemo(() => {
    const out = [];
    (dasha?.mahadashas || []).forEach((m) => m.bhuktis.forEach((b) => {
      if (parse(b.end) < now || parse(b.start).getFullYear() > now.getFullYear() + 25) return;
      const mh = planetHouses(chart, m.lord).filter((h) => GROUP.includes(h));
      const bh = planetHouses(chart, b.lord).filter((h) => GROUP.includes(h));
      out.push({ md: m.lord, ad: b.lord, start: b.start, end: b.end, mh, bh, both: mh.length > 0 && bh.length > 0 });
    }));
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chart, dasha, GROUP]);
  const list = all ? rows : rows.filter((r) => r.both);
  return (
    <div className="panel p-4 sm:p-5" data-testid="career-timing">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="eyebrow">Timing from the Dasha</div>
          <p className="mt-1 text-xs text-slate-400">Bhuktis in the next 25 years where both the Mahadasha and Bhukti lords signify any of {GROUP.join(", ")}.</p>
        </div>
        <button onClick={() => setAll(!all)} data-testid="career-timing-toggle" className="focus-ring rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-300 hover:border-amber-400/50">
          {all ? "Show linked only" : "Show every Bhukti"}
        </button>
      </div>
      <div className="scroll-thin mt-4 max-h-[460px] overflow-auto">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead className="sticky top-0 bg-[#0f1524] text-[11px] uppercase tracking-wider text-slate-400">
            <tr><th className="py-2">Period</th><th>{t("start")}</th><th>{t("end")}</th><th>MD links</th><th>Bhukti links</th></tr>
          </thead>
          <tbody>
            {list.map((r) => {
              const isNow = parse(r.start) <= now && now < parse(r.end);
              return (
                <tr key={r.start} className={`border-t border-white/[0.04] ${r.both ? "" : "opacity-60"} ${isNow ? "bg-cyan-400/[0.06]" : ""}`} data-testid="career-timing-row">
                  <td className="py-2"><span style={{ color: PLANET_COLOR[r.md] }}>{t(r.md)}</span> <span className="text-slate-600">›</span> <span style={{ color: PLANET_COLOR[r.ad] }}>{t(r.ad)}</span>{isNow && <span className="ml-2 rounded bg-cyan-400/15 px-1.5 text-[10px] font-semibold text-cyan-200">NOW</span>}</td>
                  <td className="font-data text-cyan-200">{fmt(r.start)}</td>
                  <td className="font-data text-cyan-200">{fmt(r.end)}</td>
                  <td><HouseChips list={r.mh} /></td>
                  <td><HouseChips list={r.bh} /></td>
                </tr>
              );
            })}
            {!list.length && <tr><td colSpan={5} className="py-4 text-sm text-slate-400">No Bhukti in this range has both lords linked to {GROUP.join(", ")}.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const topicTiming = (chart, dasha, group, years = 25) => {
  const now = new Date();
  const out = [];
  (dasha?.mahadashas || []).forEach((m) => m.bhuktis.forEach((b) => {
    if (parse(b.end) < now || parse(b.start).getFullYear() > now.getFullYear() + years) return;
    const mh = planetHouses(chart, m.lord).filter((h) => group.includes(h));
    const bh = planetHouses(chart, b.lord).filter((h) => group.includes(h));
    out.push({ md: m.lord, ad: b.lord, start: b.start, end: b.end, mh, bh, both: mh.length > 0 && bh.length > 0 });
  }));
  return out;
};

export default function TopicPage({ id = "career" }) {
  const { chartData, active, t } = useApp();
  const dq = useDasha(active);
  const cfg = GROUPS[id];
  GROUP = cfg.houses;
  if (!chartData) return <div className="px-4 pt-8 sm:px-6 lg:px-10"><Skeleton className="h-[480px] w-full rounded-2xl bg-white/5" /></div>;
  return (
    <div className="space-y-8 px-4 pb-16 pt-8 sm:px-6 lg:px-10" data-testid={`${id}-page`}>
      <PageHeader eyebrow={`${t(cfg.key)} · ${active.name}${active.sample ? ` · ${t("sample")}` : ""}`} title={cfg.title}
        right={<Link to={`/print/topic/${id}`} data-testid={`${id}-print-link`} className="focus-ring inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-amber-400/40 px-4 py-2 text-sm text-amber-100 hover:bg-amber-400/10"><Printer className="h-4 w-4" />{t("print")}</Link>}>
        The sub-lords of cusps {GROUP.join(", ")} and the houses they signify (cusp-based, with node agency). Houses in the {t(cfg.key).toLowerCase()} group are highlighted in gold.
      </PageHeader>
      <Reveal key={id} className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${GROUP.length === 4 ? "xl:grid-cols-4" : "xl:grid-cols-3"}`}>
        {GROUP.map((h) => <CuspCard key={h} chart={chartData} house={h} />)}
      </Reveal>
      {dq.data ? <Timing chart={chartData} dasha={dq.data} /> : <Skeleton className="h-60 w-full rounded-2xl bg-white/5" />}
      <p className="text-xs text-slate-500">
        Source: the standard KP house group for {t(cfg.key).toLowerCase()} ({GROUP.join(", ")}). This page shows connections only; it gives no verdicts.
        Your own rule engine can replace this logic later. <Link to="/explorer" className="text-amber-200 hover:underline">Check the details in the Chart Explorer →</Link>
      </p>
    </div>
  );
}

function _unusedCareer() {
  const { chartData, active, t } = useApp();
  const dq = useDasha(active);
  if (!chartData) return <div className="px-4 pt-8 sm:px-6 lg:px-10"><Skeleton className="h-[480px] w-full rounded-2xl bg-white/5" /></div>;
  return (
    <div className="space-y-8 px-4 pb-16 pt-8 sm:px-6 lg:px-10" data-testid="career-page">
      <PageHeader eyebrow={`${t("career")} · ${active.name}${active.sample ? ` · ${t("sample")}` : ""}`} title="Career houses">
        The sub-lords of cusps 2, 6, 10 and 11 and the houses they signify (cusp-based, with node agency). Houses in the career group are highlighted in gold.
      </PageHeader>
      <Reveal className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {GROUP.map((h) => <CuspCard key={h} chart={chartData} house={h} />)}
      </Reveal>
      {dq.data ? <Timing chart={chartData} dasha={dq.data} /> : <Skeleton className="h-60 w-full rounded-2xl bg-white/5" />}
      <p className="text-xs text-slate-500">
        Source: the standard KP house group for career (2, 6, 10, 11). This page shows connections only; it gives no verdicts.
        Your own rule engine can replace this logic later. <Link to="/explorer" className="text-amber-200 hover:underline">Check the details in the Chart Explorer →</Link>
      </p>
    </div>
  );
}
