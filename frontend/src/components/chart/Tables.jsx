import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { useApp } from "@/context/AppContext";
import { PLANET_COLOR } from "@/lib/kp";
import { DataTable } from "./DataTable";

const Lord = ({ v }) => {
  const { t } = useApp();
  return <span style={{ color: PLANET_COLOR[v] }}>{t(v)}</span>;
};

export const PlanetTable = ({ data, selection, onSelect, showOuter, setShowOuter }) => {
  const { t } = useApp();
  const [retroOnly, setRetroOnly] = useState(false);
  const rows = data.planets.filter((p) => (showOuter || p.kp_core) && (!retroOnly || (p.retrograde && !["Rahu", "Ketu"].includes(p.name))));
  const cols = [
    { key: "name", label: t("planet"), render: (r) => (
      <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ background: PLANET_COLOR[r.name] }} />{t(r.name)}
        {r.retrograde && !["Rahu", "Ketu"].includes(r.name) && <span className="rounded bg-amber-400/15 px-1 text-[10px] font-semibold text-amber-200" title="Retrograde">R</span>}</span>) },
    { key: "sign", label: t("sign"), render: (r) => t(r.sign), sortValue: (r) => r.sign_index },
    { key: "dms", label: t("degree"), mono: true, sortValue: (r) => r.longitude },
    { key: "nakshatra", label: t("nakshatra"), render: (r) => `${t(r.nakshatra)} · ${r.pada}`, sortValue: (r) => r.nakshatra_index },
    { key: "star_lord", label: t("starLord"), render: (r) => <Lord v={r.star_lord} /> },
    { key: "sub_lord", label: t("subLord"), render: (r) => <Lord v={r.sub_lord} /> },
    { key: "sub_sub_lord", label: t("subSubLord"), render: (r) => <Lord v={r.sub_sub_lord} /> },
    { key: "house", label: t("house"), mono: true },
  ];
  return (
    <DataTable rows={rows} columns={cols} rowKey="name" testPrefix="planet-table"
      selectedKey={selection?.type === "planet" ? selection.id : null}
      onRowClick={(k) => onSelect({ type: "planet", id: k })}
      copyText={(r) => `${r.name} ${r.sign} ${r.dms}${r.retrograde ? " R" : ""} | ${r.nakshatra} p${r.pada} | SL ${r.star_lord} | Sub ${r.sub_lord} | SS ${r.sub_sub_lord} | H${r.house}`}
      filters={
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <label className="flex items-center gap-2"><Switch checked={showOuter} onCheckedChange={setShowOuter} data-testid="planet-table-outer-toggle" />Uranus & Neptune</label>
          <label className="flex items-center gap-2"><Switch checked={retroOnly} onCheckedChange={setRetroOnly} data-testid="planet-table-retro-toggle" />{t("retro")} only</label>
        </div>
      } />
  );
};

export const CuspTable = ({ data, selection, onSelect }) => {
  const { t } = useApp();
  const cols = [
    { key: "house", label: t("house"), mono: true },
    { key: "sign", label: t("sign"), render: (r) => t(r.sign), sortValue: (r) => r.longitude },
    { key: "dms", label: t("degree"), mono: true, sortValue: (r) => r.longitude },
    { key: "nakshatra", label: t("nakshatra"), render: (r) => `${t(r.nakshatra)} · ${r.pada}`, sortValue: (r) => r.nakshatra_index },
    { key: "sign_lord", label: t("signLord"), render: (r) => <Lord v={r.sign_lord} /> },
    { key: "star_lord", label: t("starLord"), render: (r) => <Lord v={r.star_lord} /> },
    { key: "sub_lord", label: t("subLord"), render: (r) => <Lord v={r.sub_lord} /> },
    { key: "sub_sub_lord", label: t("subSubLord"), render: (r) => <Lord v={r.sub_sub_lord} /> },
  ];
  return (
    <DataTable rows={data.cusps} columns={cols} rowKey="house" testPrefix="cusp-table"
      selectedKey={selection?.type === "cusp" ? selection.id : null}
      onRowClick={(k) => onSelect({ type: "cusp", id: k })}
      copyText={(r) => `Cusp ${r.house} ${r.sign} ${r.dms} | ${r.nakshatra} | RL ${r.sign_lord} | SL ${r.star_lord} | Sub ${r.sub_lord} | SS ${r.sub_sub_lord}`} />
  );
};
