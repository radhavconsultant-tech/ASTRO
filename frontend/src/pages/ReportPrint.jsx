import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Printer } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useDasha } from "@/lib/hooks";
import { fmt, ymd, findActive } from "@/components/dasha/dashaUtils";
import { ChartWheel } from "@/components/chart/ChartWheel";
import { LogoMark } from "@/components/shell/Logo";
import { KP_PLANETS } from "@/lib/kp";

const Th = ({ children }) => <th className="border-b border-stone-400 px-1.5 py-1 text-left font-semibold">{children}</th>;
const Td = ({ children, mono }) => <td className={`border-b border-stone-200 px-1.5 py-[3px] ${mono ? "font-data" : ""}`}>{children}</td>;
const H2 = ({ children }) => <h2 className="mb-2 mt-5 border-b border-stone-900 pb-1 font-display text-lg font-bold">{children}</h2>;

const Page = ({ children, last }) => (
  <section className={`mx-auto mb-6 w-full max-w-[210mm] bg-[#fbf8f2] px-[12mm] py-[10mm] text-stone-900 shadow-xl print:mb-0 print:max-w-none print:shadow-none ${last ? "" : "break-after-page"}`}>
    {children}
  </section>
);

export default function ReportPrint() {
  const { active, chartData: c, t, lang, setLang } = useApp();
  const dq = useDasha(active);
  const d = dq.data;
  useEffect(() => {
    document.body.classList.add("print-sheet");
    return () => document.body.classList.remove("print-sheet");
  }, []);
  const now = new Date();
  const curMd = findActive(d?.mahadashas, now);
  const lords = (p) => `${t(p.star_lord)} / ${t(p.sub_lord)} / ${t(p.sub_sub_lord)}`;

  return (
    <div className="min-h-screen bg-[#e9e4da] py-6 print:bg-white print:py-0" data-testid="report-print-page">
      <div className="mx-auto mb-4 flex max-w-[210mm] flex-wrap items-center gap-3 px-4 print:hidden">
        <Link to="/explorer" className="focus-ring inline-flex items-center gap-1.5 text-sm text-stone-700 hover:text-stone-950" data-testid="report-back"><ArrowLeft className="h-4 w-4" />Back</Link>
        <div className="ml-auto flex rounded-lg border border-stone-400/60 p-0.5 text-xs">
          {[["en", "EN"], ["te", "తెలుగు"]].map(([k, l]) => (
            <button key={k} onClick={() => setLang(k)} data-testid={`report-lang-${k}`} aria-pressed={lang === k}
              className={`rounded-md px-3 py-1 ${lang === k ? "bg-stone-900 text-amber-100" : "text-stone-700"}`}>{l}</button>
          ))}
        </div>
        <button onClick={() => window.print()} disabled={!c} data-testid="report-print-button"
          className="focus-ring inline-flex items-center gap-2 rounded-full bg-stone-900 px-5 py-2 text-sm font-semibold text-amber-100 disabled:opacity-50">
          <Printer className="h-4 w-4" />{t("print")}
        </button>
      </div>

      {!c ? <p className="py-20 text-center text-stone-600">Calculating chart…</p> : (
        <>
          <Page>
            <header className="flex items-start justify-between gap-6 border-b-2 border-stone-900 pb-3">
              <div>
                <div className="text-[10px] uppercase tracking-[0.25em] text-amber-800">KP Insight · {c.horary ? `${t("horary")} #${c.horary.number}` : "Chart report"}</div>
                <h1 className="font-display text-3xl font-bold leading-tight" data-testid="report-title">{active.name}</h1>
                <div className="mt-1 text-[11px]">{active.date} · {active.time} · {active.place}</div>
                {active.question && <div className="mt-1 text-[11px] italic">“{active.question}”</div>}
              </div>
              <div className="flex items-start gap-3 text-right text-[10px] leading-relaxed">
                <div>
                  <div>KP ayanamsa <span className="font-data">{c.meta.ayanamsa_value.toFixed(4)}°</span></div>
                  <div>Placidus · mean node</div>
                  <div>UTC <span className="font-data">{c.meta.utc.slice(0, 16).replace("T", " ")}</span></div>
                </div>
                <LogoMark className="h-10 w-10" />
              </div>
            </header>
            <div className="mt-4 grid grid-cols-[1fr_200px] gap-5">
              <div className="rounded-xl bg-[#0b0f19] p-2"><ChartWheel data={c} compact showOuter={false} /></div>
              <div className="space-y-3 text-[11px]">
                {[["ascendant", c.cusps[0]], ["Moon", c.planets.find((p) => p.name === "Moon")], ["Sun", c.planets.find((p) => p.name === "Sun")]].map(([k, p]) => (
                  <div key={k} className="border-l-2 border-amber-700 pl-2">
                    <div className="text-[9px] uppercase tracking-widest text-stone-500">{t(k)}</div>
                    <div className="font-display text-base font-bold">{t(p.sign)} <span className="font-data text-xs font-normal">{p.dms}</span></div>
                    <div>{t(p.nakshatra)} · {lords(p)}</div>
                  </div>
                ))}
                {d && (
                  <div className="border-l-2 border-amber-700 pl-2">
                    <div className="text-[9px] uppercase tracking-widest text-stone-500">{t("balanceAtBirth")}</div>
                    <div className="font-display text-base font-bold">{t(d.balance.lord)} <span className="font-data text-xs font-normal">{ymd(d.balance.years)}</span></div>
                  </div>
                )}
              </div>
            </div>
            <H2>{t("planets")}</H2>
            <table className="w-full text-[10px]" data-testid="report-planets">
              <thead><tr><Th>{t("planet")}</Th><Th>{t("sign")}</Th><Th>{t("degree")}</Th><Th>{t("nakshatra")}</Th><Th>{t("starLord")}</Th><Th>{t("subLord")}</Th><Th>{t("subSubLord")}</Th><Th>{t("house")}</Th></tr></thead>
              <tbody>
                {c.planets.filter((p) => p.kp_core).map((p) => (
                  <tr key={p.name}><Td>{t(p.name)}{p.retrograde && !["Rahu", "Ketu"].includes(p.name) ? " (R)" : ""}</Td><Td>{t(p.sign)}</Td><Td mono>{p.dms}</Td><Td>{t(p.nakshatra)} {p.pada}</Td><Td>{t(p.star_lord)}</Td><Td>{t(p.sub_lord)}</Td><Td>{t(p.sub_sub_lord)}</Td><Td mono>{p.house}</Td></tr>
                ))}
              </tbody>
            </table>
          </Page>

          <Page>
            <H2>{t("cusps")}</H2>
            <table className="w-full text-[10px]" data-testid="report-cusps">
              <thead><tr><Th>{t("house")}</Th><Th>{t("sign")}</Th><Th>{t("degree")}</Th><Th>{t("nakshatra")}</Th><Th>{t("signLord")}</Th><Th>{t("starLord")}</Th><Th>{t("subLord")}</Th><Th>{t("subSubLord")}</Th></tr></thead>
              <tbody>
                {c.cusps.map((p) => (
                  <tr key={p.house}><Td mono>{p.house}</Td><Td>{t(p.sign)}</Td><Td mono>{p.dms}</Td><Td>{t(p.nakshatra)} {p.pada}</Td><Td>{t(p.sign_lord)}</Td><Td>{t(p.star_lord)}</Td><Td>{t(p.sub_lord)}</Td><Td>{t(p.sub_sub_lord)}</Td></tr>
                ))}
              </tbody>
            </table>
            <H2>{t("significators")} · {t("cuspBased")} · {t("byPlanet")}</H2>
            <table className="w-full text-[10px]" data-testid="report-sig-planets">
              <thead><tr><Th>{t("planet")}</Th><Th>L1</Th><Th>L2</Th><Th>L3</Th><Th>L4</Th><Th>Node agency</Th></tr></thead>
              <tbody>
                {KP_PLANETS.map((n) => {
                  const r = c.significators.cusp_based.planets[n];
                  return <tr key={n}><Td>{t(n)}</Td><Td mono>{r.L1.join(", ")}</Td><Td mono>{r.L2.join(", ")}</Td><Td mono>{r.L3.join(", ") || "—"}</Td><Td mono>{r.L4.join(", ") || "—"}</Td><Td>{r.agency ? `${r.agency.houses.join(", ")} (${r.agency.agents.map((a) => t(a.planet)).join(", ")})` : ""}</Td></tr>;
                })}
              </tbody>
            </table>
            <H2>{t("significators")} · {t("cuspBased")} · {t("byHouse")}</H2>
            <table className="w-full text-[10px]" data-testid="report-sig-houses">
              <thead><tr><Th>{t("house")}</Th><Th>A</Th><Th>B</Th><Th>C</Th><Th>D</Th></tr></thead>
              <tbody>
                {Array.from({ length: 12 }, (_, i) => String(i + 1)).map((h) => {
                  const r = c.significators.cusp_based.houses[h];
                  const cell = (k) => [...r[k].map(t), ...(r.agency?.[k] || []).map((p) => `${t(p)}*`)].join(", ") || "—";
                  return <tr key={h}><Td mono>{h}</Td><Td>{cell("A")}</Td><Td>{cell("B")}</Td><Td>{cell("C")}</Td><Td>{cell("D")}</Td></tr>;
                })}
              </tbody>
            </table>
            <p className="mt-2 text-[9px] text-stone-500">L1 houses occupied by star-lord · L2 occupied · L3 owned by star-lord · L4 owned. A star of occupants · B occupants · C star of owner · D owner. * added through Rahu/Ketu agency.</p>
          </Page>

          <Page last>
            <H2>{t("dasha")}</H2>
            {!d ? <p className="text-sm text-stone-500">Calculating…</p> : (
              <>
                <div className="text-[11px]">{t("Moon")}: {t(d.moon.sign)} <span className="font-data">{d.moon.dms}</span> · {t(d.nakshatra)} · {t("balanceAtBirth")}: {t(d.balance.lord)} <span className="font-data">{ymd(d.balance.years)}</span></div>
                <table className="mt-3 w-full text-[10px]" data-testid="report-dasha">
                  <thead><tr><Th>{t("mahadasha")}</Th><Th>{t("start")}</Th><Th>{t("end")}</Th><Th>Years</Th></tr></thead>
                  <tbody>
                    {d.mahadashas.slice(0, 9).map((m) => (
                      <tr key={m.start} className={curMd === m ? "bg-amber-100" : ""}><Td>{t(m.lord)}{curMd === m ? " ◂ now" : ""}</Td><Td mono>{fmt(m.start)}</Td><Td mono>{fmt(m.end)}</Td><Td mono>{m.years}</Td></tr>
                    ))}
                  </tbody>
                </table>
                {curMd && (
                  <>
                    <H2>{t(curMd.lord)} {t("mahadasha")} · {t("bhukti")}</H2>
                    <table className="w-full text-[10px]">
                      <thead><tr><Th>{t("bhukti")}</Th><Th>{t("start")}</Th><Th>{t("end")}</Th></tr></thead>
                      <tbody>
                        {curMd.bhuktis.map((b) => <tr key={b.start}><Td>{t(b.lord)}</Td><Td mono>{fmt(b.start)}</Td><Td mono>{fmt(b.end)}</Td></tr>)}
                      </tbody>
                    </table>
                  </>
                )}
              </>
            )}
            <footer className="mt-6 flex justify-between border-t border-stone-300 pt-2 text-[9px] text-stone-500">
              <span>Swiss Ephemeris (Moshier) · KP ayanamsa · Placidus · Vimshottari, year 365.25 d</span>
              <span>Generated {now.toISOString().slice(0, 10)} · No interpretations included</span>
            </footer>
          </Page>
        </>
      )}
    </div>
  );
}
