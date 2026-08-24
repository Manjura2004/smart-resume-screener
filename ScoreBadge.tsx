import type { Recommendation } from '@/lib/types';

const colorFor = (score: number): string => {
  if (score >= 8) return 'bg-emerald-500';
  if (score >= 6.5) return 'bg-amber-500';
  return 'bg-rose-500';
};

const textFor = (score: number): string => {
  if (score >= 8) return 'text-emerald-700';
  if (score >= 6.5) return 'text-amber-700';
  return 'text-rose-700';
};

export function ScoreBadge({ score, size = 'md' }: { score: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'h-9 w-9 text-sm',
    md: 'h-12 w-12 text-base',
    lg: 'h-16 w-16 text-xl',
  };
  return (
    <div className={`relative flex items-center justify-center rounded-xl ${sizes[size]} font-bold ${textFor(score)}`}>
      <div className={`absolute inset-0 rounded-xl opacity-10 ${colorFor(score)}`} />
      <span className="relative">{score.toFixed(1)}</span>
    </div>
  );
}

export function ScoreRing({ score, recommendation }: { score: number; recommendation: Recommendation }) {
  const pct = (score / 10) * 100;
  const ringColor = recommendation === 'SHORTLIST' ? 'stroke-emerald-500' : recommendation === 'REVIEW' ? 'stroke-amber-500' : 'stroke-rose-500';
  const textColor = recommendation === 'SHORTLIST' ? 'text-emerald-600' : recommendation === 'REVIEW' ? 'text-amber-600' : 'text-rose-600';
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  return (
    <div className="relative h-36 w-36">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} className="fill-none stroke-slate-100" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          className={`fill-none ${ringColor} transition-all duration-700 ease-out`}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-3xl font-bold ${textColor}`}>{score.toFixed(1)}</span>
        <span className="text-xs font-medium text-slate-400">out of 10</span>
      </div>
    </div>
  );
}
