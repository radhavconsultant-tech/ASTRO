import { useQuery } from "@tanstack/react-query";
import { fetchDasha, fetchSadeSati } from "@/lib/api";

const chartKey = (c) => [c.id, c.date, c.time, c.latitude, c.longitude, c.tz, c.utc_offset];

export const useDasha = (c) =>
  useQuery({ queryKey: ["dasha", ...chartKey(c)], queryFn: () => fetchDasha(c), staleTime: Infinity, retry: 1 });

export const useSadeSati = (c, enabled = true) =>
  useQuery({ queryKey: ["sadesati", ...chartKey(c)], queryFn: () => fetchSadeSati(c), staleTime: Infinity, retry: 1, enabled });

export const cycleFor = (cycles, ref) => {
  const list = cycles || [];
  const t = ref.getTime();
  return list.find((c) => new Date(c.start).getTime() <= t && t < new Date(c.end).getTime())
    || list.find((c) => new Date(c.start).getTime() > t)
    || list[list.length - 1] || null;
};
