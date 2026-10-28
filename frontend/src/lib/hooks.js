import { useQuery } from "@tanstack/react-query";
import { fetchDasha, fetchSadeSati, fetchTransits } from "@/lib/api";

const chartKey = (c) => [c.id, c.date, c.time, c.latitude, c.longitude, c.tz, c.utc_offset];

export const useDasha = (c) =>
  useQuery({ queryKey: ["dasha", ...chartKey(c)], queryFn: () => fetchDasha(c), staleTime: Infinity, retry: 1 });

export const useSadeSati = (c, enabled = true) =>
  useQuery({ queryKey: ["sadesati", ...chartKey(c)], queryFn: () => fetchSadeSati(c), staleTime: Infinity, retry: 1, enabled });

export const useTransits = (c) =>
  useQuery({ queryKey: ["transits", ...chartKey(c)], queryFn: () => fetchTransits(c), staleTime: 10 * 60 * 1000, retry: 1 });

export const nowIn = (tz) => {
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
    .formatToParts(new Date()).map((p) => [p.type, p.value]));
  return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}` };
};

export const cycleFor = (cycles, ref) => {
  const list = cycles || [];
  const t = ref.getTime();
  return list.find((c) => new Date(c.start).getTime() <= t && t < new Date(c.end).getTime())
    || list.find((c) => new Date(c.start).getTime() > t)
    || list[list.length - 1] || null;
};
