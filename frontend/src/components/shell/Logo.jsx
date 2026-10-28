export const LogoMark = ({ className = "h-8 w-8" }) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
    <ellipse cx="32" cy="32" rx="25" ry="11" fill="none" stroke="#D4AF37" strokeWidth="2.4" transform="rotate(-24 32 32)" />
    <path d="M32 17 L35 29 L47 32 L35 35 L32 47 L29 35 L17 32 L29 29 Z" fill="#E6C668" />
    <circle cx="53" cy="22" r="2.6" fill="#22D3EE" />
  </svg>
);

export const Logo = ({ collapsed }) => (
  <div className="flex items-center gap-3" data-testid="app-logo">
    <LogoMark className="h-9 w-9 shrink-0 drop-shadow-[0_0_10px_rgba(212,175,55,0.35)]" />
    {!collapsed && (
      <div className="leading-none">
        <div className="font-display text-xl font-semibold tracking-wide text-amber-100">KP Insight</div>
        <div className="mt-1 text-[11px] uppercase tracking-[0.24em] text-slate-400">Observatory</div>
      </div>
    )}
  </div>
);
