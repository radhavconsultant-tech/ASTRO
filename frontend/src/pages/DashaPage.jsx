import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Printer } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader, Reveal } from "@/components/common";
import { DashaTimeline } from "@/components/dasha/DashaTimeline";
import { CurrentPeriods } from "@/components/dasha/CurrentPeriods";
import { BhuktiList } from "@/components/dasha/BhuktiList";
import { findActive, fmt, ymd } from "@/components/dasha/dashaUtils";
import { useApp } from "@/context/AppContext";
import { useDasha } from "@/lib/hooks";
import { PLANET_COLOR } from "@/lib/kp";

export default function DashaPage() {
  const { active, t } = useApp();
  const [refDate, setRefDate] = useState(() => new Date());
  const [sel, setSel] = useState(null);
  const [openAd, setOpenAd] = useState(null);

  const q = useDasha(active);
  const d = q.data;

  const cur = useMemo(() => {
    const md = findActive(d?.mahadashas, refDate);
    const ad = findActive(md?.bhuktis, refDate);
    const an = findActive(ad?.antaras, refDate);
    return { md, ad, an, mdIndex: md ? d.mahadashas.indexOf(md) : 0, adIndex: ad ? md.bhuktis.indexOf(ad) : null };
  }, [d, refDate]);

  useEffect(() => { setSel(cur.mdIndex); setOpenAd(cur.adIndex); }, [cur.mdIndex, cur.adIndex]);

  if (!d) {
    return (
      <div className="px-4 pt-8 sm:px-6 lg:px-10">
        {q.isError ? <div className="panel p-8 text-slate-300" data-testid="dasha-error">The Dasha calculation could not be reached for this chart.</div>
          : <Skeleton className="h-[480px] w-full rounded-2xl bg-white/5" />}
      </div>
    );
  }

  const md = d.mahadashas[sel ?? cur.mdIndex];
  const onInput = (e) => { const x = new Date(`${e.target.value}T12:00:00`); if (!isNaN(x)) setRefDate(x); };

  return (
    <div className="space-y-8 px-4 pb-16 pt-8 sm:px-6 lg:px-10" data-testid="dasha-page">
      <PageHeader eyebrow={`${t("dasha")} · ${active.name}${active.sample ? ` · ${t("sample")}` : ""}`} title="Planetary periods"
        right={
          <div className="flex items-end gap-2">
            <label className="block">
              <span className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-slate-400">Reference date</span>
              <input type="date" value={format(refDate, "yyyy-MM-dd")} onChange={onInput} data-testid="dasha-ref-date"
                className="font-data focus-ring rounded-md border border-white/10 bg-[#0b0f19] px-2.5 py-1.5 text-sm text-cyan-200 [color-scheme:dark]" />
            </label>
            <button onClick={() => setRefDate(new Date())} data-testid="dasha-ref-today"
              className="focus-ring rounded-md border border-white/10 px-3 py-1.5 text-sm text-slate-300 hover:border-amber-400/50 hover:text-amber-100">Today</button>
            <Link to="/print/dasha" data-testid="dasha-print-link"
              className="focus-ring inline-flex items-center gap-1.5 rounded-md bg-amber-300 px-3 py-1.5 text-sm font-semibold text-[#0b0f19] hover:bg-amber-200">
              <Printer className="h-4 w-4" />{t("print")}
            </Link>
          </div>
        }>
        Vimshottari periods from the natal Moon in <span className="text-amber-100">{t(d.nakshatra)}</span> ({t(d.moon.sign)} <span className="font-data">{d.moon.dms}</span>).
        Balance at birth: <span style={{ color: PLANET_COLOR[d.balance.lord] }}>{t(d.balance.lord)}</span> <span className="font-data">{ymd(d.balance.years)}</span>.
      </PageHeader>

      <div className="font-data flex flex-wrap gap-x-5 gap-y-1 text-[12px] text-slate-400" data-testid="dasha-meta">
        <span>{d.system}</span><span>year = {d.year_days} days</span><span>birth UTC {fmt(d.birth_utc)}</span>
        <span>calc {d.calc_ms} ms</span><span>contract {d.contract}</span>
        <span className="text-slate-500">Sookshma &amp; Prana: unavailable in this milestone</span>
      </div>

      <Reveal><CurrentPeriods md={cur.md} ad={cur.ad} an={cur.an} refDate={refDate} /></Reveal>

      <Reveal className="panel p-4 sm:p-5">
        <div className="eyebrow mb-1">120-year Mahadasha timeline</div>
        <p className="mb-2 text-xs text-slate-400">Click a period to open its Bhuktis. The cyan line marks the reference date.</p>
        <DashaTimeline dasha={d} refDate={refDate} selected={sel} onSelect={(i) => { setSel(i); setOpenAd(null); }} />
      </Reveal>

      {md && <BhuktiList md={md} mdIndex={sel ?? cur.mdIndex} refDate={refDate} openAd={openAd} setOpenAd={setOpenAd} />}

      <p className="text-xs text-slate-500">House numbers beside each lord are its cusp-based significations (L1–L4) from the Chart Explorer. No interpretations are shown in this milestone.</p>
    </div>
  );
}
