import { useEffect, useState } from 'react';
import { fetchCandidate } from '@/lib/data';
import type { Candidate } from '@/lib/types';
import { ScoreRing } from '@/components/ScoreBadge';
import { RecommendationBadge } from '@/components/StatusBadge';
import { SkillTag } from '@/components/SkillTag';
import { ProgressBar } from '@/components/ProgressBar';
import type { PageKey } from '@/components/Sidebar';
import {
  ArrowLeft,
  Mail,
  Phone,
  GraduationCap,
  Briefcase,
  FolderGit2,
  Award,
  Wrench,
  Sparkles,
  FileText,
  AlertCircle,
} from 'lucide-react';

export function CandidateDetails({
  candidateId,
  onBack,
  onNavigate,
}: {
  candidateId: string;
  onBack: () => void;
  onNavigate: (page: PageKey) => void;
}) {
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const c = await fetchCandidate(candidateId);
        setCandidate(c);
        if (!c) setError('Candidate not found.');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load candidate.');
      } finally {
        setLoading(false);
      }
    })();
  }, [candidateId]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-sm text-slate-400">Loading candidate…</div>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <AlertCircle className="mx-auto h-8 w-8 text-rose-500" />
        <p className="mt-2 text-sm text-slate-600">{error ?? 'Candidate not found.'}</p>
        <button onClick={onBack} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
          <ArrowLeft className="h-4 w-4" /> Back to Ranking
        </button>
      </div>
    );
  }

  if (candidate.status === 'error') {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <button onClick={onBack} className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" /> Back to Ranking
        </button>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-rose-500" />
          <h3 className="mt-2 text-lg font-semibold text-rose-900">Processing Failed</h3>
          <p className="mt-1 text-sm text-rose-700">{candidate.error_message ?? 'Unknown error.'}</p>
          <p className="mt-1 text-xs text-rose-500">File: {candidate.file_name}</p>
          <button onClick={() => onNavigate('upload')} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
            Try Another Resume
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Back to Ranking
      </button>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-lg font-bold text-white">
                {candidate.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="truncate text-xl font-bold text-slate-900">{candidate.name}</h1>
                <p className="truncate text-sm text-slate-400">{candidate.file_name}</p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {candidate.email && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span className="truncate">{candidate.email}</span>
                </div>
              )}
              {candidate.phone && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <span>{candidate.phone}</span>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 font-semibold text-slate-900">
              <Wrench className="h-4.5 w-4.5 text-slate-500" /> Skills
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {candidate.skills.length === 0 && <p className="text-sm text-slate-400">No skills detected.</p>}
              {candidate.skills.map((s) => (
                <SkillTag key={s} skill={s} />
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 font-semibold text-slate-900">
              <GraduationCap className="h-4.5 w-4.5 text-slate-500" /> Education
            </h2>
            <div className="mt-3 space-y-3">
              {candidate.education.length === 0 && <p className="text-sm text-slate-400">No education entries detected.</p>}
              {candidate.education.map((e, i) => (
                <div key={i} className="border-l-2 border-slate-200 pl-3">
                  <p className="text-sm font-medium text-slate-900">{e.degree || 'Degree'}</p>
                  <p className="text-xs text-slate-500">{e.institution}</p>
                  {e.year && <p className="text-xs text-slate-400">{e.year}</p>}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 font-semibold text-slate-900">
              <Award className="h-4.5 w-4.5 text-slate-500" /> Certifications
            </h2>
            <div className="mt-3 space-y-2">
              {candidate.certifications.length === 0 && <p className="text-sm text-slate-400">No certifications detected.</p>}
              {candidate.certifications.map((c, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-slate-600">
                  <Award className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                  {c}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
              <ScoreRing score={candidate.match_score} recommendation={candidate.recommendation} />
              <div className="flex-1">
                <p className="text-sm font-medium uppercase tracking-wide text-slate-400">AI Match Analysis</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {candidate.match_score.toFixed(2)} / 10
                </p>
                <div className="mt-2">
                  <RecommendationBadge recommendation={candidate.recommendation} />
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ProgressBar label="Skills Match" value={candidate.skills_match_pct} />
              <ProgressBar label="Experience Match" value={candidate.experience_match_pct} />
              <ProgressBar label="Education Match" value={candidate.education_match_pct} />
              <ProgressBar label="Project Match" value={candidate.project_match_pct} />
              <ProgressBar label="Semantic Match" value={candidate.semantic_match_pct} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-semibold text-emerald-700">Matching Skills</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {candidate.matching_skills.length === 0 && <p className="text-sm text-slate-400">No matching skills.</p>}
                {candidate.matching_skills.map((s) => (
                  <SkillTag key={s} skill={s} variant="matched" />
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-semibold text-rose-700">Missing Skills</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {candidate.missing_skills.length === 0 && <p className="text-sm text-slate-400">No missing skills — full coverage.</p>}
                {candidate.missing_skills.map((s) => (
                  <SkillTag key={s} skill={s} variant="missing" />
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 font-semibold text-slate-900">
              <Sparkles className="h-4.5 w-4.5 text-amber-500" /> AI Strengths
            </h2>
            <ul className="mt-3 space-y-2">
              {candidate.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                  <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                  {s}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 font-semibold text-slate-900">
              <FileText className="h-4.5 w-4.5 text-slate-500" /> AI Justification
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{candidate.justification}</p>
            {candidate.experience_match_text && (
              <p className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Experience: </span>
                {candidate.experience_match_text}
              </p>
            )}
            {candidate.education_match_text && (
              <p className="mt-1 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Education: </span>
                {candidate.education_match_text}
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 font-semibold text-slate-900">
              <Briefcase className="h-4.5 w-4.5 text-slate-500" /> Experience
            </h2>
            <div className="mt-3 space-y-3">
              {candidate.experience.length === 0 && <p className="text-sm text-slate-400">No experience entries detected.</p>}
              {candidate.experience.map((e, i) => (
                <div key={i} className="border-l-2 border-slate-200 pl-3">
                  <p className="text-sm font-medium text-slate-900">{e.role}</p>
                  {e.company && <p className="text-xs text-slate-500">{e.company}</p>}
                  {e.duration && <p className="text-xs text-slate-400">{e.duration}</p>}
                  {e.summary && <p className="mt-1 text-xs text-slate-500">{e.summary}</p>}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 font-semibold text-slate-900">
              <FolderGit2 className="h-4.5 w-4.5 text-slate-500" /> Projects
            </h2>
            <div className="mt-3 space-y-3">
              {candidate.projects.length === 0 && <p className="text-sm text-slate-400">No projects detected.</p>}
              {candidate.projects.map((p, i) => (
                <div key={i} className="border-l-2 border-slate-200 pl-3">
                  <p className="text-sm font-medium text-slate-900">{p.name}</p>
                  {p.description && <p className="mt-1 text-xs text-slate-500">{p.description}</p>}
                  {p.technologies.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {p.technologies.map((t) => (
                        <span key={t} className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
