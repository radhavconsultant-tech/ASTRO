import { format, addHours, addDays, addMonths } from "date-fns";
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Sparkle, Loader2 } from "lucide-react";
import { useApp } from "@/context/AppContext";

const STEPS = { hour: (d, n) => addHours(d, n), day: (d, n) => addDays(d, n), month: (d, n) => addMonths(d, n) };
export const stepDate = (d, unit, n) => STEPS[unit](d, n);

const Btn = ({ children, testId, onClick, label, active }) => (
  <button data-testid={testId} onClick={onClick} aria-label={label} title={label}
    className={`focus-ring flex h-9 w-9 items-center justify-center rounded-full border transition-colors duration-200 ${active ? "border-amber-300/70 bg-amber-400/15 text-amber-100" : "border-white/10 text-slate-300 hover:border-amber-400/50 hover:text-amber-100"}`}>
    {children}
  </button>
);

export const TimePanel = ({ dt, setDt, playing, setPlaying, step, setStep, sky, loading, error, natalUtc }) => {
  const { t } = useApp();
  const onInput = (e) => {
    const d = new Date(e.target.value);
    if (!isNaN(d)) { setPlaying(false); setDt(d); }
  };
  return (
    <div className="panel p-4 sm:p-5" data-testid="time-panel">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0">
          <div className="eyebrow">{t("selectedDate")}</div>
          <input type="datetime-local" data-testid="time-panel-datetime" value={format(dt, "yyyy-MM-dd'T'HH:mm")} onChange={onInput}
            className="font-data focus-ring mt-1 rounded-md border border-white/10 bg-[#0b0f19] px-2.5 py-1.5 text-sm text-cyan-200 [color-scheme:dark]" />
        </div>
        <div className="flex items-center gap-1.5 sm:ml-2">
          <Btn testId="time-step-back" label="Step back" onClick={() => { setPlaying(false); setDt(stepDate(dt, step, -1)); }}><ChevronLeft className="h-4 w-4" /></Btn>
          <button data-testid="time-play-toggle" onClick={() => setPlaying(!playing)}
            className="focus-ring flex h-11 items-center gap-2 rounded-full bg-amber-300 px-5 text-sm font-semibold text-[#0b0f19] transition-transform duration-200 hover:scale-[1.03] active:scale-95">
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}{playing ? t("pause") : t("play")}
          </button>
          <Btn testId="time-step-forward" label="Step forward" onClick={() => { setPlaying(false); setDt(stepDate(dt, step, 1)); }}><ChevronRight className="h-4 w-4" /></Btn>
          <Btn testId="time-reset" label="Reset to now" onClick={() => { setPlaying(false); setDt(new Date()); }}><RotateCcw className="h-4 w-4" /></Btn>
          {natalUtc && (
            <Btn testId="time-natal" label="Jump to natal moment" onClick={() => { setPlaying(false); setDt(new Date(natalUtc)); }}><Sparkle className="h-4 w-4" /></Btn>
          )}
        </div>
        <div className="flex rounded-full border border-white/10 p-0.5 text-xs" role="group" aria-label="Step size">
          {["hour", "day", "month"].map((u) => (
            <button key={u} data-testid={`time-step-${u}`} onClick={() => setStep(u)} aria-pressed={step === u}
              className={`focus-ring rounded-full px-3 py-1.5 transition-colors ${step === u ? "bg-cyan-400/15 text-cyan-200" : "text-slate-400 hover:text-white"}`}>
              {t(u)}
            </button>
          ))}
        </div>
      </div>
      <div className="font-data mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-white/5 pt-3 text-[12px] text-slate-400" data-testid="time-panel-status">
        <span>UTC {sky?.utc ? sky.utc.slice(0, 16).replace("T", " ") : "—"}</span>
        <span>calc {sky?.calc_ms ?? "—"} ms</span>
        <span className="flex items-center gap-1.5">
          {loading ? <Loader2 className="h-3 w-3 animate-spin text-cyan-300" /> : <span className={`h-1.5 w-1.5 rounded-full ${error ? "bg-red-400" : "bg-emerald-400"}`} />}
          {error ? "Ephemeris unreachable" : "Ephemeris (built-in) · KP ayanamsa"}
        </span>
        <span className="text-slate-500">Each step is calculated; motion between steps is only smoothed.</span>
      </div>
    </div>
  );
};
