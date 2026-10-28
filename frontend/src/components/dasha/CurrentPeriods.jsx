import { useApp } from "@/context/AppContext";
import { PLANET_COLOR } from "@/lib/kp";
import { fmt, progress, remaining } from "./dashaUtils";

export const Signifies = ({ lord }) => {
  const { chartData } = useApp();
  const s = chartData?.significators?.cusp_based?.planets?.[lord];
  if (!s) return null;
  const houses = [...new Set([...s.L1, ...s.L2, ...s.L3, ...s.L4])].sort((a, b) => a - b);
  return (
    <span className="font-data text-[11px] text-slate-400" title="Houses signified (cusp-based, L1–L4)">
      H {houses.join(" · ") || "—"}
    </span>
  );
};

const Level = ({ label, p, refDate, testId }) => {
  const { t } = useApp();
  if (!p) return null;
  const pr = progress(p, refDate);
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4" data-testid={testId}>
      <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">{label}</div>
      <div className="mt-1 flex items-baseline justify-between gap-2">
        <span className="font-display text-3xl font-semibold" style={{ color: PLANET_COLOR[p.lord] }} data-testid={`${testId}-lord`}>{t(p.lord)}</span>
        <Signifies lord={p.lord} />
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div className="h-full rounded-full" style={{ width: `${pr * 100}%`, background: PLANET_COLOR[p.lord] }} />
      </div>
      <div className="font-data mt-2 flex justify-between text-[11px] text-slate-400">
        <span>{fmt(p.start)}</span><span>{fmt(p.end)}</span>
      </div>
      <div className="font-data mt-1 text-[11px] text-cyan-200">{remaining(p, refDate)} left</div>
    </div>
  );
};

export const CurrentPeriods = ({ md, ad, an, refDate }) => (
  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3" data-testid="dasha-current">
    <Level label="Mahadasha" p={md} refDate={refDate} testId="current-md" />
    <Level label="Bhukti" p={ad} refDate={refDate} testId="current-ad" />
    <Level label="Antara" p={an} refDate={refDate} testId="current-an" />
  </div>
);
