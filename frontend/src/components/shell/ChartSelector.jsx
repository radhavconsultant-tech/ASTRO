import { useNavigate } from "react-router-dom";
import { ChevronDown, Plus, Check, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useApp } from "@/context/AppContext";

export const ChartSelector = () => {
  const { charts, active, setActiveId, removeChart, t } = useApp();
  const nav = useNavigate();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger data-testid="chart-selector-trigger"
        className="focus-ring flex min-w-0 items-center gap-2 rounded-lg border border-amber-500/20 bg-white/[0.03] px-3 py-1.5 text-left transition-colors hover:border-amber-400/50">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">{t("activeChart")}</div>
          <div className="flex items-center gap-2 truncate text-sm font-medium text-slate-100" data-testid="active-chart-name">
            <span className="truncate">{active.name}</span>
            {active.sample && <span className="rounded bg-amber-400/15 px-1.5 text-[10px] uppercase text-amber-200">{t("sample")}</span>}
          </div>
        </div>
        <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72 border-amber-500/20 bg-[#0f1524]">
        <DropdownMenuLabel className="text-xs text-slate-400">{t("savedCharts")}</DropdownMenuLabel>
        {charts.map((c) => (
          <DropdownMenuItem key={c.id} onSelect={() => setActiveId(c.id)} data-testid={`chart-option-${c.id}`} className="flex items-center gap-2">
            <Check className={`h-4 w-4 ${c.id === active.id ? "text-amber-300" : "opacity-0"}`} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm">{c.name}{c.sample ? " · sample" : ""}</div>
              <div className="font-data truncate text-[11px] text-slate-400">{c.date} {c.time} · {c.place}</div>
            </div>
            {!c.sample && (
              <button data-testid={`chart-delete-${c.id}`} aria-label={`Delete ${c.name}`}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeChart(c.id); }}
                className="rounded p-1 text-slate-500 hover:bg-red-500/10 hover:text-red-300">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => nav("/charts/new")} data-testid="chart-selector-new" className="text-amber-200">
          <Plus className="mr-2 h-4 w-4" /> {t("newChart")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
