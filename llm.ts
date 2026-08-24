import type { Job, MatchResult, StructuredResume } from './types';

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/resume-screener`;

interface LlmResponse {
  error?: string;
  llmAvailable?: boolean;
  extraction?: Partial<StructuredResume>;
  match?: {
    semanticScore?: number;
    matchingSkills?: string[];
    missingSkills?: string[];
    strengths?: string[];
    experienceMatch?: string;
    educationMatch?: string;
    recommendation?: string;
    justification?: string;
  };
}

function authHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
  };
}

export interface LlmExtractionResult {
  usedLlm: boolean;
  data: Partial<StructuredResume> | null;
}

export async function llmExtractResume(resumeText: string, fileName: string): Promise<LlmExtractionResult> {
  try {
    const response = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ action: 'extract', resumeText, fileName }),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as LlmResponse;
      if (body.llmAvailable === false) return { usedLlm: false, data: null };
      throw new Error(body.error ?? `Extraction failed (${response.status})`);
    }

    const body = (await response.json()) as LlmResponse;
    if (body.llmAvailable === false || !body.extraction) {
      return { usedLlm: false, data: null };
    }
    return { usedLlm: true, data: body.extraction };
  } catch {
    return { usedLlm: false, data: null };
  }
}

export interface LlmMatchResult {
  usedLlm: boolean;
  semanticScore: number | null;
  match: Partial<MatchResult> | null;
}

export async function llmSemanticMatch(resume: StructuredResume, job: Job): Promise<LlmMatchResult> {
  try {
    const response = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        action: 'match',
        resume: {
          name: resume.name,
          skills: resume.skills,
          education: resume.education,
          experience: resume.experience,
          projects: resume.projects,
          certifications: resume.certifications,
        },
        job: {
          title: job.title,
          description: job.description,
          required_skills: job.required_skills,
          min_experience_years: job.min_experience_years,
        },
      }),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as LlmResponse;
      if (body.llmAvailable === false) return { usedLlm: false, semanticScore: null, match: null };
      throw new Error(body.error ?? `Match failed (${response.status})`);
    }

    const body = (await response.json()) as LlmResponse;
    if (body.llmAvailable === false || !body.match) {
      return { usedLlm: false, semanticScore: null, match: null };
    }

    const m = body.match;
    const semanticScore = typeof m.semanticScore === 'number'
      ? Math.max(0, Math.min(100, Math.round(m.semanticScore)))
      : null;

    return {
      usedLlm: true,
      semanticScore,
      match: {
        matchingSkills: m.matchingSkills,
        missingSkills: m.missingSkills,
        strengths: m.strengths,
        experienceMatch: m.experienceMatch,
        educationMatch: m.educationMatch,
        recommendation: (m.recommendation as MatchResult['recommendation']) ?? undefined,
        justification: m.justification,
      },
    };
  } catch {
    return { usedLlm: false, semanticScore: null, match: null };
  }
}
