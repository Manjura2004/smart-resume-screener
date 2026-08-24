import type { LucideIcon } from 'lucide-react';

const colorClasses: Record<string, string> = {
  slate: 'bg-slate-50 text-slate-600 ring-slate-500/20',
  emerald: 'bg-emerald-50 text-emerald-600 ring-emerald-500/20',
  amber: 'bg-amber-50 text-amber-600 ring-amber-500/20',
  sky: 'bg-sky-50 text-sky-600 ring-sky-500/20',
};

export function StatCard({
  label,
  value,
  icon: Icon,
  color = 'slate',
  sub,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: keyof typeof colorClasses;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
          {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ring-1 ring-inset ${colorClasses[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
