const colorFor = (pct: number): string => {
  if (pct >= 80) return 'bg-emerald-500';
  if (pct >= 50) return 'bg-amber-500';
  return 'bg-rose-500';
};

export function ProgressBar({ label, value, showValue = true }: { label: string; value: number; showValue?: boolean }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-600">{label}</span>
        {showValue && <span className="text-sm font-semibold text-slate-900">{value}%</span>}
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${colorFor(value)}`}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
    </div>
  );
}
