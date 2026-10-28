import { NavLink } from "react-router-dom";
import { LayoutDashboard, Orbit, Aperture, PlusCircle, ChevronsLeft, ChevronsRight, GitCompareArrows, CalendarDays } from "lucide-react";
import { Logo } from "./Logo";
import { useApp } from "@/context/AppContext";
import { MODULES, MODULE_GROUPS } from "@/lib/modules";

const CORE = [
  { to: "/", tk: "dashboard", icon: LayoutDashboard, id: "dashboard" },
  { to: "/observatory", tk: "observatory", icon: Orbit, id: "observatory" },
  { to: "/explorer", tk: "explorer", icon: Aperture, id: "explorer" },
  { to: "/charts/new", tk: "newChart", icon: PlusCircle, id: "new-chart" },
  { to: "/compare", tk: "compare", icon: GitCompareArrows, id: "compare" },
  { to: "/transits", tk: "transitCalendar", icon: CalendarDays, id: "transits" },
];

const Item = ({ to, icon: Icon, label, id, collapsed, pending, onNavigate }) => (
  <NavLink to={to} end={to === "/"} onClick={onNavigate} data-testid={`nav-${id}`} title={collapsed ? label : undefined}
    className={({ isActive }) =>
      `focus-ring group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors duration-200 ${
        isActive ? "bg-amber-400/10 text-amber-100 shadow-[inset_2px_0_0_#D4AF37]" : "text-slate-300 hover:bg-white/[0.04] hover:text-white"}`}>
    <Icon className={`h-4 w-4 shrink-0 ${pending ? "opacity-60" : ""}`} strokeWidth={1.6} />
    {!collapsed && <span className="truncate">{label}</span>}
    {!collapsed && pending && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-slate-500" aria-label="in development" />}
  </NavLink>
);

export const SidebarNav = ({ collapsed, onNavigate }) => {
  const { t } = useApp();
  return (
    <nav className="scroll-thin flex-1 space-y-6 overflow-y-auto px-3 pb-6 pt-4" aria-label="Main">
      <div className="space-y-1">
        {!collapsed && <div className="px-3 pb-2 text-[11px] uppercase tracking-[0.2em] text-slate-500">{t("observe")}</div>}
        {CORE.map((c) => <Item key={c.to} {...c} label={t(c.tk)} collapsed={collapsed} onNavigate={onNavigate} />)}
      </div>
      {MODULE_GROUPS.map((g) => (
        <div key={g} className="space-y-1">
          {!collapsed && <div className="px-3 pb-2 text-[11px] uppercase tracking-[0.2em] text-slate-500">{t(g)}</div>}
          {collapsed && <div className="mx-3 border-t border-white/5" />}
          {MODULES.filter((m) => m.group === g).map((m) => (
            <Item key={m.id} to={m.to || `/modules/${m.id}`} icon={m.icon} id={`module-${m.id}`} label={t(m.key)}
              collapsed={collapsed} pending={!m.built} onNavigate={onNavigate} />
          ))}
        </div>
      ))}
    </nav>
  );
};

export const Sidebar = ({ collapsed, setCollapsed }) => (
  <aside data-testid="app-sidebar"
    className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-white/[0.06] bg-[#0a0e18] transition-[width] duration-300 lg:flex ${collapsed ? "w-[76px]" : "w-[260px]"}`}>
    <div className="flex h-16 items-center px-5"><Logo collapsed={collapsed} /></div>
    <SidebarNav collapsed={collapsed} />
    <button data-testid="sidebar-collapse-toggle" onClick={() => setCollapsed(!collapsed)}
      className="focus-ring m-3 flex items-center justify-center gap-2 rounded-lg border border-white/[0.06] py-2 text-xs text-slate-400 transition-colors hover:text-amber-200"
      aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}>
      {collapsed ? <ChevronsRight className="h-4 w-4" /> : <><ChevronsLeft className="h-4 w-4" /> Collapse</>}
    </button>
  </aside>
);
