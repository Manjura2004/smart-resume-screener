import { useMemo, useState } from 'react';
import { useApp } from '@/store/AppContext';
import { ScoreBadge } from '@/components/ScoreBadge';
import { RecommendationBadge, ProcessingBadge } from '@/components/StatusBadge';
import type { PageKey } from '@/components/Sidebar';
import type { Candidate, Recommendation } from '@/lib/types';
import { Search, ArrowUpDown, Trash2, ChevronRight, Users } from 'lucide-react';

type Filter = 'ALL' | Recommendation;

export function CandidateRanking({ onSelectCandidate, onNavigate }: { onSelectCandidate: (id: string) => void; onNavigate: (page: PageKey) => void }) {
  const { candidates, removeCandidate, job } = useApp();
  const [filter, setFilter] = useState<Filter>('ALL');
  const [search, setSearch] = useState('');
  const [sortDesc, setSortDesc] = useState(true);

  const filtered = useMemo(() => {
    let list = candidates.filter((c) => c.status === 'ready');
    if (filter !== 'ALL') list = list.filter((c) => c.recommendation === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.skills.some((s) => s.toLowerCase().includes(q)),
      );
    }
    list = [...list].sort((a, b) => (sortDesc ? b.match_score - a.match_score : a.match_score - b.match_score));
    return list;
  }, [candidates, filter, search, sortDesc]);

  const counts = useMemo(() => {
    const ready = candidates.filter((c) => c.status === 'ready');
    return {
      ALL: ready.length,
      SHORTLIST: ready.filter((c) => c.recommendation === 'SHORTLIST').length,
      REVIEW: ready.filter((c) => c.recommendation === 'REVIEW').length,
      REJECT: ready.filter((c) => c.recommendation === 'REJECT').length,
    } as Record<Filter, number>;
  }, [candidates]);

  const filters: Filter[] = ['ALL', 'SHORTLIST', 'REVIEW', 'REJECT'];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Candidate Ranking</h1>
          <p className="mt-1 text-sm text-slate-500">
            {job ? `Ranked by match score for "${job.title}"` : 'Ranked by match score'}
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or skill…"
            className="w-64 rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              filter === f
                ? 'bg-slate-900 text-white'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {f === 'ALL' ? 'All' : f === 'SHORTLIST' ? 'Shortlisted' : f === 'REVIEW' ? 'Review' : 'Rejected'}
            <span className={`rounded-full px-1.5 text-xs ${filter === f ? 'bg-white/20' : 'bg-slate-100'}`}>
              {counts[f]}
            </span>
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3.5">Candidate</th>
                <th className="px-5 py-3.5">
                  <button
                    onClick={() => setSortDesc((v) => !v)}
                    className="inline-flex items-center gap-1 hover:text-slate-900"
                  >
                    Match Score <ArrowUpDown className="h-3.5 w-3.5" />
                  </button>
                </th>
                <th className="px-5 py-3.5">Skills Match</th>
                <th className="px-5 py-3.5">Experience</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <Users className="mx-auto h-8 w-8 text-slate-300" />
                    <p className="mt-2 text-sm text-slate-500">No candidates match the current filter.</p>
                  </td>
                </tr>
              )}
              {filtered.map((c) => (
                <CandidateRow
                  key={c.id}
                  candidate={c}
                  onClick={() => onSelectCandidate(c.id)}
                  onDelete={() => removeCandidate(c.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {candidates.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="text-sm text-slate-500">No candidates yet. Upload resumes to see rankings here.</p>
          <button
            onClick={() => onNavigate('upload')}
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Upload Resumes
          </button>
        </div>
      )}
    </div>
  );
}

function CandidateRow({ candidate, onClick, onDelete }: { candidate: Candidate; onClick: () => void; onDelete: () => void }) {
  return (
    <tr className="group cursor-pointer transition hover:bg-slate-50" onClick={onClick}>
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <ScoreBadge score={candidate.match_score} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-900">{candidate.name}</p>
            <p className="truncate text-xs text-slate-400">{candidate.file_name}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-4">
        <span className="text-lg font-bold text-slate-900">{candidate.match_score.toFixed(2)}</span>
        <span className="text-sm text-slate-400"> / 10</span>
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full ${candidate.skills_match_pct >= 80 ? 'bg-emerald-500' : candidate.skills_match_pct >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
              style={{ width: `${candidate.skills_match_pct}%` }}
            />
          </div>
          <span className="text-sm font-medium text-slate-600">{candidate.skills_match_pct}%</span>
        </div>
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full ${candidate.experience_match_pct >= 80 ? 'bg-emerald-500' : candidate.experience_match_pct >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
              style={{ width: `${candidate.experience_match_pct}%` }}
            />
          </div>
          <span className="text-sm font-medium text-slate-600">{candidate.experience_match_pct}%</span>
        </div>
      </td>
      <td className="px-5 py-4">
        {candidate.status === 'ready' ? (
          <RecommendationBadge recommendation={candidate.recommendation} />
        ) : (
          <ProcessingBadge status={candidate.status} />
        )}
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="rounded-lg p-1.5 text-slate-400 opacity-0 transition hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500" />
        </div>
      </td>
    </tr>
  );
}
