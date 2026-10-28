import { format, differenceInDays } from "date-fns";

export const parse = (iso) => new Date(/([zZ]|[+-]\d\d:\d\d)$/.test(iso) ? iso : `${iso}Z`);
export const fmt = (iso) => format(parse(iso), "dd MMM yyyy");

export const findActive = (list, ref) =>
  (list || []).find((p) => parse(p.start) <= ref && ref < parse(p.end)) || null;

export const progress = (p, ref) => {
  const s = parse(p.start).getTime();
  const e = parse(p.end).getTime();
  return Math.min(1, Math.max(0, (ref.getTime() - s) / (e - s)));
};

export const ymd = (years) => {
  const y = Math.floor(years);
  const mF = (years - y) * 12;
  const m = Math.floor(mF);
  const d = Math.floor((mF - m) * 30.4375);
  return `${y}y ${m}m ${d}d`;
};

export const remaining = (p, ref) => {
  const days = differenceInDays(parse(p.end), ref);
  return days > 0 ? ymd(days / 365.25) : "ended";
};
