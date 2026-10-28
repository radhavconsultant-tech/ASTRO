import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Minus, Plus, Search } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { PageHeader, Reveal } from "@/components/common";
import { CitySearch } from "@/pages/NewChartPage";
import { useApp } from "@/context/AppContext";
import { fetchHorary, fetchHoraryTable } from "@/lib/api";
import { nowIn } from "@/lib/hooks";
import { PLANET_COLOR } from "@/lib/kp";

const inputCls = "focus-ring w-full rounded-lg border border-white/10 bg-[#0b0f19] px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 [color-scheme:dark]";

const Preview = ({ row }) => {
  const { t } = useApp();
  if (!row) return null;
  return (
    <div className="grid grid-cols-2 gap-3 rounded-xl border border-amber-500/20 bg-amber-400/[0.04] p-4 sm:grid-cols-4" data-testid="horary-preview">
      <div><div className="text-[10px] uppercase tracking-wider text-slate-400">{t("ascendant")}</div><div className="mt-1 text-sm text-slate-100">{t(row.sign)} <span className="font-data text-cyan-200">{row.start_dms}</span></div></div>
      <div><div className="text-[10px] uppercase tracking-wider text-slate-400">{t("nakshatra")}</div><div className="mt-1 text-sm text-slate-100">{t(row.nakshatra)}</div></div>
      <div><div className="text-[10px] uppercase tracking-wider text-slate-400">{t("starLord")}</div><div className="mt-1 text-sm" style={{ color: PLANET_COLOR[row.star_lord] }}>{t(row.star_lord)}</div></div>
      <div><div className="text-[10px] uppercase tracking-wider text-slate-400">{t("subLord")}</div><div className="mt-1 text-sm font-semibold" style={{ color: PLANET_COLOR[row.sub_lord] }}>{t(row.sub_lord)}</div></div>
    </div>
  );
};

const TableBrowser = ({ rows, number, setNumber }) => {
  const { t } = useApp();
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const n = q.trim().toLowerCase();
    return n ? rows.filter((r) => `${r.number} ${r.sign} ${r.nakshatra} ${r.star_lord} ${r.sub_lord}`.toLowerCase().includes(n)) : rows;
  }, [rows, q]);
  return (
    <div className="panel p-4" data-testid="horary-table">
      <div className="flex items-center justify-between gap-2">
        <div className="eyebrow">KP horary table · 249</div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter…" data-testid="horary-table-search"
            className="focus-ring w-36 rounded-md border border-white/10 bg-[#0b0f19] py-1.5 pl-8 pr-2 text-sm text-slate-200" />
        </div>
      </div>
      <div className="scroll-thin mt-3 max-h-[520px] overflow-auto">
        <table className="w-full text-left text-[13px]">
          <thead className="sticky top-0 bg-[#0f1524] text-[10px] uppercase tracking-wider text-slate-400">
            <tr><th className="py-2 pl-2">#</th><th>{t("sign")}</th><th>{t("degree")}</th><th>{t("starLord")}</th><th>{t("subLord")}</th></tr>
          </thead>
          <tbody>
            {list.map((r) => (
              <tr key={r.number} onClick={() => setNumber(r.number)} data-testid={`horary-table-row-${r.number}`}
                className={`cursor-pointer border-t border-white/[0.04] ${r.number === number ? "bg-amber-400/10" : "hover:bg-white/[0.03]"}`}>
                <td className="font-data py-1.5 pl-2 text-amber-200">{r.number}</td>
                <td className="text-slate-200">{t(r.sign)}</td>
                <td className="font-data text-cyan-200">{r.start_dms}</td>
                <td style={{ color: PLANET_COLOR[r.star_lord] }}>{t(r.star_lord)}</td>
                <td style={{ color: PLANET_COLOR[r.sub_lord] }}>{t(r.sub_lord)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default function HoraryPage() {
  const { t, active, addChart } = useApp();
  const nav = useNavigate();
  const table = useQuery({ queryKey: ["horary-table"], queryFn: fetchHoraryTable, staleTime: Infinity });
  const rows = table.data || [];
  const [number, setNumber] = useState(1);
  const [question, setQuestion] = useState("");
  const [useNow, setUseNow] = useState(true);
  const [moment, setMoment] = useState({ date: "", time: "" });
  const [city, setCity] = useState(active.tz && active.kind !== "horary"
    ? { name: active.place, lat: Number(active.latitude), lon: Number(active.longitude), tz: active.tz }
    : { name: "Hyderabad, Telangana, India", lat: 17.385, lon: 78.4867, tz: "Asia/Kolkata" });
  const [busy, setBusy] = useState(false);
  const clamp = (n) => Math.min(249, Math.max(1, Number(n) || 1));
  const row = rows[number - 1];

  const cast = async () => {
    const m = useNow ? nowIn(city.tz) : moment;
    if (!m.date || !m.time) return toast.error("Enter the question date and time");
    const chart = { id: `h${Date.now().toString(36)}`, kind: "horary", number, question: question.trim(), name: `Horary #${number}${question.trim() ? ` · ${question.trim().slice(0, 40)}` : ""}`,
      date: m.date, time: m.time, place: city.name, latitude: city.lat, longitude: city.lon, tz: city.tz };
    setBusy(true);
    try {
      await fetchHorary(chart);
      addChart(chart);
      toast.success(`Horary #${number} cast`, { description: "Opened in the Chart Explorer." });
      nav("/explorer");
    } catch (err) {
      toast.error("Could not cast this horary chart", { description: err?.response?.data?.detail?.toString?.() || err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-8 px-4 pb-16 pt-8 sm:px-6 lg:px-10" data-testid="horary-page">
      <PageHeader eyebrow={t("horary")} title="Cast a horary chart">
        The querent gives a number from 1 to 249. The Ascendant is fixed at the start of that sub; planets are taken at the moment of the question.
      </PageHeader>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Reveal className="lg:col-span-7">
          <div className="panel space-y-6 p-5 sm:p-7">
            <div>
              <div className="mb-2 text-xs font-medium text-slate-300">Number (1–249)</div>
              <div className="flex items-center gap-3">
                <button onClick={() => setNumber(clamp(number - 1))} className="focus-ring rounded-full border border-white/10 p-2.5 text-slate-300 hover:text-amber-200" aria-label="Previous number" data-testid="horary-number-dec"><Minus className="h-4 w-4" /></button>
                <input type="number" min={1} max={249} value={number} onChange={(e) => setNumber(clamp(e.target.value))} data-testid="horary-number-input"
                  className="font-data focus-ring w-28 rounded-xl border border-amber-400/30 bg-[#0b0f19] px-3 py-2 text-center text-3xl text-amber-100" />
                <button onClick={() => setNumber(clamp(number + 1))} className="focus-ring rounded-full border border-white/10 p-2.5 text-slate-300 hover:text-amber-200" aria-label="Next number" data-testid="horary-number-inc"><Plus className="h-4 w-4" /></button>
                <input type="range" min={1} max={249} value={number} onChange={(e) => setNumber(Number(e.target.value))} className="hidden flex-1 accent-amber-300 sm:block" aria-label="Horary number" data-testid="horary-number-slider" />
              </div>
            </div>
            <Preview row={row} />
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-slate-300">Question (optional)</span>
              <textarea value={question} onChange={(e) => setQuestion(e.target.value)} maxLength={200} rows={2} placeholder="e.g. Will I get the job I interviewed for?" className={inputCls} data-testid="horary-question-input" />
            </label>
            <div>
              <div className="mb-1.5 text-xs font-medium text-slate-300">{t("place")}</div>
              <CitySearch city={city} setCity={(c) => c && setCity({ name: `${c.name}, ${c.region}`, lat: c.lat, lon: c.lon, tz: c.tz })} />
              <div className="font-data mt-1 text-[11px] text-slate-500" data-testid="horary-place">{city.name} · {city.tz}</div>
            </div>
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <Switch checked={useNow} onCheckedChange={setUseNow} data-testid="horary-now-toggle" />Use the current moment
              </label>
              {!useNow && (
                <div className="grid grid-cols-2 gap-3">
                  <input type="date" value={moment.date} onChange={(e) => setMoment((m) => ({ ...m, date: e.target.value }))} className={inputCls} data-testid="horary-date-input" />
                  <input type="time" value={moment.time} onChange={(e) => setMoment((m) => ({ ...m, time: e.target.value }))} className={inputCls} data-testid="horary-time-input" />
                </div>
              )}
              <p className="text-[11px] text-slate-500">Date and time are local to the selected place.</p>
            </div>
            <button onClick={cast} disabled={busy || !row} data-testid="horary-cast-button"
              className="focus-ring inline-flex items-center gap-2 rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold text-[#0b0f19] transition-transform hover:scale-[1.02] disabled:opacity-60">
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}Cast and open in Explorer
            </button>
          </div>
        </Reveal>
        <div className="lg:col-span-5"><TableBrowser rows={rows} number={number} setNumber={setNumber} /></div>
      </div>
    </div>
  );
}
