import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useApp } from "@/context/AppContext";
import { MODULES } from "@/lib/modules";

const PAGES = [["/", "dashboard"], ["/observatory", "observatory"], ["/explorer", "explorer"], ["/charts/new", "newChart"]];

export const QuickSearch = () => {
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const { t, charts, setActiveId } = useApp();

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen((o) => !o); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (fn) => { fn(); setOpen(false); };

  return (
    <>
      <button data-testid="quick-search-trigger" onClick={() => setOpen(true)}
        className="focus-ring flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-slate-400 transition-colors hover:border-amber-400/40 hover:text-slate-200">
        <Search className="h-4 w-4" />
        <span className="hidden md:inline">{t("search")}…</span>
        <kbd className="font-data hidden rounded border border-white/10 px-1.5 text-[10px] md:inline">⌘K</kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search pages, charts, modules…" data-testid="quick-search-input" />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
          <CommandGroup heading="Pages">
            {PAGES.map(([to, k]) => (
              <CommandItem key={to} onSelect={() => go(() => nav(to))} data-testid={`qs-page-${k}`}>{t(k)}</CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Charts">
            {charts.map((c) => (
              <CommandItem key={c.id} value={`chart ${c.name} ${c.place}`} onSelect={() => go(() => { setActiveId(c.id); nav("/explorer"); })}
                data-testid={`qs-chart-${c.id}`}>{c.name} <span className="ml-2 text-xs text-slate-500">{c.place}</span></CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Planned modules">
            {MODULES.map((m) => (
              <CommandItem key={m.id} onSelect={() => go(() => nav(`/modules/${m.id}`))} data-testid={`qs-module-${m.id}`}>
                {t(m.key)} <span className="ml-auto text-[10px] uppercase text-slate-500">Phase {m.phase}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
};
