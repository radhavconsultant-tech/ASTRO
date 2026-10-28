import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { planetHouses, houseSignificators, TOPICS } from "@/lib/sig";
import { ABBR, PLANET_COLOR } from "@/lib/kp";

export const HoraryAnalysis = ({ chart, onSelect }) => {
  const { t, active } = useApp();
  const [topicId, setTopicId] = useState(active.topic || "job");
  const topic = TOPICS.find((x) => x.id === topicId) || TOPICS[0];
  const c = chart.cusps[topic.house - 1];
  const hs = planetHouses(chart, c.sub_lord);
  const starHs = planetHouses(chart, c.star_lord);
  const hits = hs.filter((h) => topic.group.includes(h));
  const sigs = houseSignificators(chart, topic.house);
  const Chips = ({ list }) => (
    <span className="flex flex-wrap gap-1">
      {list.map((h) => <span key={h} className={`font-data rounded px-1.5 text-[12px] ${topic.group.includes(h) ? "bg-amber-400/20 text-amber-100" : "text-slate-400"}`}>{h}</span>)}
    </span>
  );
  return (
    <div className="panel p-5" data-testid="horary-analysis">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="eyebrow">Question analysis</div>
        <select value={topicId} onChange={(e) => setTopicId(e.target.value)} data-testid="horary-topic-select"
          className="focus-ring rounded-md border border-white/10 bg-[#0b0f19] px-2.5 py-1.5 text-sm text-slate-200">
          {TOPICS.map((x) => <option key={x.id} value={x.id}>{x.label} · house {x.house}</option>)}
        </select>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-3">
        <button onClick={() => onSelect({ type: "cusp", id: topic.house })} className="focus-ring rounded-xl border border-amber-400/30 bg-amber-400/[0.05] p-4 text-left" data-testid="horary-analysis-cusp">
          <div className="font-data text-xs text-cyan-300">RELEVANT CUSP {topic.house}</div>
          <div className="mt-1 text-sm text-slate-300">{t(c.sign)} <span className="font-data">{c.dms}</span></div>
          <div className="mt-3 text-[11px] uppercase tracking-wider text-slate-400">{t("subLord")}</div>
          <div className="font-display text-3xl font-semibold" style={{ color: PLANET_COLOR[c.sub_lord] }} data-testid="horary-analysis-sub">{t(c.sub_lord)}</div>
          <div className="text-xs text-slate-400">in the star of {t(c.star_lord)}</div>
        </button>
        <div>
          <div className="text-[11px] uppercase tracking-wider text-slate-400">Sub-lord signifies</div>
          <div className="mt-1"><Chips list={hs} /></div>
          <div className="mt-3 text-[11px] uppercase tracking-wider text-slate-400">Its star-lord signifies</div>
          <div className="mt-1"><Chips list={starHs} /></div>
          <div className="mt-3 text-xs text-slate-300" data-testid="horary-analysis-hits">Links to {hits.length ? hits.join(", ") : "none"} of the group {topic.group.join(" · ")}</div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wider text-slate-400">Significators of house {topic.house}</div>
          <div className="mt-1 flex flex-wrap gap-1">
            {sigs.map((p) => <button key={p} onClick={() => onSelect({ type: "planet", id: p })} className="focus-ring font-data rounded border border-white/10 px-1.5 text-[12px]" style={{ color: PLANET_COLOR[p] }}>{ABBR[p]}</button>)}
          </div>
          <p className="mt-3 text-[11px] text-slate-500">Standard KP house group for this topic, cusp-based with node agency. Connections only, no verdict.</p>
        </div>
      </div>
    </div>
  );
};
