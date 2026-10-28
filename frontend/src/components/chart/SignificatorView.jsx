import { Switch } from "@/components/ui/switch";
import { useApp } from "@/context/AppContext";
import { ABBR, PLANET_COLOR, KP_PLANETS } from "@/lib/kp";

export const MethodToggle = ({ method, setMethod }) => {
  const { t } = useApp();
  return (
    <div className="flex rounded-full border border-white/10 p-0.5 text-xs" role="group" aria-label="House method">
      {[["cusp_based", "cuspBased"], ["whole_sign", "wholeSign"]].map(([k, l]) => (
        <button key={k} data-testid={`method-${k}`} onClick={() => setMethod(k)} aria-pressed={method === k}
          className={`focus-ring rounded-full px-3 py-1.5 transition-colors ${method === k ? "bg-amber-300 font-semibold text-[#0b0f19]" : "text-slate-300 hover:text-white"}`}>
          {t(l)}
        </button>
      ))}
    </div>
  );
};

const Houses = ({ list }) => (
  <span className="font-data text-cyan-200">{list?.length ? list.join(", ") : <span className="text-slate-600">—</span>}</span>
);
const Planets = ({ list, extra, onPick }) => (
  <span className="flex flex-wrap gap-1">
    {list?.length || extra?.length ? (
      <>
        {(list || []).map((p) => (
          <button key={p} onClick={() => onPick(p)} className="focus-ring font-data rounded border border-white/10 px-1.5 text-[12px] hover:border-amber-300/50" style={{ color: PLANET_COLOR[p] }}>{ABBR[p]}</button>
        ))}
        {(extra || []).map((p) => (
          <button key={`x${p}`} onClick={() => onPick(p)} title="Node agency" className="focus-ring font-data rounded border border-dashed border-cyan-400/50 px-1.5 text-[12px]" style={{ color: PLANET_COLOR[p] }}>{ABBR[p]}*</button>
        ))}
      </>
    ) : <span className="text-slate-600">—</span>}
  </span>
);

const LEVELS = [
  ["L1", "Houses occupied by its star-lord"], ["L2", "House it occupies"],
  ["L3", "Houses owned by its star-lord"], ["L4", "Houses it owns"],
];
const HLEVELS = [["A", "Planets in the star of occupants"], ["B", "Occupants"], ["C", "Planets in the star of the owner"], ["D", "Owner"]];

export const SignificatorView = ({ data, method, setMethod, mode, setMode, selection, onSelect, agency, setAgency }) => {
  const { t } = useApp();
  const sig = data.significators[method];
  const selP = selection?.type === "planet" ? selection.id : null;
  const selC = selection?.type === "cusp" ? selection.id : null;
  return (
    <div data-testid="significator-view">
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <MethodToggle method={method} setMethod={setMethod} />
        <div className="flex rounded-full border border-white/10 p-0.5 text-xs" role="group" aria-label="Significator view">
          {[["planet", "byPlanet"], ["house", "byHouse"]].map(([k, l]) => (
            <button key={k} data-testid={`sig-mode-${k}`} onClick={() => setMode(k)} aria-pressed={mode === k}
              className={`focus-ring rounded-full px-3 py-1.5 transition-colors ${mode === k ? "bg-cyan-400/15 text-cyan-200" : "text-slate-400 hover:text-white"}`}>{t(l)}</button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-xs text-slate-300">
          <Switch checked={agency} onCheckedChange={setAgency} data-testid="sig-agency-toggle" />Node agency
        </label>
        <span className="text-xs text-slate-500" data-testid="sig-method-note">
          {method === "cusp_based" ? "Placidus cusps · occupation by cusp span · ownership by cusp sign-lord" : "Houses counted by whole signs from the Ascendant sign"}
        </span>
      </div>
      <div className="scroll-thin overflow-auto rounded-lg border border-white/[0.06]">
        {mode === "planet" ? (
          <table className="w-full min-w-[640px] text-left text-sm" data-testid="sig-planet-table">
            <thead className="bg-[#111827] text-[11px] uppercase tracking-wider text-slate-400">
              <tr><th className="px-3 py-2.5">{t("planet")}</th><th className="px-3">{t("starLord")}</th>
                {LEVELS.map(([k, d]) => <th key={k} className="px-3" title={d}>{k}</th>)}
                {agency && <th className="px-3" title="Houses signified through node agency">Agency</th>}</tr>
            </thead>
            <tbody>
              {KP_PLANETS.map((n) => {
                const r = sig.planets[n];
                return (
                  <tr key={n} onClick={() => onSelect({ type: "planet", id: n })} data-testid={`sig-row-${n.toLowerCase()}`}
                    className={`cursor-pointer border-t border-white/[0.04] ${selP === n ? "bg-amber-400/10" : "hover:bg-white/[0.03]"}`}>
                    <td className="px-3 py-2" style={{ color: PLANET_COLOR[n] }}>{t(n)}</td>
                    <td className="px-3 text-slate-300">{t(r.star_lord)}</td>
                    <td className="px-3"><Houses list={r.L1} /></td><td className="px-3"><Houses list={r.L2} /></td>
                    <td className="px-3"><Houses list={r.L3} /></td><td className="px-3"><Houses list={r.L4} /></td>
                    {agency && (
                      <td className="px-3" data-testid={`sig-agency-${n.toLowerCase()}`}>
                        {r.agency ? (
                          <span title={r.agency.agents.map((a) => `${a.planet} (${a.role}): ${a.houses.join(", ")}`).join("\n")}>
                            <Houses list={r.agency.houses} />
                            <span className="ml-2 text-[11px] text-slate-500">via {r.agency.agents.map((a) => ABBR[a.planet]).join(", ")}</span>
                          </span>
                        ) : <span className="text-slate-700">·</span>}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <table className="w-full min-w-[640px] text-left text-sm" data-testid="sig-house-table">
            <thead className="bg-[#111827] text-[11px] uppercase tracking-wider text-slate-400">
              <tr><th className="px-3 py-2.5">{t("house")}</th>{HLEVELS.map(([k, d]) => <th key={k} className="px-3" title={d}>{k}</th>)}</tr>
            </thead>
            <tbody>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => {
                const r = sig.houses[String(h)];
                return (
                  <tr key={h} data-testid={`sig-house-row-${h}`} onClick={() => onSelect({ type: "cusp", id: h })}
                    className={`cursor-pointer border-t border-white/[0.04] ${selC === h ? "bg-amber-400/10" : "hover:bg-white/[0.03]"}`}>
                    <td className="font-data px-3 py-2 text-amber-100">{h}</td>
                    {["A", "B", "C", "D"].map((k) => <td key={k} className="px-3"><Planets list={r[k]} extra={agency ? r.agency?.[k] : null} onPick={(p) => onSelect({ type: "planet", id: p })} /></td>)}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      <div className="mt-3 grid gap-x-6 gap-y-1 text-xs text-slate-400 sm:grid-cols-2">
        {(mode === "planet" ? LEVELS : HLEVELS).map(([k, d]) => <div key={k}><span className="font-data mr-2 text-amber-300">{k}</span>{d}</div>)}
        <div className="text-slate-500 sm:col-span-2">{agency ? "Node agency: Rahu/Ketu act for their sign lord, planets conjoined within 3°20′ and planets aspecting their sign (7th; Mars 4/8, Jupiter 5/9, Saturn 3/10). Dashed chips (*) are added through agency." : "Node agency is off: Rahu/Ketu show only their own star-lord and occupation."} Results come only from the selected method.</div>
      </div>
    </div>
  );
};
