import { useState } from "react";
import { Link } from "react-router-dom";
import { Printer } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartWheel } from "@/components/chart/ChartWheel";
import { PlanetTable, CuspTable } from "@/components/chart/Tables";
import { SignificatorView } from "@/components/chart/SignificatorView";
import { DetailPanel } from "@/components/chart/DetailPanel";
import { HoraryAnalysis } from "@/components/chart/HoraryAnalysis";
import { PageHeader, Reveal } from "@/components/common";
import { useApp } from "@/context/AppContext";

const Meta = ({ data }) => (
  <div className="font-data flex flex-wrap gap-x-5 gap-y-1 text-[12px] text-slate-400" data-testid="explorer-meta">
    <span>Ayanamsa {data.source?.ayanamsa} {data.meta.ayanamsa_value.toFixed(4)}°</span>
    <span>{data.source?.house_system} cusps</span>
    <span>{data.source?.node}</span>
    <span>UTC {data.meta.utc.slice(0, 16).replace("T", " ")}</span>
    <span>calc {data.meta.calc_ms} ms</span>
    <span>contract {data.contract}</span>
  </div>
);

export default function ExplorerPage() {
  const { chartData, chartLoading, active, t, dataSource } = useApp();
  const [selection, setSelection] = useState({ type: "cusp", id: 1 });
  const [method, setMethod] = useState("cusp_based");
  const [mode, setMode] = useState("planet");
  const [tab, setTab] = useState("planets");
  const [showOuter, setShowOuter] = useState(false);
  const [agency, setAgency] = useState(true);

  const onSelect = (s) => {
    setSelection(s);
    if (tab !== "significators") setTab(s.type === "cusp" ? "cusps" : "planets");
  };

  if (!chartData) {
    return (
      <div className="space-y-6 px-4 pt-8 sm:px-6 lg:px-10">
        {chartLoading ? <Skeleton className="h-[520px] w-full rounded-2xl bg-white/5" /> : (
          <div className="panel p-8 text-slate-300" data-testid="explorer-error">
            The calculation service could not be reached for this chart. <Link to="/" className="text-amber-200 underline">Return to the dashboard</Link>.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8 px-4 pb-16 pt-8 sm:px-6 lg:px-10" data-testid="explorer-page">
      <PageHeader eyebrow={`${active.kind === "horary" ? t("horary") : t("explorer")}${active.sample ? ` · ${t("sample")}` : ""}${dataSource === "fixture" ? " · Demo fixture" : ""}`} title={active.name}
        right={<Link to="/print/report" data-testid="explorer-print-report" className="focus-ring inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-amber-400/40 px-4 py-2 text-sm text-amber-100 hover:bg-amber-400/10"><Printer className="h-4 w-4" />Chart report</Link>}>
        <span className="font-data text-sm text-slate-400">{active.date} · {active.time} · {active.place} ({Number(active.latitude).toFixed(3)}, {Number(active.longitude).toFixed(3)})</span>
        {chartData.horary && (
          <div className="mt-3 rounded-lg border border-cyan-400/20 bg-cyan-400/[0.04] px-3 py-2 text-sm text-slate-300" data-testid="explorer-horary-banner">
            Horary <span className="font-data text-amber-200">#{chartData.horary.number}</span> · Ascendant fixed at {t(chartData.horary.sign)} <span className="font-data">{chartData.horary.start_dms}</span> · star {t(chartData.horary.star_lord)} · sub {t(chartData.horary.sub_lord)}
            {active.question && <div className="mt-1 italic text-slate-400">“{active.question}”</div>}
          </div>
        )}
      </PageHeader>
      <Meta data={chartData} />
      {chartData.horary && <HoraryAnalysis chart={chartData} onSelect={onSelect} />}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Reveal className="panel p-3 sm:p-5 lg:col-span-7">
          <ChartWheel data={chartData} selection={selection} onSelect={onSelect} showOuter={showOuter} />
        </Reveal>
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-20">
            <DetailPanel data={chartData} selection={selection} method={method} agency={agency} />
          </div>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="panel p-4 sm:p-5">
        <TabsList className="mb-4 bg-white/[0.04]">
          <TabsTrigger value="planets" data-testid="tab-planets">{t("planets")}</TabsTrigger>
          <TabsTrigger value="cusps" data-testid="tab-cusps">{t("cusps")}</TabsTrigger>
          <TabsTrigger value="significators" data-testid="tab-significators">{t("significators")}</TabsTrigger>
        </TabsList>
        <TabsContent value="planets">
          <PlanetTable data={chartData} selection={selection} onSelect={onSelect} showOuter={showOuter} setShowOuter={setShowOuter} />
        </TabsContent>
        <TabsContent value="cusps"><CuspTable data={chartData} selection={selection} onSelect={onSelect} /></TabsContent>
        <TabsContent value="significators">
          <SignificatorView data={chartData} method={method} setMethod={setMethod} mode={mode} setMode={setMode} selection={selection} onSelect={onSelect} agency={agency} setAgency={setAgency} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
