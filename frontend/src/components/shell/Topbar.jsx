import { useState } from "react";
import { Menu, Wind } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useApp } from "@/context/AppContext";
import { ChartSelector } from "./ChartSelector";
import { QuickSearch } from "./QuickSearch";
import { StatusBadge } from "./StatusBadge";
import { SidebarNav } from "./Sidebar";
import { Logo } from "./Logo";

const LangSwitch = () => {
  const { lang, setLang } = useApp();
  return (
    <div className="flex rounded-lg border border-white/[0.08] p-0.5 text-xs" role="group" aria-label="Interface language">
      {[["en", "EN"], ["te", "తెలుగు"]].map(([k, l]) => (
        <button key={k} data-testid={`lang-${k}`} onClick={() => setLang(k)} aria-pressed={lang === k}
          className={`focus-ring rounded-md px-2.5 py-1 transition-colors ${lang === k ? "bg-amber-400/15 text-amber-100" : "text-slate-400 hover:text-white"}`}>
          {l}
        </button>
      ))}
    </div>
  );
};

export const Topbar = () => {
  const [open, setOpen] = useState(false);
  const { reducedMotion, setReducedMotion } = useApp();
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-white/[0.06] bg-[#0b0f19]/85 px-4 backdrop-blur-xl sm:px-6">
      <button className="focus-ring rounded-lg p-2 text-slate-300 lg:hidden" onClick={() => setOpen(true)} data-testid="mobile-nav-open" aria-label="Open navigation">
        <Menu className="h-5 w-5" />
      </button>
      <ChartSelector />
      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <StatusBadge />
        <QuickSearch />
        <button data-testid="reduced-motion-toggle" onClick={() => setReducedMotion(!reducedMotion)} aria-pressed={reducedMotion}
          title={reducedMotion ? "Reduced motion on" : "Reduced motion off"}
          className={`focus-ring hidden rounded-lg border p-2 transition-colors sm:block ${reducedMotion ? "border-cyan-400/40 text-cyan-300" : "border-white/[0.08] text-slate-400 hover:text-white"}`}>
          <Wind className="h-4 w-4" />
        </button>
        <LangSwitch />
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="flex w-[280px] flex-col border-white/10 bg-[#0a0e18] p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex h-16 items-center px-5"><Logo /></div>
          <SidebarNav onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </header>
  );
};
