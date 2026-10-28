import { MousePointerClick } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { ABBR, PLANET_COLOR } from "@/lib/kp";
import { CopyButton } from "./CopyButton";

const Field = ({ label, value, mono, copy, testId }) => (
  <div className="flex items-center justify-between gap-3 border-b border-white/[0.05] py-2">
    <span className="text-xs text-slate-400">{label}</span>
    <span className="flex items-center gap-1">
      <span className={`${mono ? "font-data text-cyan-200" : "text-slate-100"} text-sm`} data-testid={testId}>{value}</span>
      {copy && <CopyButton text={String(copy)} testId={`${testId}-copy`} />}
    </span>
  </div>
);

const LordChain = ({ p }) => {
  const { t } = useApp();
  return (
    <div className="mt-4 grid grid-cols-3 gap-2" data-testid="detail-lord-chain">
      {[["starLord", p.star_lord], ["subLord", p.sub_lord], ["subSubLord", p.sub_sub_lord]].map(([k, v], i) => (
        <div key={k} className={`rounded-lg border p-2.5 ${i === 1 ? "border-amber-300/50 bg-amber-400/[0.06]" : "border-white/10"}`}>
          <div className="text-[10px] uppercase tracking-wider text-slate-400">{t(k)}</div>
          <div className="mt-1 font-display text-xl font-semibold" style={{ color: PLANET_COLOR[v] }} data-testid={`detail-${k}`}>{t(v)}</div>
        </div>
      ))}
    </div>
  );
};

const Chips = ({ list, empty = "—" }) => (
  <span className="font-data text-cyan-200">{list?.length ? list.join(", ") : empty}</span>
);

export const DetailPanel = ({ data, selection, method }) => {
  const { t } = useApp();
  if (!selection) {
    return (
      <div className="panel flex h-full min-h-[280px] flex-col items-center justify-center p-6 text-center" data-testid="detail-panel-empty">
        <MousePointerClick className="h-6 w-6 text-amber-300/70" />
        <p className="mt-3 max-w-xs text-sm text-slate-300">Select a planet or a house on the wheel, or a row in the tables, to see its KP details here.</p>
      </div>
    );
  }
  const sig = data.significators[method];
  const methodLabel = method === "cusp_based" ? t("cuspBased") : t("wholeSign");

  if (selection.type === "planet") {
    const p = data.planets.find((x) => x.name === selection.id);
    if (!p) return null;
    const s = sig.planets[p.name];
    return (
      <div className="panel p-5" data-testid="detail-panel">
        <div className="eyebrow">{t("planet")}</div>
        <div className="mt-1 flex items-center gap-3">
          <h3 className="font-display text-4xl font-semibold" style={{ color: PLANET_COLOR[p.name] }} data-testid="detail-title">{t(p.name)}</h3>
          {p.retrograde && !["Rahu", "Ketu"].includes(p.name) && <span className="rounded bg-amber-400/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber-200">RETRO</span>}
          {!p.kp_core && <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-300">Outer · reference only</span>}
        </div>
        <LordChain p={p} />
        <div className="mt-4">
          <Field label={t("sign")} value={`${t(p.sign)} ${p.dms}`} mono copy={`${p.sign} ${p.dms}`} testId="detail-sign" />
          <Field label="Longitude" value={`${p.longitude.toFixed(4)}°`} mono copy={p.longitude.toFixed(4)} testId="detail-longitude" />
          <Field label={t("nakshatra")} value={`${t(p.nakshatra)} · pada ${p.pada}`} testId="detail-nakshatra" />
          <Field label={t("signLord")} value={t(p.sign_lord)} testId="detail-sign-lord" />
          <Field label={`${t("house")} (${methodLabel})`} value={method === "cusp_based" ? p.house : p.whole_sign_house} mono testId="detail-house" />
          <Field label="Daily motion" value={`${p.speed.toFixed(4)}°`} mono testId="detail-speed" />
        </div>
        {s && (
          <div className="mt-4 rounded-lg border border-white/[0.06] p-3" data-testid="detail-significations">
            <div className="text-[11px] uppercase tracking-wider text-slate-400">Signifies · {methodLabel}</div>
            <div className="mt-2 grid grid-cols-4 gap-2 text-center text-xs">
              {["L1", "L2", "L3", "L4"].map((k) => (
                <div key={k}><div className="font-data text-amber-300">{k}</div><Chips list={s[k]} /></div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  const c = data.cusps.find((x) => x.house === selection.id);
  if (!c) return null;
  const h = sig.houses[String(c.house)];
  const occ = data.planets.filter((p) => p.kp_core && (method === "cusp_based" ? p.house : p.whole_sign_house) === c.house);
  return (
    <div className="panel p-5" data-testid="detail-panel">
      <div className="eyebrow">Cusp</div>
      <h3 className="mt-1 font-display text-4xl font-semibold text-amber-100" data-testid="detail-title">{t("house")} {c.house}</h3>
      <LordChain p={c} />
      <div className="mt-4">
        <Field label={t("sign")} value={`${t(c.sign)} ${c.dms}`} mono copy={`${c.sign} ${c.dms}`} testId="detail-sign" />
        <Field label="Longitude" value={`${c.longitude.toFixed(4)}°`} mono copy={c.longitude.toFixed(4)} testId="detail-longitude" />
        <Field label={t("nakshatra")} value={`${t(c.nakshatra)} · pada ${c.pada}`} testId="detail-nakshatra" />
        <Field label={t("signLord")} value={t(c.sign_lord)} testId="detail-sign-lord" />
        <Field label={`Occupants (${methodLabel})`} value={occ.length ? occ.map((p) => ABBR[p.name]).join(", ") : "—"} mono testId="detail-occupants" />
      </div>
      {h && (
        <div className="mt-4 rounded-lg border border-white/[0.06] p-3" data-testid="detail-significations">
          <div className="text-[11px] uppercase tracking-wider text-slate-400">Significators · {methodLabel}</div>
          <div className="mt-2 grid grid-cols-4 gap-2 text-center text-xs">
            {["A", "B", "C", "D"].map((k) => (
              <div key={k}><div className="font-data text-amber-300">{k}</div><Chips list={h[k].map((p) => ABBR[p])} /></div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
