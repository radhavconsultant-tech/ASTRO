import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAnyChart } from "@/lib/api";
import { translate } from "@/lib/i18n";
import { SAMPLE_CHART } from "@/lib/kp";
import sampleFixture from "@/data/sampleChart.json";

const Ctx = createContext(null);

const load = (k, fallback) => {
  try {
    const v = localStorage.getItem(k);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
};

const prefersReduced = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export function AppProvider({ children }) {
  const [userCharts, setUserCharts] = useState(() => load("kp.charts", []));
  const [activeId, setActiveId] = useState(() => load("kp.active", "sample"));
  const [lang, setLang] = useState(() => load("kp.lang", "en"));
  const [reducedMotion, setReducedMotion] = useState(() => load("kp.reducedMotion", prefersReduced()));

  useEffect(() => { localStorage.setItem("kp.charts", JSON.stringify(userCharts)); }, [userCharts]);
  useEffect(() => { localStorage.setItem("kp.active", JSON.stringify(activeId)); }, [activeId]);
  useEffect(() => { localStorage.setItem("kp.lang", JSON.stringify(lang)); document.documentElement.lang = lang; }, [lang]);
  useEffect(() => { localStorage.setItem("kp.reducedMotion", JSON.stringify(reducedMotion)); }, [reducedMotion]);

  const charts = useMemo(() => [SAMPLE_CHART, ...userCharts], [userCharts]);
  const active = charts.find((c) => c.id === activeId) || SAMPLE_CHART;

  const query = useQuery({
    queryKey: ["chart", active.id, active.kind, active.number, active.date, active.time, active.latitude, active.longitude, active.tz, active.utc_offset],
    queryFn: () => fetchAnyChart(active),
    retry: 1,
    staleTime: Infinity,
  });

  const usingFixture = query.isError && active.sample;
  const chartData = query.data || (usingFixture ? sampleFixture : null);
  const dataSource = usingFixture ? "fixture" : query.isError ? "error" : "ephemeris";

  const addChart = useCallback((c) => { setUserCharts((p) => [...p, c]); setActiveId(c.id); }, []);
  const removeChart = useCallback((id) => {
    setUserCharts((p) => p.filter((c) => c.id !== id));
    setActiveId((a) => (a === id ? "sample" : a));
  }, []);
  const t = useCallback((k) => translate(lang, k), [lang]);

  const value = {
    charts, active, activeId, setActiveId, addChart, removeChart, lang, setLang, t,
    reducedMotion, setReducedMotion, chartData, chartLoading: query.isLoading, dataSource,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useApp = () => useContext(Ctx);
