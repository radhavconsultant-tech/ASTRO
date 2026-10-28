import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { MapPin, Loader2, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { PageHeader, Reveal } from "@/components/common";
import { useApp } from "@/context/AppContext";
import { fetchChart, searchCities } from "@/lib/api";

const inputCls = "focus-ring w-full rounded-lg border border-white/10 bg-[#0b0f19] px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 [color-scheme:dark]";
const Field = ({ label, children, hint }) => (
  <label className="block">
    <span className="mb-1.5 block text-xs font-medium text-slate-300">{label}</span>
    {children}
    {hint && <span className="mt-1 block text-[11px] text-slate-500">{hint}</span>}
  </label>
);

export const CitySearch = ({ city, setCity }) => {
  const [q, setQ] = useState(city ? city.name : "");
  const [res, setRes] = useState([]);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return undefined;
    const id = setTimeout(() => { searchCities(q).then(setRes).catch(() => setRes([])); }, 180);
    return () => clearTimeout(id);
  }, [q, open]);
  return (
    <div className="relative">
      <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-300/70" />
      <input value={q} data-testid="city-search-input" placeholder="Search city, e.g. Hyderabad"
        onChange={(e) => { setQ(e.target.value); setOpen(true); setCity(null); }} onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)} className={`${inputCls} pl-9`} />
      {open && res.length > 0 && (
        <ul className="glass scroll-thin absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-lg py-1" data-testid="city-search-results">
          {res.map((c) => (
            <li key={`${c.name}-${c.region}`}>
              <button type="button" data-testid={`city-option-${c.name.toLowerCase().replace(/[^a-z]+/g, "-")}`}
                onMouseDown={(e) => e.preventDefault()} onClick={() => { setCity(c); setQ(c.name); setOpen(false); }}
                className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-white/5">
                <span><span className="text-slate-100">{c.name}</span> <span className="text-xs text-slate-400">{c.region}</span></span>
                <span className="font-data text-[11px] text-slate-500">{c.tz}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const SavedList = () => {
  const { charts, removeChart, setActiveId, active } = useApp();
  const nav = useNavigate();
  return (
    <div className="panel p-5" data-testid="saved-charts-list">
      <div className="eyebrow">Saved in this browser</div>
      <ul className="mt-3 divide-y divide-white/5">
        {charts.map((c) => (
          <li key={c.id} className="flex items-center gap-3 py-2.5">
            <button onClick={() => { setActiveId(c.id); nav("/explorer"); }} data-testid={`saved-open-${c.id}`} className="focus-ring min-w-0 flex-1 text-left">
              <div className="truncate text-sm text-slate-100">{c.name}{c.sample && <span className="ml-2 rounded bg-amber-400/15 px-1.5 text-[10px] uppercase text-amber-200">sample</span>}{c.id === active.id && <span className="ml-2 text-[10px] text-cyan-300">active</span>}</div>
              <div className="font-data truncate text-[11px] text-slate-400">{c.date} {c.time} · {c.place}</div>
            </button>
            {!c.sample && (
              <button onClick={() => removeChart(c.id)} data-testid={`saved-delete-${c.id}`} aria-label={`Delete ${c.name}`}
                className="focus-ring rounded p-1.5 text-slate-500 hover:bg-red-500/10 hover:text-red-300"><Trash2 className="h-4 w-4" /></button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default function NewChartPage() {
  const { t, addChart } = useApp();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", date: "", time: "" });
  const [city, setCity] = useState(null);
  const [manual, setManual] = useState(false);
  const [m, setM] = useState({ place: "", latitude: "", longitude: "", tz: "", utc_offset: "5.5" });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setMan = (k) => (e) => setM((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.date || !form.time) return toast.error("Name, date and time are required");
    let place;
    if (manual) {
      if (m.latitude === "" || m.longitude === "") return toast.error("Enter latitude and longitude");
      place = { place: m.place || `${m.latitude}, ${m.longitude}`, latitude: Number(m.latitude), longitude: Number(m.longitude), ...(m.tz ? { tz: m.tz } : { utc_offset: Number(m.utc_offset) }) };
    } else {
      if (!city) return toast.error("Pick a city from the list, or switch to manual entry");
      place = { place: `${city.name}, ${city.region}`, latitude: city.lat, longitude: city.lon, tz: city.tz };
    }
    const chart = { id: `c${Date.now().toString(36)}`, name: form.name.trim(), date: form.date, time: form.time, ...place };
    setBusy(true);
    try {
      await fetchChart(chart);
      addChart(chart);
      toast.success("Chart saved", { description: `${chart.name} is now the active chart.` });
      nav("/explorer");
    } catch (err) {
      toast.error("Could not calculate this chart", { description: err?.response?.data?.detail?.toString?.() || err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="px-4 pb-16 pt-8 sm:px-6 lg:px-10" data-testid="new-chart-page">
      <PageHeader eyebrow="Birth data" title={t("createChart")}>
        Charts are calculated with the KP ayanamsa and Placidus cusps, and saved only in this browser.
      </PageHeader>
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Reveal className="lg:col-span-7">
          <form onSubmit={submit} className="panel space-y-5 p-5 sm:p-7" data-testid="new-chart-form">
            <Field label={t("name")}><input className={inputCls} value={form.name} onChange={set("name")} placeholder="Full name or label" data-testid="chart-name-input" maxLength={80} /></Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label={t("date")}><input type="date" className={inputCls} value={form.date} onChange={set("date")} data-testid="chart-date-input" min="1800-01-01" max="2399-12-31" /></Field>
              <Field label={`${t("time")} (local, 24h)`}><input type="time" className={inputCls} value={form.time} onChange={set("time")} data-testid="chart-time-input" /></Field>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-300">{t("place")}</span>
              <label className="flex items-center gap-2 text-xs text-slate-400">
                <Switch checked={manual} onCheckedChange={setManual} data-testid="manual-place-toggle" />Enter coordinates manually
              </label>
            </div>
            {!manual ? (
              <div>
                <CitySearch city={city} setCity={setCity} />
                {city && <p className="font-data mt-2 text-[12px] text-cyan-200" data-testid="city-selected">{city.lat.toFixed(4)}, {city.lon.toFixed(4)} · {city.tz}</p>}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Place label"><input className={inputCls} value={m.place} onChange={setMan("place")} placeholder="Village, district" data-testid="manual-place-input" /></Field>
                <Field label="Time zone (IANA)" hint="e.g. Asia/Kolkata. Leave blank to use the UTC offset."><input className={inputCls} value={m.tz} onChange={setMan("tz")} placeholder="Asia/Kolkata" data-testid="manual-tz-input" /></Field>
                <Field label="Latitude (N +, S −)"><input type="number" step="0.0001" className={inputCls} value={m.latitude} onChange={setMan("latitude")} data-testid="manual-lat-input" /></Field>
                <Field label="Longitude (E +, W −)"><input type="number" step="0.0001" className={inputCls} value={m.longitude} onChange={setMan("longitude")} data-testid="manual-lon-input" /></Field>
                {!m.tz && <Field label="UTC offset (hours)"><input type="number" step="0.25" className={inputCls} value={m.utc_offset} onChange={setMan("utc_offset")} data-testid="manual-offset-input" /></Field>}
              </div>
            )}
            <button type="submit" disabled={busy} data-testid="chart-save-button"
              className="focus-ring inline-flex items-center gap-2 rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold text-[#0b0f19] transition-transform hover:scale-[1.02] disabled:opacity-60">
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}{t("save")}
            </button>
          </form>
        </Reveal>
        <div className="lg:col-span-5"><SavedList /></div>
      </div>
    </div>
  );
}
