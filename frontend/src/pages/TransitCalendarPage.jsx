import { useMemo, useState } from "react";
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, startOfMonth, startOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/common";
import { useApp } from "@/context/AppContext";
import { useTransits } from "@/lib/hooks";
import { parse } from "@/components/dasha/dashaUtils";
import { PLANET_COLOR } from "@/lib/kp";

const ord = (n) => `${n}${n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th"}`;

export default function TransitCalendarPage() {
  const { active, t } = useApp();
  const q = useTransits(active);
  const d = q.data;
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const events = useMemo(() => (d?.events || []).map((e) => ({ ...e, date: parse(e.utc) })), [d]);
  const days = eachDayOfInterval({ start: startOfWeek(startOfMonth(month)), end: endOfWeek(endOfMonth(month)) });
  const monthEvents = events.filter((e) => isSameMonth(e.date, month));
  const today = new Date();
  const jump = (dir) => {
    const list = dir > 0 ? events.filter((e) => e.date > endOfMonth(month)) : events.filter((e) => e.date < startOfMonth(month)).reverse();
    if (list[0]) setMonth(startOfMonth(list[0].date));
  };

  return (
    <div className="space-y-8 px-4 pb-16 pt-8 sm:px-6 lg:px-10" data-testid="transit-calendar-page">
      <PageHeader eyebrow={`${t("transitCalendar")} · ${active.name}`} title="Saturn & Jupiter calendar">
        Sidereal sign changes for the next 3 years. Houses are counted by sign from the natal Moon and Ascendant.
      </PageHeader>
      {!d ? <Skeleton className="h-[520px] w-full rounded-2xl bg-white/5" /> : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="panel p-4 sm:p-5 lg:col-span-8">
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => setMonth(addMonths(month, -1))} className="focus-ring rounded-full border border-white/10 p-2 text-slate-300 hover:text-amber-200" aria-label="Previous month" data-testid="cal-prev"><ChevronLeft className="h-4 w-4" /></button>
              <h2 className="min-w-[180px] text-center font-display text-2xl font-semibold text-amber-50" data-testid="cal-month">{format(month, "MMMM yyyy")}</h2>
              <button onClick={() => setMonth(addMonths(month, 1))} className="focus-ring rounded-full border border-white/10 p-2 text-slate-300 hover:text-amber-200" aria-label="Next month" data-testid="cal-next"><ChevronRight className="h-4 w-4" /></button>
              <div className="ml-auto flex gap-2 text-xs">
                <button onClick={() => jump(-1)} className="focus-ring rounded-full border border-white/10 px-3 py-1.5 text-slate-300 hover:border-amber-400/50" data-testid="cal-prev-event">‹ Previous change</button>
                <button onClick={() => setMonth(startOfMonth(today))} className="focus-ring rounded-full border border-white/10 px-3 py-1.5 text-slate-300 hover:border-amber-400/50" data-testid="cal-today">Today</button>
                <button onClick={() => jump(1)} className="focus-ring rounded-full border border-white/10 px-3 py-1.5 text-slate-300 hover:border-amber-400/50" data-testid="cal-next-event">Next change ›</button>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-7 gap-px overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.06] text-xs" data-testid="cal-grid">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((w) => <div key={w} className="bg-[#111827] py-2 text-center text-[11px] uppercase tracking-wider text-slate-400">{w}</div>)}
              {days.map((day) => {
                const evs = events.filter((e) => isSameDay(e.date, day));
                const inMonth = isSameMonth(day, month);
                return (
                  <div key={day.toISOString()} className={`min-h-[68px] p-1.5 sm:min-h-[92px] ${inMonth ? "bg-[#0f1524]" : "bg-[#0b0f19]"} ${isSameDay(day, today) ? "ring-1 ring-inset ring-cyan-400/60" : ""}`}>
                    <div className={`font-data text-[11px] ${inMonth ? "text-slate-300" : "text-slate-600"}`}>{format(day, "d")}</div>
                    {evs.map((e) => (
                      <div key={e.utc} className="mt-1 truncate rounded px-1 py-0.5 text-[10px] font-medium sm:text-[11px]" data-testid="cal-event"
                        style={{ background: `${PLANET_COLOR[e.planet]}26`, color: PLANET_COLOR[e.planet] }} title={`${e.planet} enters ${e.to_sign}`}>
                        {t(e.planet).slice(0, 3)} → {t(e.to_sign)}{e.retrograde ? " R" : ""}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="space-y-4 lg:col-span-4">
            <div className="panel p-5" data-testid="cal-month-list">
              <div className="eyebrow">This month</div>
              {!monthEvents.length && <p className="mt-3 text-sm text-slate-400">No Saturn or Jupiter sign change this month.</p>}
              <ul className="mt-3 space-y-3">
                {monthEvents.map((e) => (
                  <li key={e.utc} className="border-l-2 pl-3" style={{ borderColor: PLANET_COLOR[e.planet] }}>
                    <div className="font-data text-xs text-slate-400">{format(e.date, "dd MMM yyyy, HH:mm")} (your time)</div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-sm">
                      <span style={{ color: PLANET_COLOR[e.planet] }}>{t(e.planet)}</span><span className="text-slate-400">{t(e.from_sign)}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-500" /><span className="text-slate-100">{t(e.to_sign)}</span>
                      {e.retrograde && <span className="rounded bg-red-400/15 px-1.5 text-[10px] font-semibold text-red-200">RETRO</span>}
                    </div>
                    <div className="text-xs text-slate-400">{ord(e.house_from_moon)} from Moon · {ord(e.house_from_asc)} from Ascendant{e.sade_sati ? ` · Sade Sati ${e.sade_sati}` : ""}</div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="panel p-5 text-xs text-slate-400">{events.length} sign changes in the next 3 years. Use “Next change” to jump between them.</div>
          </div>
        </div>
      )}
    </div>
  );
}
