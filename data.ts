import { supabase } from './supabase';
import { SAMPLE_CANDIDATES, SAMPLE_JOB } from './sampleData';
import { extractStructuredResume } from './extractor';
import { scoreCandidate, type LlmOverride } from './scorer';
import { llmExtractResume, llmSemanticMatch } from './llm';
import type { Candidate, Job, MatchResult, Recommendation, StructuredResume } from './types';

export async function ensureSeedData(): Promise<void> {
  const { data: existingJobs } = await supabase.from('jobs').select('id').limit(1);
  if (existingJobs && existingJobs.length > 0) return;

  const { data: jobRow, error: jobErr } = await supabase
    .from('jobs')
    .insert(SAMPLE_JOB)
    .select()
    .maybeSingle();
  if (jobErr || !jobRow) {
    console.error('Failed to seed job', jobErr);
    return;
  }

  const rows = SAMPLE_CANDIDATES.map((c) => ({
    ...c,
    job_id: jobRow.id,
    recommendation: c.recommendation as Recommendation,
  }));
  const { error } = await supabase.from('candidates').insert(rows);
  if (error) console.error('Failed to seed candidates', error);
}

export async function fetchJobs(): Promise<Job[]> {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Job[];
}

export async function fetchActiveJob(): Promise<Job | null> {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as Job | null;
}

export async function saveJob(input: Omit<Job, 'id' | 'created_at'>): Promise<Job> {
  const { data, error } = await supabase
    .from('jobs')
    .insert(input)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data as Job;
}

export async function fetchCandidates(jobId: string): Promise<Candidate[]> {
  const { data, error } = await supabase
    .from('candidates')
    .select('*')
    .eq('job_id', jobId)
    .order('match_score', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Candidate[];
}

export async function fetchCandidate(id: string): Promise<Candidate | null> {
  const { data, error } = await supabase
    .from('candidates')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as Candidate | null;
}

export async function deleteCandidate(id: string): Promise<void> {
  const { error } = await supabase.from('candidates').delete().eq('id', id);
  if (error) throw error;
}

export async function createProcessingCandidate(jobId: string, fileName: string, candidateName: string): Promise<Candidate> {
  const { data, error } = await supabase
    .from('candidates')
    .insert({
      job_id: jobId,
      name: candidateName,
      file_name: fileName,
      status: 'processing',
      recommendation: 'REVIEW',
    })
    .select()
    .maybeSingle();
  if (error) throw error;
  return data as Candidate;
}

export async function processResume(jobId: string, file: File): Promise<Candidate> {
  const initialName = file.name.replace(/\.pdf$/i, '').replace(/[_-]+/g, ' ');
  const candidate = await createProcessingCandidate(jobId, file.name, initialName);

  try {
    const { extractTextFromPdf } = await import('./pdf');
    const rawText = await extractTextFromPdf(file);
    if (!rawText || rawText.trim().length < 20) {
      throw new Error('The resume appears to be empty or could not be parsed.');
    }

    const job = await fetchActiveJob();
    if (!job) throw new Error('No active job description found. Please create a job first.');

    const deterministic: StructuredResume = extractStructuredResume(rawText, file.name);

    const llmExtraction = await llmExtractResume(rawText, file.name);
    const structured: StructuredResume = llmExtraction.usedLlm && llmExtraction.data
      ? {
          name: llmExtraction.data.name ?? deterministic.name,
          email: llmExtraction.data.email ?? deterministic.email,
          phone: llmExtraction.data.phone ?? deterministic.phone,
          skills: llmExtraction.data.skills?.length ? llmExtraction.data.skills : deterministic.skills,
          education: llmExtraction.data.education?.length ? llmExtraction.data.education : deterministic.education,
          experience: llmExtraction.data.experience?.length ? llmExtraction.data.experience : deterministic.experience,
          projects: llmExtraction.data.projects?.length ? llmExtraction.data.projects : deterministic.projects,
          certifications: llmExtraction.data.certifications?.length ? llmExtraction.data.certifications : deterministic.certifications,
        }
      : deterministic;

    const llmMatch = await llmSemanticMatch(structured, job);
    const llmOverride: LlmOverride | undefined = llmMatch.usedLlm && llmMatch.semanticScore !== null
      ? {
          semanticScore: llmMatch.semanticScore,
          matchingSkills: llmMatch.match?.matchingSkills,
          missingSkills: llmMatch.match?.missingSkills,
          strengths: llmMatch.match?.strengths,
          experienceMatch: llmMatch.match?.experienceMatch,
          educationMatch: llmMatch.match?.educationMatch,
          recommendation: llmMatch.match?.recommendation,
          justification: llmMatch.match?.justification,
        }
      : undefined;

    const result: MatchResult = scoreCandidate(structured, job, llmOverride);

    const { error: updateErr } = await supabase
      .from('candidates')
      .update({
        name: structured.name,
        email: structured.email ?? null,
        phone: structured.phone ?? null,
        raw_text: rawText,
        skills: structured.skills,
        education: structured.education,
        experience: structured.experience,
        projects: structured.projects,
        certifications: structured.certifications,
        match_score: result.score,
        skills_match_pct: result.skillsMatchPct,
        experience_match_pct: result.experienceMatchPct,
        education_match_pct: result.educationMatchPct,
        project_match_pct: result.projectMatchPct,
        semantic_match_pct: result.semanticMatchPct,
        matching_skills: result.matchingSkills,
        missing_skills: result.missingSkills,
        strengths: result.strengths,
        experience_match_text: result.experienceMatch,
        education_match_text: result.educationMatch,
        recommendation: result.recommendation,
        justification: result.justification,
        status: 'ready',
        error_message: null,
      })
      .eq('id', candidate.id);
    if (updateErr) throw updateErr;

    const updated = await fetchCandidate(candidate.id);
    return updated ?? candidate;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to process resume.';
    await supabase
      .from('candidates')
      .update({ status: 'error', error_message: message })
      .eq('id', candidate.id);
    const updated = await fetchCandidate(candidate.id);
    return updated ?? candidate;
  }
}
