import { useParams, Navigate, Link } from "react-router-dom";
import { CheckCircle2, CircleDashed, Database } from "lucide-react";
import { Reveal } from "@/components/common";
import { useApp } from "@/context/AppContext";
import { MODULES } from "@/lib/modules";

const PHASES = [
  { n: 1, title: "Interface & ephemeris", body: "Observatory, birth charts, KP explorer, significators." },
  { n: 2, title: "Timing", body: "Vimshottari Dasha, Saturn & Sade Sati, ruling planets." },
  { n: 3, title: "Your engine & knowledge", body: "Rules, sources, topic reports, remedies, exports." },
];

export default function ModulePage() {
  const { id } = useParams();
  const { t } = useApp();
  const m = MODULES.find((x) => x.id === id);
  if (!m) return <Navigate to="/" replace />;
  const Icon = m.icon;
  return (
    <div className="px-4 pb-16 pt-8 sm:px-6 lg:px-10" data-testid={`module-page-${m.id}`}>
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-slate-400/30 px-3 py-1 text-xs text-slate-300" data-testid="module-status">{t("inDevelopment")} · Phase {m.phase}</span>
          </div>
          <div className="mt-6 flex items-start gap-4">
            <div className="rounded-2xl border border-amber-500/20 bg-amber-400/[0.05] p-3"><Icon className="h-7 w-7 text-amber-300" strokeWidth={1.4} /></div>
            <h1 className="font-display text-4xl font-semibold leading-tight text-amber-50 sm:text-5xl lg:text-6xl" data-testid="module-title">{t(m.key)}</h1>
          </div>
          <p className="mt-5 max-w-xl text-base text-slate-300">{m.summary}</p>

          <Reveal className="mt-10">
            <div className="eyebrow">What will appear here</div>
            <ul className="mt-4 space-y-3" data-testid="module-planned-list">
              {m.planned.map((p) => (
                <li key={p} className="flex items-start gap-3 text-sm text-slate-200">
                  <CircleDashed className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300/80" />{p}
                </li>
              ))}
            </ul>
          </Reveal>

          <div className="mt-10 rounded-xl border border-white/[0.07] bg-white/[0.02] p-5 text-sm text-slate-300">
            <span className="font-semibold text-slate-100">Why nothing is shown yet.</span> This module needs calculations or approved rules that are not built.
            It will never show a generic prediction in their place.
            <div className="mt-3"><Link to="/explorer" className="text-amber-200 underline-offset-4 hover:underline" data-testid="module-explorer-link">Explore the chart data that is available now →</Link></div>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-5">
          <div className="panel p-5">
            <div className="eyebrow">Depends on</div>
            <ul className="mt-3 space-y-2">
              {m.depends.map((d) => (
                <li key={d} className="flex items-start gap-2 text-sm text-slate-300"><Database className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />{d}</li>
              ))}
            </ul>
          </div>
          <div className="panel p-5" data-testid="module-roadmap">
            <div className="eyebrow">Roadmap</div>
            <ol className="relative mt-4 space-y-5 border-l border-white/10 pl-6">
              {PHASES.map((p) => (
                <li key={p.n} className="relative">
                  <span className={`absolute -left-[31px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full ${p.n === 1 ? "bg-emerald-400/20" : p.n === m.phase ? "bg-amber-400/25 ring-2 ring-amber-300/50" : "bg-white/10"}`}>
                    {p.n === 1 && <CheckCircle2 className="h-3 w-3 text-emerald-300" />}
                  </span>
                  <div className={`text-sm font-medium ${p.n === m.phase ? "text-amber-100" : "text-slate-200"}`}>Phase {p.n} · {p.title}{p.n === m.phase ? " — this module" : ""}</div>
                  <div className="mt-0.5 text-xs text-slate-400">{p.body}</div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
