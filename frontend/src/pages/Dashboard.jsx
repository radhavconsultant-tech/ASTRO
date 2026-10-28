import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Plus } from "lucide-react";
import { Observatory } from "@/components/observatory/Observatory";
import { ChartWheel } from "@/components/chart/ChartWheel";
import { Reveal } from "@/components/common";
import { useApp } from "@/context/AppContext";
import { MODULES } from "@/lib/modules";
import { ABBR, PLANET_COLOR } from "@/lib/kp";

const LINES = ["The sky, measured", "to the sub-lord."];

const HeroTitle = () => {
  const { reducedMotion } = useApp();
  return (
    <div className="max-w-xl">
      <div className="eyebrow">KP Insight · Krishnamurti Paddhati</div>
      <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.02] text-amber-50 sm:text-5xl lg:text-6xl" data-testid="hero-title">
        {LINES.map((l, i) => (
          <span key={l} className="block overflow-hidden pb-1">
            <motion.span className={`block ${i === 1 ? "gold-text italic" : ""}`}
              initial={reducedMotion ? false : { y: "105%" }} animate={{ y: 0 }}
              transition={{ duration: 0.9, delay: 0.25 + i * 0.35, ease: [0.22, 1, 0.36, 1] }}>{l}</motion.span>
          </span>
        ))}
      </h1>
      <p className="mt-4 max-w-md text-sm text-slate-300 sm:text-base">
        A live planetary observatory and a precise KP chart explorer, calculated from a standard ephemeris.
      </p>
    </div>
  );
};

const KeyFact = ({ label, value, sub, color }) => (
  <div className="border-l border-amber-500/25 pl-4">
    <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">{label}</div>
    <div className="mt-1 font-display text-2xl font-semibold" style={{ color: color || "#FEF3C7" }}>{value}</div>
    <div className="font-data mt-0.5 text-[12px] text-cyan-200">{sub}</div>
  </div>
);

const ChartGlance = () => {
  const { chartData, active, t } = useApp();
  if (!chartData) return <div className="panel p-6 text-sm text-slate-400">Calculating chart…</div>;
  const asc = chartData.cusps[0];
  const moon = chartData.planets.find((p) => p.name === "Moon");
  const sun = chartData.planets.find((p) => p.name === "Sun");
  const lords = (p) => `${ABBR[p.star_lord]} / ${ABBR[p.sub_lord]} / ${ABBR[p.sub_sub_lord]}`;
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12" data-testid="chart-glance">
      <div className="lg:col-span-5">
        <div className="eyebrow">{t("activeChart")}{active.sample ? ` · ${t("sample")}` : ""}</div>
        <h2 className="mt-2 font-display text-3xl font-semibold text-amber-50 sm:text-4xl">{active.name}</h2>
        <p className="font-data mt-2 text-sm text-slate-400">{active.date} · {active.time} · {active.place}</p>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
          <KeyFact label={t("ascendant")} value={t(asc.sign)} sub={`${asc.dms} · ${lords(asc)}`} />
          <KeyFact label={t("Moon")} value={t(moon.nakshatra)} sub={`${t(moon.sign)} ${moon.dms}`} color={PLANET_COLOR.Moon} />
          <KeyFact label={t("Sun")} value={t(sun.sign)} sub={`${sun.dms} · ${lords(sun)}`} color={PLANET_COLOR.Sun} />
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/explorer" data-testid="glance-open-explorer"
            className="focus-ring group inline-flex items-center gap-2 rounded-full bg-amber-300 px-5 py-2.5 text-sm font-semibold text-[#0b0f19] transition-transform hover:scale-[1.03]">
            {t("openExplorer")}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link to="/charts/new" data-testid="glance-new-chart"
            className="focus-ring inline-flex items-center gap-2 rounded-full border border-amber-400/40 px-5 py-2.5 text-sm text-amber-100 transition-colors hover:bg-amber-400/10">
            <Plus className="h-4 w-4" />{t("createChart")}
          </Link>
        </div>
      </div>
      <div className="lg:col-span-7">
        <Link to="/explorer" className="focus-ring block rounded-2xl" aria-label="Open the chart wheel in the explorer" data-testid="glance-wheel-link">
          <div className="mx-auto max-w-[520px] opacity-95 transition-opacity hover:opacity-100">
            <ChartWheel data={chartData} compact />
          </div>
        </Link>
      </div>
    </div>
  );
};

const Roadmap = () => {
  const { t } = useApp();
  return (
    <div data-testid="roadmap">
      <div className="eyebrow">Roadmap</div>
      <h2 className="mt-2 font-display text-3xl font-semibold text-amber-50">What arrives next</h2>
      <div className="mt-6 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.06] md:grid-cols-2">
        {[2, 3].map((ph) => (
          <div key={ph} className="bg-[#0d1220] p-6">
            <div className="font-data text-xs text-cyan-300">PHASE {ph}</div>
            <div className="mt-4 flex flex-wrap gap-2">
              {MODULES.filter((m) => m.phase === ph).map((m) => (
                <Link key={m.id} to={m.to || `/modules/${m.id}`} data-testid={`roadmap-${m.id}`}
                  className="focus-ring inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-sm text-slate-200 transition-colors hover:border-amber-400/50 hover:text-amber-100">
                  <m.icon className="h-3.5 w-3.5 text-amber-300/80" strokeWidth={1.6} />{t(m.key)}
                  {m.built && <span className="rounded bg-emerald-400/15 px-1.5 text-[10px] font-semibold uppercase text-emerald-200">Live</span>}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function Dashboard() {
  return (
    <div className="space-y-20 px-4 pb-20 pt-6 sm:px-6 lg:px-10" data-testid="dashboard-page">
      <Observatory hero intro><HeroTitle /></Observatory>
      <Reveal><ChartGlance /></Reveal>
      <Reveal><Roadmap /></Reveal>
    </div>
  );
}
