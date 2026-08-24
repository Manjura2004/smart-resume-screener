import { Check, X } from 'lucide-react';

export function SkillTag({ skill, variant = 'default' }: { skill: string; variant?: 'default' | 'matched' | 'missing' }) {
  if (variant === 'matched') {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-1 text-sm font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
        <Check className="h-3.5 w-3.5" />
        {skill}
      </span>
    );
  }
  if (variant === 'missing') {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2.5 py-1 text-sm font-medium text-rose-700 ring-1 ring-inset ring-rose-600/20">
        <X className="h-3.5 w-3.5" />
        {skill}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-sm font-medium text-slate-700">
      {skill}
    </span>
  );
}
