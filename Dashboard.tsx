import { useApp } from '@/store/AppContext';
import { StatCard } from '@/components/StatCard';
import { ScoreBadge } from '@/components/ScoreBadge';
import { RecommendationBadge, ProcessingBadge } from '@/components/StatusBadge';
import type { PageKey } from '@/components/Sidebar';
import { Users, CheckCircle2, Eye, Gauge, ArrowRight, Briefcase, Upload, FileText } from 'lucide-react';

export function Dashboard({ onNavigate }: { onNavigate: (page: PageKey) => void }) {
  const { job, candidates, loading } = useApp();

  const shortlisted = candidates.filter((c) => c.recommendation === 'SHORTLIST').length;
  const review = candidates.filter((c) => c.recommendation === 'REVIEW').length;
  const ready = candidates.filter((c) => c.status === 'ready');
  const avgScore = ready.length > 0
    ? (ready.reduce((sum, c) => sum + c.match_score, 0) / ready.length).toFixed(1)
    : '—';

  const topCandidates = [...ready].sort((a, b) => b.match_score - a.match_score).slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          {job ? `Screening candidates for "${job.title}"` : 'Set up a job description to begin screening.'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Candidates" value={candidates.length} icon={Users} color="slate" />
        <StatCard label="Shortlisted" value={shortlisted} icon={CheckCircle2} color="emerald" />
        <StatCard label="Under Review" value={review} icon={Eye} color="amber" />
        <StatCard label="Average Score" value={avgScore} icon={Gauge} color="sky" sub="out of 10" />
      </div>

      {!job && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
            <Briefcase className="h-6 w-6 text-slate-500" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-slate-900">No job description yet</h3>
          <p className="mt-1 text-sm text-slate-500">Create a job description to start screening candidates.</p>
          <button
            onClick={() => onNavigate('job')}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Create Job Description
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {job && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="font-semibold text-slate-900">Top Ranked Candidates</h2>
              <button
                onClick={() => onNavigate('ranking')}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                View all <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {loading && (
                <div className="px-6 py-8 text-center text-sm text-slate-400">Loading candidates…</div>
              )}
              {!loading && topCandidates.length === 0 && (
                <div className="px-6 py-8 text-center">
                  <p className="text-sm text-slate-500">No candidates yet.</p>
                  <button
                    onClick={() => onNavigate('upload')}
                    className="mt-3 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Resumes
                  </button>
                </div>
              )}
              {topCandidates.map((c, idx) => (
                <button
                  key={c.id}
                  onClick={() => onNavigate('details')}
                  className="flex w-full items-center gap-4 px-6 py-4 text-left transition hover:bg-slate-50"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-600">
                    {idx + 1}
                  </span>
                  <ScoreBadge score={c.match_score} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-900">{c.name}</p>
                    <p className="truncate text-xs text-slate-500">{c.file_name}</p>
                  </div>
                  <div className="hidden text-right sm:block">
                    <p className="text-xs text-slate-400">{c.skills.length} skills</p>
                  </div>
                  <RecommendationBadge recommendation={c.recommendation} />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-slate-500" />
                <h2 className="font-semibold text-slate-900">Active Job</h2>
              </div>
              <h3 className="mt-3 text-lg font-bold text-slate-900">{job.title}</h3>
              <p className="mt-1 line-clamp-3 text-sm text-slate-500">{job.description}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {job.required_skills.slice(0, 5).map((s) => (
                  <span key={s} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                    {s}
                  </span>
                ))}
                {job.required_skills.length > 5 && (
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                    +{job.required_skills.length - 5}
                  </span>
                )}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
                <span className="text-slate-500">Min Experience</span>
                <span className="font-semibold text-slate-900">{job.min_experience_years} years</span>
              </div>
              <button
                onClick={() => onNavigate('job')}
                className="mt-4 w-full rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Edit Job Description
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-slate-500" />
                <h2 className="font-semibold text-slate-900">Quick Actions</h2>
              </div>
              <div className="mt-3 space-y-2">
                <button
                  onClick={() => onNavigate('upload')}
                  className="flex w-full items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Upload className="h-4 w-4 text-slate-500" />
                  Upload Resumes
                </button>
                <button
                  onClick={() => onNavigate('ranking')}
                  className="flex w-full items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Users className="h-4 w-4 text-slate-500" />
                  View Ranking Table
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {candidates.some((c) => c.status !== 'ready') && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900">Processing Status</h2>
          <div className="mt-3 space-y-2">
            {candidates.filter((c) => c.status !== 'ready').map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2.5">
                <div>
                  <p className="text-sm font-medium text-slate-700">{c.name}</p>
                  <p className="text-xs text-slate-400">{c.file_name}</p>
                </div>
                <ProcessingBadge status={c.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
