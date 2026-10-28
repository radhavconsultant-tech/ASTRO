import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpDown, Search } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { CopyButton } from "./CopyButton";

export const DataTable = ({ rows, columns, rowKey, selectedKey, onRowClick, copyText, testPrefix, filters }) => {
  const { t } = useApp();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState({ key: null, dir: 1 });
  const selRef = useRef(null);
  const boxRef = useRef(null);

  const view = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let r = needle ? rows.filter((row) => columns.some((c) => String(c.text ? c.text(row) : row[c.key] ?? "").toLowerCase().includes(needle) || String(t(row[c.key] ?? "")).toLowerCase().includes(needle))) : rows;
    if (sort.key) {
      const col = columns.find((c) => c.key === sort.key);
      const v = (row) => (col.sortValue ? col.sortValue(row) : row[col.key]);
      r = [...r].sort((a, b) => (v(a) > v(b) ? 1 : v(a) < v(b) ? -1 : 0) * sort.dir);
    }
    return r;
  }, [rows, q, sort, columns, t]);

  useEffect(() => {
    const box = boxRef.current;
    const row = selRef.current;
    if (!box || !row) return;
    const top = row.offsetTop - 40;
    if (top < box.scrollTop || row.offsetTop + row.offsetHeight > box.scrollTop + box.clientHeight) box.scrollTo({ top, behavior: "smooth" });
  }, [selectedKey]);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" data-testid={`${testPrefix}-search`}
            className="focus-ring w-48 rounded-md border border-white/10 bg-[#0b0f19] py-1.5 pl-8 pr-2 text-sm text-slate-200 placeholder:text-slate-500 sm:w-60" />
        </div>
        {filters}
        <span className="ml-auto text-xs text-slate-500">{view.length} rows</span>
      </div>
      <div ref={boxRef} className="scroll-thin relative max-h-[440px] overflow-auto rounded-lg border border-white/[0.06]">
        <table className="w-full min-w-[720px] text-left text-sm" data-testid={`${testPrefix}-table`}>
          <thead className="sticky top-0 z-[1] bg-[#111827] text-[11px] uppercase tracking-wider text-slate-400">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className="px-3 py-2.5 font-medium">
                  <button onClick={() => setSort((s) => ({ key: c.key, dir: s.key === c.key ? -s.dir : 1 }))}
                    data-testid={`${testPrefix}-sort-${c.key}`} className="focus-ring inline-flex items-center gap-1 hover:text-amber-200">
                    {c.label}<ArrowUpDown className={`h-3 w-3 ${sort.key === c.key ? "text-amber-300" : "opacity-40"}`} />
                  </button>
                </th>
              ))}
              <th className="w-10 px-2" />
            </tr>
          </thead>
          <tbody>
            {view.map((row) => {
              const k = row[rowKey];
              const sel = k === selectedKey;
              return (
                <tr key={k} ref={sel ? selRef : null} onClick={() => onRowClick(k)} data-testid={`${testPrefix}-row-${String(k).toLowerCase()}`}
                  aria-selected={sel} tabIndex={0} onKeyDown={(e) => e.key === "Enter" && onRowClick(k)}
                  className={`focus-ring cursor-pointer border-t border-white/[0.04] transition-colors duration-150 ${sel ? "bg-amber-400/10 shadow-[inset_2px_0_0_#D4AF37]" : "hover:bg-white/[0.03]"}`}>
                  {columns.map((c) => (
                    <td key={c.key} className={`whitespace-nowrap px-3 py-2 ${c.mono ? "font-data text-[13px] text-cyan-200" : "text-slate-200"}`}>
                      {c.render ? c.render(row) : row[c.key]}
                    </td>
                  ))}
                  <td className="px-2"><CopyButton text={copyText(row)} testId={`${testPrefix}-copy-${String(k).toLowerCase()}`} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
