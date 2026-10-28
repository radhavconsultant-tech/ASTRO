import { useEffect, useState } from "react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Camera, Radio, Trash2, Loader2 } from "lucide-react";
import { PageHeader, Reveal } from "@/components/common";
import { CitySearch } from "@/pages/NewChartPage";
import { useApp } from "@/context/AppContext";
import { fetchRuling } from "@/lib/api";
import { PLANET_COLOR } from "@/lib/kp";

const loadSnaps = () => { try { return JSON.parse(localStorage.getItem("kp.rpSnapshots") || "[]"); } catch { return []; } };

const natalKeys = (chart) => {
  if (!chart) return {};
  const asc = chart.cusps[0];
  const moon = chart.planets.find((p) => p.name === "Moon");
  return { "Asc sign lord": asc.sign_lord, "Asc star lord": asc.star_lord, "Asc sub lord": asc.sub_lord, "Moon star lord": moon.star_lord, "Moon sub lord": moon.sub_lord };
};

const Chip = ({ p, hit }) => {
  const { t } = useApp();
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-xs ${hit ? "border-amber-300/70 bg-amber-400/15" : "border-white/10"}`} style={{ color: PLANET_COLOR[p] }}>{t(p)}</span>
  );
};

const Snapshots = ({ snaps, setSnaps }) => {
  const { chartData, active } = useApp();
  const natal = natalKeys(chartData);
  const natalSet = new Set(Object.values(natal));
  return (
    <div className="panel p-5" data-testid="rp-snapshots">
      <div className="eyebrow">Saved snapshots</div>
      <p className="mt-1 text-xs text-slate-400">Compared with <span className="text-slate-200">{active.name}</span>: {Object.entries(natal).map(([k, v]) => `${k} ${v}`).join(" · ") || "—"}</p>
      {!snaps.length && <p className="mt-4 text-sm text-slate-400">No snapshots yet. Take one while you check a birth time.</p>}
      <ul className="mt-3 divide-y divide-white/5">
        {snaps.map((s) => {
          const hits = s.unique.filter((p) => natalSet.has(p));
          return (
            <li key={s.id} className="py-3" data-testid={`rp-snapshot-${s.id}`}>
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="font-data text-sm text-slate-100">{s.local.slice(0, 16).replace("T", " ")}</div>
                  <div className="truncate text-[11px] text-slate-400">{s.place}</div>
                  <div className="mt-2 flex flex-wrap gap-1.5">{s.unique.map((p) => <Chip key={p} p={p} hit={natalSet.has(p)} />)}</div>
                </div>
                <div className="text-right">
                  <div className="font-data text-lg text-amber-200" data-testid={`rp-snapshot-hits-${s.id}`}>{hits.length}/{s.unique.length}</div>
                  <div className="text-[10px] text-slate-500">match natal</div>
                  <button onClick={() => setSnaps(snaps.filter((x) => x.id !== s.id))} aria-label="Delete snapshot" data-testid={`rp-snapshot-delete-${s.id}`}
                    className="focus-ring mt-1 rounded p-1 text-slate-500 hover:text-red-300"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default function RulingPage() {
  const { active, t } = useApp();
  const fromChart = active.tz ? { name: active.place, lat: Number(active.latitude), lon: Number(active.longitude), tz: active.tz } : null;
  const [city, setCity] = useState(fromChart || { name: "Hyderabad, Telangana, India", lat: 17.385, lon: 78.4867, tz: "Asia/Kolkata" });
  const [live, setLive] = useState(true);
  const [custom, setCustom] = useState(() => format(new Date(), "yyyy-MM-dd'T'HH:mm"));
  const [snaps, setSnapsRaw] = useState(loadSnaps);
  const setSnaps = (s) => { setSnapsRaw(s); localStorage.setItem("kp.rpSnapshots", JSON.stringify(s)); };

  const utc = live ? null : new Date(custom).toISOString();
  const q = useQuery({
    queryKey: ["ruling", city?.lat, city?.lon, city?.tz, utc],
    queryFn: () => fetchRuling({ latitude: city.lat, longitude: city.lon, tz: city.tz, ...(utc ? { utc } : {}) }),
    enabled: !!city, refetchInterval: live ? 30000 : false, placeholderData: (p) => p,
  });
  const d = q.data;

  useEffect(() => { if (!live) return; setCustom(format(new Date(), "yyyy-MM-dd'T'HH:mm")); }, [live, d]);

  const snap = () => {
    if (!d) return;
    setSnaps([{ id: `s${Date.now().toString(36)}`, utc: d.utc, local: d.local, place: city.name, unique: [...d.unique, ...(d.node_agents || []).map((n) => n.node)], ruling: d.ruling }, ...snaps]);
    toast.success("Snapshot saved");
  };

  return (
    <div className="space-y-8 px-4 pb-16 pt-8 sm:px-6 lg:px-10" data-testid="ruling-page">
      <PageHeader eyebrow={t("ruling")} title="Ruling planets">
        The planets ruling this moment and place: day lord, plus the sign, star and sub lords of the Ascendant and the Moon.
      </PageHeader>

      <div className="panel flex flex-wrap items-end gap-4 p-4 sm:p-5">
        <div className="w-full sm:w-80">
          <div className="mb-1.5 text-xs text-slate-300">{t("place")}</div>
          <CitySearch city={city} setCity={(c) => c && setCity({ name: `${c.name}, ${c.region}`, lat: c.lat, lon: c.lon, tz: c.tz })} />
          <div className="font-data mt-1 truncate text-[11px] text-slate-500" data-testid="rp-place">{city.name} · {city.tz}</div>
        </div>
        <div className="flex rounded-full border border-white/10 p-0.5 text-xs" role="group" aria-label="Moment">
          <button onClick={() => setLive(true)} aria-pressed={live} data-testid="rp-mode-live"
            className={`focus-ring flex items-center gap-1.5 rounded-full px-3 py-1.5 ${live ? "bg-emerald-400/15 text-emerald-200" : "text-slate-400"}`}><Radio className="h-3.5 w-3.5" />{t("live")}</button>
          <button onClick={() => setLive(false)} aria-pressed={!live} data-testid="rp-mode-custom"
            className={`focus-ring rounded-full px-3 py-1.5 ${!live ? "bg-cyan-400/15 text-cyan-200" : "text-slate-400"}`}>Custom time</button>
        </div>
        <input type="datetime-local" value={custom} disabled={live} onChange={(e) => setCustom(e.target.value)} data-testid="rp-datetime"
          className="font-data focus-ring rounded-md border border-white/10 bg-[#0b0f19] px-2.5 py-1.5 text-sm text-cyan-200 disabled:opacity-50 [color-scheme:dark]" />
        <span className="text-[11px] text-slate-500">Custom time is in your device's time zone.</span>
        <button onClick={snap} disabled={!d} data-testid="rp-snapshot-button"
          className="focus-ring ml-auto inline-flex items-center gap-2 rounded-full bg-amber-300 px-5 py-2.5 text-sm font-semibold text-[#0b0f19] transition-transform hover:scale-[1.03] disabled:opacity-50">
          <Camera className="h-4 w-4" />{t("snapshot")}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Reveal className="lg:col-span-7">
          <div className="panel p-5 sm:p-6" data-testid="rp-current">
            <div className="flex items-center justify-between">
              <div className="eyebrow">{live ? "Now" : "At selected time"}</div>
              {q.isFetching && <Loader2 className="h-4 w-4 animate-spin text-cyan-300" />}
            </div>
            {d ? (
              <>
                <div className="font-data mt-1 text-sm text-slate-300">{d.local.slice(0, 16).replace("T", " ")} · {d.weekday}{d.before_sunrise ? " (before sunrise)" : ""} · sunrise {d.sunrise_local ? d.sunrise_local.slice(11, 16) : "—"}</div>
                <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2" data-testid="rp-unique">
                  {d.unique.map((p, i) => (
                    <span key={p} className="font-display text-4xl font-semibold" style={{ color: PLANET_COLOR[p] }}>{t(p)}{i < d.unique.length - 1 && <span className="ml-6 text-slate-700">·</span>}</span>
                  ))}
                </div>
                {d.node_agents?.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-3" data-testid="rp-node-agents">
                    {d.node_agents.map((n) => (
                      <div key={n.node} className="rounded-lg border border-dashed border-cyan-400/40 px-3 py-2">
                        <span className="font-display text-2xl font-semibold" style={{ color: PLANET_COLOR[n.node] }}>{t(n.node)}</span>
                        <span className="ml-2 text-xs text-slate-400">{n.reasons.join(" · ")}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-6 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.06] sm:grid-cols-2">
                  {d.ruling.map((r) => (
                    <div key={r.key} className="flex items-center justify-between bg-[#0f1524] px-4 py-3" data-testid={`rp-row-${r.key}`}>
                      <span className="text-xs text-slate-400">{r.role}</span>
                      <span className="text-sm font-medium" style={{ color: PLANET_COLOR[r.planet] }}>{t(r.planet)}</span>
                    </div>
                  ))}
                </div>
                <div className="font-data mt-4 flex flex-wrap gap-x-5 text-[12px] text-slate-400">
                  <span>{t("ascendant")} {t(d.ascendant.sign)} {d.ascendant.dms}</span>
                  <span>{t("Moon")} {t(d.moon.sign)} {d.moon.dms} · {t(d.moon.nakshatra)}</span>
                  <span>calc {d.calc_ms} ms</span>
                </div>
                <p className="mt-3 text-[11px] text-slate-500">{d.notes.join(" ")}</p>
              </>
            ) : <div className="mt-6 text-sm text-slate-400">{q.isError ? "Ruling planets could not be calculated." : "Calculating…"}</div>}
          </div>
        </Reveal>
        <div className="lg:col-span-5"><Snapshots snaps={snaps} setSnaps={setSnaps} /></div>
      </div>
    </div>
  );
}
