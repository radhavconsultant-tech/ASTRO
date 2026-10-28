import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Printer } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useDasha } from "@/lib/hooks";
import { fmt, ymd } from "@/components/dasha/dashaUtils";
import { LogoMark } from "@/components/shell/Logo";

export default function DashaPrint() {
  const { active, chartData, t, lang, setLang } = useApp();
  const q = useDasha(active);
  const d = q.data;
  useEffect(() => {
    document.body.classList.add("print-sheet");
    return () => document.body.classList.remove("print-sheet");
  }, []);

  return (
    <div className="min-h-screen bg-[#e9e4da] py-6 print:bg-white print:py-0" data-testid="dasha-print-page">
      <div className="mx-auto mb-4 flex max-w-[210mm] flex-wrap items-center gap-3 px-4 print:hidden">
        <Link to="/dasha" className="focus-ring inline-flex items-center gap-1.5 text-sm text-stone-700 hover:text-stone-950" data-testid="print-back"><ArrowLeft className="h-4 w-4" />Back</Link>
        <div className="ml-auto flex rounded-lg border border-stone-400/60 p-0.5 text-xs">
          {[["en", "EN"], ["te", "తెలుగు"]].map(([k, l]) => (
            <button key={k} onClick={() => setLang(k)} data-testid={`print-lang-${k}`} aria-pressed={lang === k}
              className={`rounded-md px-3 py-1 ${lang === k ? "bg-stone-900 text-amber-100" : "text-stone-700"}`}>{l}</button>
          ))}
        </div>
        <button onClick={() => window.print()} disabled={!d} data-testid="print-button"
          className="focus-ring inline-flex items-center gap-2 rounded-full bg-stone-900 px-5 py-2 text-sm font-semibold text-amber-100 disabled:opacity-50">
          <Printer className="h-4 w-4" />{t("print")}
        </button>
      </div>

      <article className="mx-auto w-full max-w-[210mm] bg-[#fbf8f2] px-[12mm] py-[10mm] text-stone-900 shadow-xl print:max-w-none print:shadow-none" data-testid="dasha-sheet">
        <header className="flex items-start justify-between gap-6 border-b-2 border-stone-900 pb-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-amber-800">KP Insight</div>
            <h1 className="font-display text-3xl font-bold leading-tight">{t("dashaSheet")}</h1>
            <div className="mt-1 text-sm font-semibold">{active.name}{active.sample ? ` · ${t("sample")}` : ""}</div>
          </div>
          <div className="flex items-start gap-3 text-right text-[11px] leading-relaxed">
            <div>
              <div className="font-semibold uppercase tracking-wider text-stone-500">{t("birthDetails")}</div>
              <div className="font-data">{active.date} · {active.time}</div>
              <div>{active.place}</div>
              {chartData && <div>{t("ascendant")} {t(chartData.cusps[0].sign)} <span className="font-data">{chartData.cusps[0].dms}</span></div>}
            </div>
            <LogoMark className="h-10 w-10" />
          </div>
        </header>

        {!d ? <p className="py-10 text-center text-sm text-stone-500">{q.isError ? "Dasha could not be calculated." : "Calculating…"}</p> : (
          <>
            <div className="mt-3 flex flex-wrap gap-x-6 text-[11px] text-stone-700">
              <span>{t("Moon")}: {t(d.moon.sign)} {d.moon.dms} · {t(d.nakshatra)}</span>
              <span>{t("balanceAtBirth")}: {t(d.balance.lord)} {ymd(d.balance.years)}</span>
              <span>KP ayanamsa · year {d.year_days} d</span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-x-4 gap-y-3">
              {d.mahadashas.slice(0, 9).map((m) => (
                <section key={m.start} className="break-inside-avoid rounded border border-stone-300 p-2" data-testid={`sheet-md-${m.lord.toLowerCase()}`}>
                  <div className="flex items-baseline justify-between border-b border-stone-300 pb-1">
                    <span className="font-display text-base font-bold">{t(m.lord)} <span className="text-[10px] font-normal text-stone-500">{t("mahadasha")}</span></span>
                    <span className="font-data text-[9px] text-stone-600">{fmt(m.start).slice(3)}–{fmt(m.end).slice(3)}</span>
                  </div>
                  <table className="mt-1 w-full text-[9.5px] leading-[1.45]">
                    <tbody>
                      {m.bhuktis.map((b) => (
                        <tr key={b.start}>
                          <td className="pr-1">{t(b.lord)}</td>
                          <td className="font-data text-right text-stone-700">{fmt(b.start)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              ))}
            </div>
            <footer className="mt-4 flex justify-between border-t border-stone-300 pt-2 text-[9px] text-stone-500">
              <span>{t("bhukti")}: {t("start")} · Vimshottari · Swiss Ephemeris (Moshier), KP ayanamsa</span>
              <span>Generated {new Date().toISOString().slice(0, 10)} · No interpretations included</span>
            </footer>
          </>
        )}
      </article>
    </div>
  );
}
