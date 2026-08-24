import type { Recommendation, CandidateStatus } from '@/lib/types';
import { CheckCircle2, Eye, XCircle, Loader2, AlertCircle } from 'lucide-react';

export function RecommendationBadge({ recommendation }: { recommendation: Recommendation }) {
  const config = {
    SHORTLIST: {
      label: 'Shortlist',
      classes: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
      Icon: CheckCircle2,
    },
    REVIEW: {
      label: 'Review',
      classes: 'bg-amber-50 text-amber-700 ring-amber-600/20',
      Icon: Eye,
    },
    REJECT: {
      label: 'Reject',
      classes: 'bg-rose-50 text-rose-700 ring-rose-600/20',
      Icon: XCircle,
    },
  } as const;
  const { label, classes, Icon } = config[recommendation];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${classes}`}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}

export function ProcessingBadge({ status }: { status: CandidateStatus }) {
  if (status === 'ready') return null;
  if (status === 'processing') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 ring-1 ring-inset ring-sky-600/20">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Processing
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-600/20">
      <AlertCircle className="h-3.5 w-3.5" />
      Error
    </span>
  );
}
