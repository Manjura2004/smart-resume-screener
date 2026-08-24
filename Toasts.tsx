import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '@/store/AppContext';

export function Toasts() {
  const { toasts, dismissToast } = useApp();
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map((t) => {
        const Icon = t.kind === 'success' ? CheckCircle2 : t.kind === 'error' ? AlertCircle : Info;
        const color = t.kind === 'success' ? 'text-emerald-600' : t.kind === 'error' ? 'text-rose-600' : 'text-sky-600';
        return (
          <div
            key={t.id}
            className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg"
          >
            <Icon className={`h-5 w-5 shrink-0 ${color}`} />
            <p className="text-sm text-slate-700">{t.message}</p>
            <button onClick={() => dismissToast(t.id)} className="text-slate-400 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
