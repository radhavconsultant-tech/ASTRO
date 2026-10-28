import { X } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { ABBR, PLANET_COLOR, angDiff, ALL_PLANETS } from "@/lib/kp";

const Row = ({ k, v, mono }) => (
  <div className="flex items-baseline justify-between gap-3 py-1.5">
    <span className="text-xs text-slate-400">{k}</span>
    <span className={`${mono ? "font-data text-cyan-200" : "text-slate-100"} text-right text-sm`}>{v}</span>
  </div>
);

const Lords = ({ p }) => {
  const { t } = useApp();
  return (
    <div className="mt-2 flex items-center gap-1.5 text-xs">
      {[["starLord", p.star_lord], ["subLord", p.sub_lord], ["subSubLord", p.sub_sub_lord]].map(([k, v], i) => (
        <div key={k} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-slate-600">→</span>}
          <div className="rounded-md border border-amber-500/20 px-2 py-1">
            <div className="text-[10px] text-slate-400">{t(k)}</div>
            <div className="text-amber-100">{t(v)}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const PlanetInspector = ({ sky, natal, selected, onSelect, view }) => {
  const { t } = useApp();
  const geo = sky?.geocentric_sidereal || {};
  const helio = sky?.heliocentric || {};

  if (!selected) {
    return (
      <div className="panel p-4 sm:p-5" data-testid="planet-inspector-list">
        <div className="eyebrow">Sky now · sidereal</div>
        <p className="mt-1 text-xs text-slate-400">Select a body in the scene or below to focus the camera.</p>
        <div className="mt-3 divide-y divide-white/5">
          {ALL_PLANETS.map((n) => {
            const g = geo[n];
            if (!g) return null;
            return (
              <button key={n} data-testid={`inspector-row-${n.toLowerCase()}`} onClick={() => onSelect(n)}
                className="focus-ring flex w-full items-center gap-3 rounded-md px-1 py-2 text-left transition-colors hover:bg-white/[0.03]">
                <span className="h-2 w-2 rounded-full" style={{ background: PLANET_COLOR[n] }} />
                <span className="w-20 text-sm text-slate-100">{t(n)}</span>
                <span className="font-data text-[12px] text-cyan-200">{g.dms}</span>
                <span className="truncate text-xs text-slate-400">{t(g.sign)}</span>
                <span className="ml-auto font-data text-[11px] text-slate-400">{ABBR[g.star_lord]}/{ABBR[g.sub_lord]}</span>
                {g.retrograde && !["Rahu", "Ketu"].includes(n) && <span className="text-[10px] font-semibold text-amber-300">R</span>}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const g = geo[selected];
  const n = (natal || []).find((p) => p.name === selected);
  const h = helio[selected];
  return (
    <div className="panel relative p-4 sm:p-5" data-testid="planet-inspector-detail">
      <button onClick={() => onSelect(null)} data-testid="planet-inspector-close" aria-label="Close"
        className="focus-ring absolute right-3 top-3 rounded-md p-1 text-slate-400 hover:text-white"><X className="h-4 w-4" /></button>
      <div className="flex items-center gap-3">
        <span className="h-3 w-3 rounded-full shadow-[0_0_12px_currentColor]" style={{ background: PLANET_COLOR[selected], color: PLANET_COLOR[selected] }} />
        <h3 className="font-display text-3xl font-semibold text-amber-100" data-testid="planet-inspector-name">{t(selected)}</h3>
        {g?.retrograde && !["Rahu", "Ketu"].includes(selected) && <span className="rounded bg-amber-400/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber-200">RETRO</span>}
      </div>
      {["Rahu", "Ketu"].includes(selected) && <p className="mt-1 text-xs text-cyan-300/80">Lunar node — a calculated point, not a physical body.</p>}
      {selected === "Earth" && <p className="mt-1 text-xs text-slate-400">Observer's position. KP longitudes are measured from here.</p>}
      {g && (
        <div className="mt-4">
          <div className="eyebrow text-cyan-300/90">{t("selectedDate")}</div>
          <Row k={t("sign")} v={`${t(g.sign)} ${g.dms}`} mono />
          <Row k={t("nakshatra")} v={`${t(g.nakshatra)} · pada ${g.pada}`} />
          <Lords p={g} />
        </div>
      )}
      {n && g && (
        <div className="mt-5 border-t border-white/5 pt-4">
          <div className="eyebrow">{t("natal")}</div>
          <Row k={t("sign")} v={`${t(n.sign)} ${n.dms}`} mono />
          <Row k={t("nakshatra")} v={`${t(n.nakshatra)} · ${ABBR[n.star_lord]}/${ABBR[n.sub_lord]}/${ABBR[n.sub_sub_lord]}`} />
          <Row k="Moved since natal" v={`${angDiff(n.longitude, g.longitude) >= 0 ? "+" : ""}${angDiff(n.longitude, g.longitude).toFixed(2)}°`} mono />
        </div>
      )}
      {h && !h.geocentric && (
        <div className="mt-4 border-t border-white/5 pt-3">
          <Row k="Heliocentric distance" v={`${h.distance_au.toFixed(3)} AU`} mono />
          <Row k="Heliocentric longitude (tropical)" v={`${h.longitude.toFixed(2)}°`} mono />
        </div>
      )}
      {view === "helio" && <p className="mt-3 text-[11px] text-slate-500">Scene sizes and distances are exaggerated, not to scale.</p>}
    </div>
  );
};
