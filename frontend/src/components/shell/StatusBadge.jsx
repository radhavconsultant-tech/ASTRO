import { useLocation } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useApp } from "@/context/AppContext";

const STATES = {
  ephemeris: { label: "Ephemeris (built-in)", dot: "bg-emerald-400", ring: "border-emerald-400/30 text-emerald-200",
    tip: "Positions computed live: Swiss Ephemeris (Moshier), KP ayanamsa, Placidus cusps, mean node." },
  fixture: { label: "Demo fixture", dot: "bg-amber-400", ring: "border-amber-400/30 text-amber-200",
    tip: "The calculation service is unreachable. Showing a bundled snapshot of the sample chart." },
  pending: { label: "Pending module", dot: "bg-slate-400", ring: "border-slate-400/30 text-slate-300",
    tip: "This module is not built yet. Nothing on this page is a calculation or prediction." },
  error: { label: "Calculation unavailable", dot: "bg-red-400", ring: "border-red-400/30 text-red-200",
    tip: "The calculation service could not be reached for this chart." },
};

export const StatusBadge = () => {
  const { pathname } = useLocation();
  const { dataSource } = useApp();
  const key = pathname.startsWith("/modules") ? "pending" : dataSource;
  const s = STATES[key];
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div data-testid="calc-status-badge" data-status={key}
          className={`hidden items-center gap-2 rounded-full border bg-white/[0.03] px-3 py-1.5 text-xs font-medium sm:flex ${s.ring}`}>
          <span className="relative flex h-2 w-2">
            <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-50 ${s.dot}`} />
            <span className={`relative inline-flex h-2 w-2 rounded-full ${s.dot}`} />
          </span>
          {s.label}
        </div>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-xs">{s.tip}</TooltipContent>
    </Tooltip>
  );
};
