import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tag, Sparkles, Orbit } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { fetchSky } from "@/lib/api";
import { useDasha, useSadeSati, cycleFor } from "@/lib/hooks";
import { findActive } from "@/components/dasha/dashaUtils";
import { PLANET_COLOR, SIGNS } from "@/lib/kp";
import { TimePanel, stepDate } from "./TimePanel";
import { PlanetInspector } from "./PlanetInspector";
import { StaticSky } from "./StaticSky";
import { hasWebGL } from "./ObservatoryScene";

const ObservatoryScene = lazy(() => import("./ObservatoryScene"));

const roundMin = (d) => { const x = new Date(d); x.setSeconds(0, 0); return x; };

const ViewToggle = ({ view, setView, t }) => (
  <div className="glass flex rounded-full p-1 text-xs" role="group" aria-label="Scene view">
    {[["helio", "solarSystem"], ["geo", "kpSky"]].map(([k, l]) => (
      <button key={k} data-testid={`view-toggle-${k}`} onClick={() => setView(k)} aria-pressed={view === k}
        className={`focus-ring rounded-full px-3.5 py-1.5 font-medium transition-colors duration-200 ${view === k ? "bg-amber-300 text-[#0b0f19]" : "text-slate-300 hover:text-white"}`}>
        {t(l)}
      </button>
    ))}
  </div>
);

const Chip = ({ on, set, testId, children }) => (
  <button data-testid={testId} onClick={() => set(!on)} aria-pressed={on}
    className={`focus-ring glass flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-colors ${on ? "text-cyan-200" : "text-slate-400"}`}>
    {children}
  </button>
);

const DashaChip = ({ md, ad, an, t }) => (
  <div className="glass rounded-xl px-3 py-2" data-testid="observatory-dasha-chip">
    <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Running Dasha</div>
    <div className="mt-0.5 flex items-center gap-1.5 text-sm font-medium">
      {[md, ad, an].filter(Boolean).map((p, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-slate-600">›</span>}
          <span style={{ color: PLANET_COLOR[p.lord] }} data-testid={`observatory-dasha-${["md", "ad", "an"][i]}`}>{t(p.lord)}</span>
        </span>
      ))}
    </div>
  </div>
);

export function Observatory({ hero, intro, children }) {
  const { chartData, reducedMotion, t, active } = useApp();
  const [view, setView] = useState("helio");
  const [dt, setDtRaw] = useState(() => roundMin(new Date()));
  const [playing, setPlaying] = useState(false);
  const [step, setStep] = useState("day");
  const [selected, setSelected] = useState(null);
  const [showNatal, setShowNatal] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showSade, setShowSade] = useState(false);
  const [visible, setVisible] = useState(true);
  const [gl] = useState(hasWebGL);
  const box = useRef(null);
  const setDt = (d) => setDtRaw(typeof d === "function" ? (p) => roundMin(d(p)) : roundMin(d));
  const iso = dt.toISOString();

  const sky = useQuery({ queryKey: ["sky", iso], queryFn: () => fetchSky(iso), placeholderData: (p) => p, staleTime: Infinity, retry: 1 });
  const dq = useDasha(active);
  const md = findActive(dq.data?.mahadashas, dt);
  const ad = findActive(md?.bhuktis, dt);
  const an = findActive(ad?.antaras, dt);
  const sq = useSadeSati(active, showSade);
  const sadeCycle = showSade ? cycleFor(sq.data?.cycles, dt) : null;
  const sadeSigns = sq.data ? { rising: SIGNS.indexOf(sq.data.signs.rising), peak: SIGNS.indexOf(sq.data.signs.peak), setting: SIGNS.indexOf(sq.data.signs.setting) } : null;

  useEffect(() => {
    if (!playing) return undefined;
    const id = setInterval(() => setDtRaw((d) => stepDate(d, step, 1)), 900);
    return () => clearInterval(id);
  }, [playing, step]);

  useEffect(() => {
    const el = box.current;
    if (!el || !("IntersectionObserver" in window)) return undefined;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.01 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const onSelect = (n) => {
    if (n && ["Rahu", "Ketu"].includes(n) && view === "helio") setView("geo");
    setSelected(n);
  };

  const fallback = <StaticSky sky={sky.data} reason={gl ? "3D graphics failed to start" : "3D graphics unavailable on this device"} />;
  const natal = chartData?.planets;

  return (
    <div className="space-y-4">
      <div ref={box} className={`relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#05070d] ${hero ? "h-[68vh] min-h-[460px] sm:h-[74vh]" : "h-[58vh] min-h-[420px] lg:h-[66vh]"}`} data-testid="observatory-stage">
        {gl ? (
          <Suspense fallback={<div className="flex h-full items-center justify-center text-sm text-slate-400">Loading observatory…</div>}>
            <ObservatoryScene view={view} sky={sky.data} natal={natal} showNatal={showNatal} showLabels={showLabels}
              selected={selected} onSelect={onSelect} reduced={reducedMotion} active={visible} intro={intro} t={t} fallback={fallback}
              sadePath={sadeCycle?.path} sadeSigns={sadeSigns} />
          </Suspense>
        ) : fallback}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#05070d]/80 via-transparent to-[#05070d]/40" />
        {children && <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5 sm:p-8 lg:p-10">{children}</div>}

        <div className="absolute right-3 top-3 flex flex-col items-end gap-2 sm:right-4 sm:top-4">
          <ViewToggle view={view} setView={setView} t={t} />
          <div className="flex gap-2">
            <Chip on={showLabels} set={setShowLabels} testId="toggle-labels"><Tag className="h-3.5 w-3.5" />Labels</Chip>
            {view === "geo" && <Chip on={showNatal} set={setShowNatal} testId="toggle-natal"><Sparkles className="h-3.5 w-3.5" />{t("natal")}</Chip>}
            {view === "geo" && <Chip on={showSade} set={setShowSade} testId="toggle-sadesati"><Orbit className="h-3.5 w-3.5" />Sade Sati</Chip>}
          </div>
        </div>
        {md && (
          <div className={`absolute right-3 sm:right-4 ${hero ? "top-28 sm:bottom-4 sm:top-auto" : "bottom-3 sm:bottom-4"}`}>
            <DashaChip md={md} ad={ad} an={an} t={t} />
            {showSade && sadeCycle && view === "geo" && (
              <div className="glass mt-2 rounded-xl px-3 py-2 text-[11px] text-slate-300" data-testid="observatory-sadesati-note">
                Saturn path {sadeCycle.start.slice(0, 4)}–{sadeCycle.end.slice(0, 4)} · <span className="text-cyan-300">12th</span> · <span className="text-amber-200">Moon</span> · <span className="text-amber-500">2nd</span>
              </div>
            )}
          </div>
        )}
        <div className="absolute left-3 top-[3.6rem] sm:left-4 sm:top-4" data-testid="view-scale-note">
          <div className="glass rounded-md px-2.5 py-1 text-[11px] text-slate-300">
            {view === "helio" ? "Heliocentric · illustrative, not to scale" : "Geocentric · sidereal zodiac (KP) · nodes are points"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <TimePanel dt={dt} setDt={setDt} playing={playing} setPlaying={setPlaying} step={step} setStep={setStep}
            sky={sky.data} loading={sky.isFetching} error={sky.isError} natalUtc={chartData?.meta?.utc} />
        </div>
        <div className="lg:col-span-5">
          <PlanetInspector sky={sky.data} natal={natal} selected={selected} onSelect={onSelect} view={view} />
        </div>
      </div>
    </div>
  );
}
